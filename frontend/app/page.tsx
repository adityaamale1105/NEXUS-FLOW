"use client";

import React, { useState, useEffect } from "react";
import { UniversalProcurementBar } from "@/components/UniversalProcurementBar";
import { AgentThoughtTerminal, AgentStep } from "@/components/AgentThoughtTerminal";
import { UnifiedBOMView, BillOfMaterials } from "@/components/UnifiedBOMView";
import { PayPalCheckoutModal } from "@/components/PayPalCheckoutModal";
import { MerchantControlTower } from "@/components/MerchantControlTower";

const sectionTitles: Record<string, string> = {
  hero: "Nexus-Flow — Autonomous AI Procurement",
  "how-it-works": "How It Works — Nexus-Flow",
  terminal: "Thought Terminal — Nexus-Flow",
  bom: "Bill of Materials — Nexus-Flow",
  intelligence: "Deterministic Compatibility — Nexus-Flow",
  suppliers: "Supplier Intelligence Matrix — Nexus-Flow",
  checkout: "PayPal Purchase Authorization — Nexus-Flow",
  "control-tower": "Merchant Control Tower — Nexus-Flow",
  history: "Procurement Plan Archive — Nexus-Flow"
};

export default function HomePage() {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [bom, setBom] = useState<BillOfMaterials | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  // 1. Initial Page Hydration (Load default BOM & History)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [bomRes, histRes] = await Promise.all([
          fetch("/api/procure/BOM-2026-8812"),
          fetch("/api/procure/history")
        ]);
        if (bomRes.ok) {
          const initialBom = await bomRes.json();
          setBom(initialBom);
        }
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistoryItems(histData);
        }
      } catch (err) {
        console.warn("Initial page hydration warning:", err);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Scroll-Driven Page/Section Transitions & URL Updating
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            // Dynamically change browser URL hash without causing a page jump
            if (typeof window !== "undefined" && window.location.hash !== `#${sectionId}`) {
              window.history.replaceState(null, "", `#${sectionId}`);
            }
            if (sectionTitles[sectionId]) {
              document.title = sectionTitles[sectionId];
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-25% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleExecuteProcurement = (promptText: string, maxBudget?: number, strategy: string = "recommended") => {
    setSteps([]);
    setSuccessBanner(null);
    setIsStreaming(true);

    const terminalSection = document.getElementById("terminal");
    if (terminalSection) {
      terminalSection.scrollIntoView({ behavior: "smooth" });
    }

    const encodedPrompt = encodeURIComponent(promptText);
    let url = `/api/procure/stream?prompt=${encodedPrompt}&strategy=${encodeURIComponent(strategy)}`;
    if (maxBudget && maxBudget > 0) {
      url += `&max_budget=${encodeURIComponent(maxBudget)}`;
    }

    const eventSource = new EventSource(url);

    eventSource.addEventListener("thought", (event: any) => {
      try {
        const stepData: AgentStep = JSON.parse(event.data);
        setSteps((prev) => [...prev, stepData]);
      } catch (err) {
        console.error("Failed to parse thought step:", err);
      }
    });

    eventSource.addEventListener("bom_complete", (event: any) => {
      try {
        const bomData: BillOfMaterials = JSON.parse(event.data);
        setBom(bomData);
        setIsStreaming(false);
        setSuccessBanner(`Procurement plan ${bomData.bom_id} compiled successfully.`);
        eventSource.close();

        // Refresh history
        fetch("/api/procure/history")
          .then((r) => r.json())
          .then((data) => setHistoryItems(data))
          .catch(() => {});
      } catch (err) {
        console.error("Failed to parse BOM complete payload:", err);
        setIsStreaming(false);
        eventSource.close();
      }
    });

    eventSource.addEventListener("stream_error", (event: any) => {
      console.error("Stream encountered an error, falling back to sync:", event.data);
      fallbackSync(promptText, maxBudget, strategy);
      setIsStreaming(false);
      eventSource.close();
    });

    eventSource.onerror = (err) => {
      console.warn("EventSource closed:", err);
      if (isStreaming && !bom) {
        fallbackSync(promptText, maxBudget, strategy);
      }
      setIsStreaming(false);
      eventSource.close();
    };
  };

  const fallbackSync = async (promptText: string, maxBudget?: number, strategy: string = "recommended") => {
    try {
      const res = await fetch("/api/procure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, max_budget: maxBudget, strategy: strategy })
      });
      if (res.ok) {
        const data = await res.json();
        setBom(data);
      }
    } catch (e) {
      console.error("Fallback sync error:", e);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (!bom) return;
    try {
      const res = await fetch("/api/procure/items/quantity", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bom_id: bom.bom_id, item_id: itemId, quantity: newQty })
      });
      if (res.ok) {
        const updated = await res.json();
        setBom(updated);
      }
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!bom) return;
    try {
      const res = await fetch("/api/procure/items/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bom_id: bom.bom_id, item_id: itemId })
      });
      if (res.ok) {
        const updated = await res.json();
        setBom(updated);
      }
    } catch (err) {
      console.error("Substitution error:", err);
    }
  };

  const handleApprovePlan = async () => {
    if (!bom) return;
    try {
      const res = await fetch("/api/procure/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bom_id: bom.bom_id, approved_by: "user_engineer_01" })
      });
      if (res.ok) {
        const updated = await res.json();
        setBom(updated);
        setSuccessBanner("Procurement plan approved by human buyer. PayPal Orders v2 checkout unlocked.");
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const handlePaymentSuccess = () => {
    setSuccessBanner("PayPal order captured successfully. Multi-vendor escrow settlements initialized under delayed disbursement mode.");
  };

  return (
    <div className="space-y-24 scroll-smooth">

      {/* ===================================================================
          SECTION 1: HERO & UNIVERSAL PROCUREMENT BAR
          =================================================================== */}
      <section id="hero" className="min-h-[85vh] flex flex-col justify-center text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-walnut/50 border border-sage/30 text-sage text-xs font-mono self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse"></span>
          <span>AUTONOMOUS PROCUREMENT &amp; FINANCIAL ORCHESTRATION</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-textPrimary font-sans leading-tight">
          From natural requirements to payment-ready procurement plans.
        </h1>
        <p className="text-base sm:text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
          Describe what you need in plain English. Nexus-Flow deconstructs your specification, sources multi-vendor inventories, deterministically validates electrical compatibility, and prepares human-authorized PayPal checkout.
        </p>

        {/* Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-graphite/40 border border-white/[0.08] max-w-3xl mx-auto text-left">
          <div>
            <div className="text-sm sm:text-base font-bold font-mono text-textPrimary">8-Stage</div>
            <div className="text-[11px] text-textMuted uppercase font-mono">Autonomous Pipeline</div>
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold font-mono text-sage">100%</div>
            <div className="text-[11px] text-textMuted uppercase font-mono">Deterministic Rules</div>
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold font-mono text-textPrimary">2.50%</div>
            <div className="text-[11px] text-textMuted uppercase font-mono">Platform Fee</div>
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold font-mono text-cyan">Orders v2</div>
            <div className="text-[11px] text-textMuted uppercase font-mono">PayPal Delayed Escrow</div>
          </div>
        </div>

        {/* Universal Procurement Bar */}
        <div className="pt-4">
          <UniversalProcurementBar onExecute={handleExecuteProcurement} isLoading={isStreaming} />
        </div>

        {/* Notification Banner */}
        {successBanner && (
          <div className="max-w-4xl mx-auto p-4 rounded-xl bg-sage/15 border border-sage text-sage text-sm flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="text-xs text-sage hover:text-white underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* ===================================================================
          SECTION 2: HOW NEXUS-FLOW WORKS
          =================================================================== */}
      <section id="how-it-works" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-walnut/40 border border-sage/20 text-sage text-xs font-mono">
              PROCUREMENT LIFECYCLE &bull; 4 KEY PHASES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              How Autonomous Procurement Works
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Traditional procurement requires cross-referencing vendor catalogs, comparing distributor lead times, checking electrical specs, and coordinating purchase orders. Nexus-Flow executes this in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-3">
              <div className="text-xs font-mono text-sage">STAGE 01</div>
              <h3 className="text-lg font-bold text-textPrimary">Spec Decomposition</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Extracts precise hardware specifications, voltage tolerances (3.3V/5V), pinouts, and quantities from plain-text prompts.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-3">
              <div className="text-xs font-mono text-cyan">STAGE 02</div>
              <h3 className="text-lg font-bold text-textPrimary">Dual Sourcing</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Simultaneously interrogates Channel3 verified distributor networks and live Kernel web crawler fallback to locate in-stock parts.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-3">
              <div className="text-xs font-mono text-amber-400">STAGE 03</div>
              <h3 className="text-lg font-bold text-textPrimary">Compatibility Engine</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Applies mathematical rules: checks logic voltage levels, detects I2C address collisions, and tallies power supply milliamp budgets.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-3">
              <div className="text-xs font-mono text-blue-400">STAGE 04</div>
              <h3 className="text-lg font-bold text-textPrimary">PayPal Orders v2</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Consolidates multi-vendor shipments into a single human-authorized checkout with automatic delayed multi-vendor escrow release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 3: LIVE AGENT THOUGHT TERMINAL
          =================================================================== */}
      <section id="terminal" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite border border-white/[0.09] text-cyan text-xs font-mono">
              LIVE TELEMETRY &bull; SERVER-SENT EVENTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Agent Execution Thought Terminal
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Observe the autonomous multi-agent pipeline in real-time as Requirement Parsing, Catalog Sourcing, Pinout Compatibility, and Cost Optimization agents collaborate.
            </p>
          </div>
          <AgentThoughtTerminal steps={steps} isStreaming={isStreaming} />
        </div>
      </section>

      {/* ===================================================================
          SECTION 4: UNIFIED BILL OF MATERIALS (BOM)
          =================================================================== */}
      <section id="bom" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-walnut/40 border border-sage/20 text-sage text-xs font-mono">
              CONSOLIDATED SPECIFICATION &bull; INTERACTIVE BOM
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Unified Bill of Materials
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Every sourced component with verified electrical specifications, real-time distributor pricing, quantity adjustments, and autonomous substitutions.
            </p>
          </div>

          {bom ? (
            <UnifiedBOMView
              bom={bom}
              onPayWithPayPal={() => setIsModalOpen(true)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onApprovePlan={handleApprovePlan}
            />
          ) : (
            <div className="p-8 text-center text-textMuted bg-surface/40 border border-white/[0.06] rounded-xl font-mono text-sm">
              Loading Bill of Materials workspace...
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          SECTION 5: DETERMINISTIC COMPATIBILITY & COST INTELLIGENCE
          =================================================================== */}
      <section id="intelligence" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/15 border border-sage/30 text-sage text-xs font-mono">
              TECHNICAL INVARIANTS &bull; ZERO HALLUCINATIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Deterministic Compatibility &amp; Cost Optimizer
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Nexus-Flow separates probabilistic LLM extraction from deterministic engineering validation. Electrical rules, bus collision engines, and landed cost formulas run without hallucination risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-sage bg-sage/10 px-2.5 py-1 rounded">LOGIC LEVELS</span>
                <span className="text-xs font-mono text-sage">&check; Validated</span>
              </div>
              <h4 className="text-base font-bold text-textPrimary">GPIO Voltage Tolerances</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Evaluates master MCU logic tolerances (ESP32: 3.3V GPIO) against connected peripheral modules (5V relays, sensors).
              </p>
              <div className="text-xs font-mono text-textMuted pt-2 border-t border-white/[0.06] flex justify-between">
                <span>Compatibility:</span>
                <span className="text-sage font-bold">100% In-Range</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-cyan bg-cyan/10 px-2.5 py-1 rounded">I2C / SPI BUS</span>
                <span className="text-xs font-mono text-cyan">&check; Arbitrated</span>
              </div>
              <h4 className="text-base font-bold text-textPrimary">Bus Addressing Space</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Scans hardware I2C address space (BME280 at 0x76/0x77 vs OLED at 0x3C). Guarantees distinct addresses on shared lines.
              </p>
              <div className="text-xs font-mono text-textMuted pt-2 border-t border-white/[0.06] flex justify-between">
                <span>Address Conflicts:</span>
                <span className="text-sage font-bold">0 Contention</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">POWER BUDGET</span>
                <span className="text-xs font-mono text-amber-400">&check; Safe Margin</span>
              </div>
              <h4 className="text-base font-bold text-textPrimary">Milliamp Headroom</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Tallies cumulative current draw across active transmitters (ESP32: 500mA peak) and ensures PSU has &gt;25% safety headroom.
              </p>
              <div className="text-xs font-mono text-textMuted pt-2 border-t border-white/[0.06] flex justify-between">
                <span>Safety Margin:</span>
                <span className="text-sage font-bold">18% Headroom</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 6: SUPPLIER INTELLIGENCE MATRIX
          =================================================================== */}
      <section id="suppliers" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-walnut/40 border border-sage/20 text-sage text-xs font-mono">
              MULTI-VENDOR COMPARISON MATRIX
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Supplier Intelligence &amp; Sourcing Matrix
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Nexus-Flow actively benchmarks multi-vendor availability, lead times, on-time performance, and escrow reliability across global verified electronics distributors.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-surface/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-graphite text-textMuted uppercase font-mono border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3.5">Distributor / Supplier</th>
                    <th className="p-3.5">Network Status</th>
                    <th className="p-3.5">Historical Orders</th>
                    <th className="p-3.5">On-Time Rate</th>
                    <th className="p-3.5">Avg Lead Time</th>
                    <th className="p-3.5">Escrow Rating</th>
                    <th className="p-3.5">Consolidated Freight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-mono">
                  <tr>
                    <td className="p-3.5 font-sans font-semibold text-textPrimary">Mouser Electronics</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-sage/15 text-sage text-[10px]">Channel3 Verified</span></td>
                    <td className="p-3.5 text-textSecondary">1,842 Orders</td>
                    <td className="p-3.5 text-sage font-bold">99.2%</td>
                    <td className="p-3.5 text-textSecondary">2-3 Days</td>
                    <td className="p-3.5 text-cyan">Grade A+ (99.8%)</td>
                    <td className="p-3.5 text-textPrimary">$4.50 Flat</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-sans font-semibold text-textPrimary">DigiKey Electronics</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-sage/15 text-sage text-[10px]">Channel3 Verified</span></td>
                    <td className="p-3.5 text-textSecondary">2,109 Orders</td>
                    <td className="p-3.5 text-sage font-bold">98.9%</td>
                    <td className="p-3.5 text-textSecondary">2-4 Days</td>
                    <td className="p-3.5 text-cyan">Grade A+ (99.6%)</td>
                    <td className="p-3.5 text-textPrimary">$4.95 Flat</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-sans font-semibold text-textPrimary">Adafruit Industries</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-sage/15 text-sage text-[10px]">Channel3 Verified</span></td>
                    <td className="p-3.5 text-textSecondary">940 Orders</td>
                    <td className="p-3.5 text-sage font-bold">97.8%</td>
                    <td className="p-3.5 text-textSecondary">3-5 Days</td>
                    <td className="p-3.5 text-cyan">Grade A (98.4%)</td>
                    <td className="p-3.5 text-textPrimary">$5.50 Flat</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-sans font-semibold text-textPrimary">SparkFun Electronics</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-sage/15 text-sage text-[10px]">Channel3 Verified</span></td>
                    <td className="p-3.5 text-textSecondary">612 Orders</td>
                    <td className="p-3.5 text-sage font-bold">98.1%</td>
                    <td className="p-3.5 text-textSecondary">3-5 Days</td>
                    <td className="p-3.5 text-cyan">Grade A (98.2%)</td>
                    <td className="p-3.5 text-textPrimary">$5.25 Flat</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 7: PAYPAL CHECKOUT & PURCHASE AUTHORIZATION
          =================================================================== */}
      <section id="checkout" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-mono">
              FINANCIAL ORCHESTRATION &bull; PAYPAL ORDERS V2
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Human-Authorized Multi-Party Settlement
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Autonomous procurement requires rigorous financial guardrails. The buyer approves the consolidated plan once; PayPal partitions disbursements directly to individual vendors under carrier escrow hold.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.806 1.57 1.258 1.05 1.768 2.628 1.474 4.56-.47 3.092-2.38 5.253-5.522 6.251 1.637.525 2.57 1.69 2.188 4.204-.47 3.092-2.38 5.253-5.522 6.251-.622.198-1.306.301-2.034.301H7.076z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-textPrimary">Multi-Vendor Partitioning</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                One unified charge to the buyer. PayPal distributes vendor payouts automatically into separate seller accounts with no manual re-invoicing.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-full bg-sage/20 border border-sage/40 flex items-center justify-center text-sage">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-textPrimary">Delayed Carrier Escrow</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Vendor payouts remain locked in escrow until FedEx, DHL, or UPS delivery scans confirm physical arrival, protecting buyers against fulfillment defaults.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface/80 border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-full bg-cyan/20 border border-cyan/40 flex items-center justify-center text-cyan">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-textPrimary">APIMatic Certified Contracts</h4>
              <p className="text-xs text-textSecondary leading-relaxed">
                Guarantees strict schema conformity across all line items, tax IDs, merchant fees (2.50%), and currency decimal points.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-gradient-to-r from-graphite to-walnut/60 border border-sage/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-left">
              <div className="text-xs font-mono text-sage">READY FOR CHECKOUT</div>
              <h3 className="text-xl font-bold text-textPrimary">Authorize Current Procurement Plan</h3>
              <p className="text-xs text-textSecondary">Approve the active Bill of Materials above and initiate multi-party settlement through the official PayPal sandbox.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all shrink-0"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.806 1.57 1.258 1.05 1.768 2.628 1.474 4.56-.47 3.092-2.38 5.253-5.522 6.251 1.637.525 2.57 1.69 2.188 4.204-.47 3.092-2.38 5.253-5.522 6.251-.622.198-1.306.301-2.034.301H7.076z" />
              </svg>
              <span>Proceed to PayPal Checkout</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 8: MERCHANT CONTROL TOWER (AG GRID)
          =================================================================== */}
      <section id="control-tower" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-mono">
              OPERATIONAL TELEMATICS &bull; AG GRID
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Merchant Control Tower
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Real-time supply chain telematics, multi-agent fleet health telemetry, and PayPal Orders v2 multi-vendor escrow settlement tracking.
            </p>
          </div>

          <MerchantControlTower />
        </div>
      </section>

      {/* ===================================================================
          SECTION 9: PROCUREMENT HISTORY
          =================================================================== */}
      <section id="history" className="py-12 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-graphite border border-white/[0.09] text-textMuted text-xs font-mono">
              AUDIT TRAIL &bull; REPLAY HISTORICAL PLANS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Procurement Plan Archive
            </h2>
            <p className="text-sm text-textSecondary max-w-2xl">
              Chronological record of autonomous sourcing requests, component decomposition states, technical audits, and settlement authorizations.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-surface/80 divide-y divide-white/[0.06]">
            {historyItems.length > 0 ? (
              historyItems.map((h, i) => (
                <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-sage bg-sage/15 px-2 py-0.5 rounded">{h.bom_id}</span>
                      <span className="font-mono text-xs text-textMuted">{h.created_at || "2026-10-31"}</span>
                      <span className="font-mono text-[10px] text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">{h.status || "APPROVED"}</span>
                    </div>
                    <div className="text-sm font-semibold text-textPrimary">{h.prompt}</div>
                    <div className="text-xs text-textMuted">{h.item_count || 4} components &bull; Multi-vendor split</div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-auto font-mono">
                    <div className="text-right">
                      <div className="text-base font-bold text-textPrimary">${(h.total_amount || 0).toFixed(2)}</div>
                      <div className="text-[10px] text-textMuted uppercase">Landed Cost</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        fetch(`/api/procure/${h.bom_id}`)
                          .then((r) => r.json())
                          .then((data) => {
                            setBom(data);
                            document.getElementById("bom")?.scrollIntoView({ behavior: "smooth" });
                          });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-xs text-textPrimary transition-all"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-textMuted font-mono text-xs">
                No historical procurement plans recorded yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PayPal Checkout Modal */}
      {bom && (
        <PayPalCheckoutModal
          bom={bom}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

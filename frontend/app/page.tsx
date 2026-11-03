"use client";

import React, { useState } from "react";
import { UniversalProcurementBar } from "@/components/UniversalProcurementBar";
import { AgentThoughtTerminal, AgentStep } from "@/components/AgentThoughtTerminal";
import { UnifiedBOMView, BillOfMaterials } from "@/components/UnifiedBOMView";
import { PayPalCheckoutModal } from "@/components/PayPalCheckoutModal";

export default function HomePage() {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [bom, setBom] = useState<BillOfMaterials | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleExecuteProcurement = (promptText: string, maxBudget?: number, strategy: string = "recommended") => {
    setSteps([]);
    setBom(null);
    setSuccessBanner(null);
    setIsStreaming(true);

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
        eventSource.close();
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
      const res = await fetch(`/api/procure/${bom.bom_id}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty })
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
      const res = await fetch(`/api/procure/${bom.bom_id}/items/${itemId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const updated = await res.json();
        setBom(updated);
      }
    } catch (err) {
      console.error("Remove item error:", err);
    }
  };

  const handleApprovePlan = async () => {
    if (!bom) return;
    try {
      const res = await fetch(`/api/procure/${bom.bom_id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        setBom({ ...bom, is_approved: true, status: "approved" });
        setSuccessBanner("Procurement plan approved by human buyer. PayPal Orders v2 checkout unlocked.");
      }
    } catch (err) {
      console.error("Approval error:", err);
    }
  };

  const handlePaymentSuccess = (details: any) => {
    setSuccessBanner("PayPal order captured successfully. Multi-vendor escrow settlements initialized under delayed disbursement mode.");
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 md:pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-walnut/40 border border-sage/20 text-sage text-xs font-mono">
          <span>AUTONOMOUS PROCUREMENT INTELLIGENCE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-textPrimary font-sans">
          From complex requirements to intelligent procurement.
        </h1>
        <p className="text-sm sm:text-base text-textSecondary max-w-2xl mx-auto leading-relaxed">
          Describe what you need. Nexus-Flow finds the right products, validates compatibility, optimizes supplier costs and prepares your purchase.
        </p>
      </div>

      {/* Universal Procurement Bar */}
      <UniversalProcurementBar onExecute={handleExecuteProcurement} isLoading={isStreaming} />

      {/* Explanatory Banner */}
      <div className="max-w-4xl mx-auto text-center p-4 rounded-xl bg-walnut/20 border border-sage/20">
        <div className="text-sm font-semibold text-textPrimary">
          One request. Multiple suppliers. One intelligent procurement workflow.
        </div>
        <div className="text-xs text-textMuted mt-1">
          Automated specification parsing, Channel3 distributor lookups, Kernel deep crawls, deterministic voltage checks, and unified PayPal Orders v2 execution.
        </div>
      </div>

      {/* Success Notification Banner */}
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

      {/* Interactive Agent Thought Terminal */}
      <AgentThoughtTerminal steps={steps} isStreaming={isStreaming} />

      {/* Unified Bill of Materials (BOM) View */}
      {bom && (
        <UnifiedBOMView
          bom={bom}
          onPayWithPayPal={() => setIsModalOpen(true)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onApprovePlan={handleApprovePlan}
        />
      )}

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

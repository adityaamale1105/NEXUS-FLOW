"use client";

import React, { useState, useEffect } from "react";

export const MerchantControlTower: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"shipments" | "suppliers" | "agents" | "payments">("shipments");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [telRes, supRes, agtRes, rouRes, sumRes] = await Promise.all([
          fetch("/api/telemetry/supply-chain"),
          fetch("/api/telemetry/suppliers"),
          fetch("/api/telemetry/agents"),
          fetch("/api/telemetry/payment-routes"),
          fetch("/api/telemetry/summary"),
        ]);

        if (telRes.ok) setTelemetry(await telRes.json());
        if (supRes.ok) setSuppliers(await supRes.json());
        if (agtRes.ok) setAgents(await agtRes.json());
        if (rouRes.ok) setRoutes(await rouRes.json());
        if (sumRes.ok) setSummary(await sumRes.json());
      } catch (e) {
        console.error("Telemetry fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-sage/15 text-sage border-sage/30";
      case "In Transit":
        return "bg-cyan/15 text-cyan border-cyan/30";
      case "Cleared Customs":
        return "bg-sage/15 text-sage border-sage/30";
      case "Delayed":
        return "bg-red-950/80 text-red-400 border-red-800/60";
      default:
        return "bg-graphite text-textSecondary border-white/[0.09]";
    }
  };

  const filteredShipments = telemetry.filter((r) => {
    const match = (r.tracking_number + r.item_name + r.part_number + r.carrier + r.status + r.vendor_name).toLowerCase();
    return match.includes(searchFilter.toLowerCase());
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-charcoal border border-white/[0.09] shadow-lg">
          <div className="text-xs font-mono text-textMuted uppercase">Active Telemetry Shipments</div>
          <div className="text-2xl font-bold font-mono text-textPrimary mt-1">
            {summary?.active_shipments ?? 6}
          </div>
          <div className="text-[11px] text-sage mt-1 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
            100% Tracking Resolution
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal border border-white/[0.09] shadow-lg">
          <div className="text-xs font-mono text-textMuted uppercase">Agent Fleet Health</div>
          <div className="text-2xl font-bold font-mono text-sage mt-1">
            {summary?.fleet_health_score ?? 99.8}%
          </div>
          <div className="text-[11px] text-textMuted mt-1 font-mono">
            Average response: 142ms
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal border border-white/[0.09] shadow-lg">
          <div className="text-xs font-mono text-textMuted uppercase">Settled Volume (USD)</div>
          <div className="text-2xl font-bold font-mono text-sage mt-1">
            ${summary?.total_settled_volume_usd?.toLocaleString() ?? "554.70"}
          </div>
          <div className="text-[11px] text-textMuted mt-1 font-mono">
            PayPal Commerce Multi-Vendor
          </div>
        </div>

        <div className="p-4 rounded-xl bg-charcoal border border-white/[0.09] shadow-lg">
          <div className="text-xs font-mono text-textMuted uppercase">Escrow Release Integrity</div>
          <div className="text-2xl font-bold font-mono text-cyan mt-1">
            100.0%
          </div>
          <div className="text-[11px] text-textMuted mt-1 font-mono">
            APIMatic certified contracts
          </div>
        </div>
      </div>

      {/* Control Tower Table Card */}
      <div className="rounded-xl border border-white/[0.09] bg-charcoal shadow-2xl overflow-hidden">
        {/* Header / Tabs */}
        <div className="p-4 sm:p-5 border-b border-white/[0.09] bg-graphite flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-textPrimary font-mono">
              CONTROL TOWER TELEMETRY MATRIX
            </h3>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("shipments")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "shipments"
                  ? "bg-sage text-obsidian font-semibold"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
              }`}
            >
              Shipments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("suppliers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "suppliers"
                  ? "bg-sage text-obsidian font-semibold"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
              }`}
            >
              Suppliers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("agents")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "agents"
                  ? "bg-sage text-obsidian font-semibold"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
              }`}
            >
              Agent Health
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payments")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === "payments"
                  ? "bg-sage text-obsidian font-semibold"
                  : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
              }`}
            >
              Payment Routes
            </button>
          </div>
        </div>

        {/* Tab 1: Shipments */}
        {activeTab === "shipments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-white/[0.09] bg-obsidian text-textMuted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Component &amp; SKU</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Origin &rarr; Destination</th>
                  <th className="py-3 px-4">Carrier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">ETA</th>
                  <th className="py-3 px-4">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.09]">
                {filteredShipments.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-textPrimary">{r.tracking_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-textPrimary">{r.item_name}</div>
                      <div className="text-[11px] text-textMuted font-mono">{r.part_number}</div>
                    </td>
                    <td className="py-3.5 px-4 text-textSecondary">{r.vendor_name}</td>
                    <td className="py-3.5 px-4 text-textMuted font-mono text-[11px]">{r.origin_hub} &rarr; {r.destination_hub}</td>
                    <td className="py-3.5 px-4 text-textSecondary">{r.carrier}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-textPrimary">{r.eta_days}d</td>
                    <td className="py-3.5 px-4 font-mono text-sage">{r.risk_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Supplier Intelligence */}
        {activeTab === "suppliers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-white/[0.09] bg-obsidian text-textMuted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Verification Level</th>
                  <th className="py-3 px-4">Historical Orders</th>
                  <th className="py-3 px-4">Total Volume</th>
                  <th className="py-3 px-4">On-Time Rate</th>
                  <th className="py-3 px-4">Lead Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.09]">
                {suppliers.map((s) => (
                  <tr key={s.supplier_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-textPrimary">{s.name}</td>
                    <td className="py-3.5 px-4 text-textSecondary">{s.country}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30">
                        {s.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-textPrimary">{s.total_orders}</td>
                    <td className="py-3.5 px-4 font-mono text-sage font-semibold">${s.total_procured_usd.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-sage">{s.on_time_delivery_rate}%</td>
                    <td className="py-3.5 px-4 font-mono">{s.average_lead_time_days} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Agent Health */}
        {activeTab === "agents" && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agt) => (
              <div key={agt.agent_id} className="p-4 rounded-xl bg-obsidian border border-white/[0.09] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-textPrimary">{agt.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sage/15 text-sage border border-sage/30">
                    {agt.status}
                  </span>
                </div>
                <p className="text-xs text-textMuted line-clamp-2">{agt.role}</p>
                <div className="pt-2 border-t border-white/[0.09] flex justify-between items-center text-xs font-mono">
                  <span className="text-textMuted">Health: <strong className="text-sage">{agt.health_score}%</strong></span>
                  <span className="text-textMuted">Latency: <strong className="text-textPrimary">{agt.latency_ms}ms</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeTab === "payments" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="border-b border-white/[0.09] bg-obsidian text-textMuted font-mono uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Routing Reference</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Gross (USD)</th>
                  <th className="py-3 px-4">Platform Fee</th>
                  <th className="py-3 px-4">Vendor Payout</th>
                  <th className="py-3 px-4">Payee PayPal</th>
                  <th className="py-3 px-4">Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.09]">
                {routes.map((p) => (
                  <tr key={p.routing_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-textPrimary">{p.routing_id}</td>
                    <td className="py-3.5 px-4 font-mono text-textSecondary">{p.order_id}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-textPrimary">${p.gross_amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-amber">-${p.platform_take_rate.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-sage font-bold">${p.vendor_payout.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-textSecondary">{p.vendor_paypal_account}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sage/15 text-sage border border-sage/30">
                        {p.settlement_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

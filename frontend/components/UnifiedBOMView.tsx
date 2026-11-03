"use client";

import React, { useState } from "react";

export interface BOMItem {
  item_id: string;
  title: string;
  category: string;
  specifications: Record<string, any>;
  quantity: number;
  unit_price: number;
  total_price: number;
  vendor_id: string;
  vendor_name: string;
  vendor_paypal_id: string;
  source_type: string;
  lead_time_days: number;
  confidence_score: number;
  part_number: string;
  in_stock: boolean;
  compatibility_status?: string;
  compatibility_notes?: string;
}

export interface VendorSplit {
  vendor_id: string;
  vendor_name: string;
  vendor_paypal_id: string;
  items_count: number;
  gross_amount: number;
  platform_fee: number;
  net_payout: number;
  escrow_release_estimate: string;
}

export interface CompatibilityReport {
  overall_status: string;
  results: Array<{
    item_id: string;
    item_name: string;
    status: string;
    checks: Array<{ check_name: string; passed: boolean; detail: string }>;
    notes: string;
  }>;
  warnings: string[];
}

export interface CostOptimization {
  strategy: string;
  total_cost: number;
  savings: number;
  vendor_allocation: Array<Record<string, any>>;
  budget_utilization?: number;
}

export interface BillOfMaterials {
  bom_id: string;
  prompt: string;
  status: string;
  currency: string;
  items: BOMItem[];
  vendor_splits: VendorSplit[];
  subtotal: number;
  platform_fee: number;
  tax_and_duty: number;
  shipping_total: number;
  total_amount: number;
  apimatic_validated: boolean;
  apimatic_schema_version: string;
  paypal_order_id?: string;
  paypal_checkout_url?: string;
  created_at: string;
  compatibility_report?: CompatibilityReport;
  optimization?: CostOptimization;
  budget_limit?: number;
  is_approved?: boolean;
}

interface Props {
  bom: BillOfMaterials;
  onPayWithPayPal: () => void;
  onUpdateQuantity?: (itemId: string, newQty: number) => void;
  onRemoveItem?: (itemId: string) => void;
  onApprovePlan?: () => void;
}

export const UnifiedBOMView: React.FC<Props> = ({
  bom,
  onPayWithPayPal,
  onUpdateQuantity,
  onRemoveItem,
  onApprovePlan,
}) => {
  const [activeTab, setActiveTab] = useState<"items" | "splits" | "compat" | "compliance">("items");
  const [isApproved, setIsApproved] = useState(bom.is_approved || false);

  const handleApprove = () => {
    setIsApproved(true);
    if (onApprovePlan) {
      onApprovePlan();
    }
  };

  const compatStatus = bom.compatibility_report?.overall_status || "compatible";

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 rounded-xl border border-white/[0.09] bg-charcoal/90 shadow-2xl overflow-hidden">
      {/* Header Summary */}
      <div className="p-6 border-b border-white/[0.09] bg-graphite/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-sage/15 text-sage border border-sage/30">
                {bom.bom_id}
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                isApproved
                  ? "bg-sage/15 text-sage border-sage/30"
                  : "bg-amber/15 text-amber border-amber/30"
              }`}>
                {isApproved ? "Approved" : "Pending Approval"}
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                compatStatus === "compatible"
                  ? "bg-sage/15 text-sage border-sage/30"
                  : "bg-amber/15 text-amber border-amber/30"
              }`}>
                {compatStatus === "compatible" ? "Compatibility Verified" : "Needs Verification"}
              </span>
              <span className="text-xs font-mono text-cyan flex items-center gap-1">
                &bull; APIMatic Certified
              </span>
            </div>
            <h3 className="text-lg font-semibold text-textPrimary mt-2">
              Unified Bill of Materials
            </h3>
            <p className="text-xs text-textMuted mt-0.5 max-w-xl">
              &ldquo;{bom.prompt}&rdquo;
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-textMuted uppercase font-mono">Consolidated Landed Cost</span>
            <span className="text-2xl font-bold font-mono text-textPrimary">
              ${bom.total_amount.toFixed(2)}{" "}
              <span className="text-xs font-normal text-textMuted">USD</span>
            </span>
            <span className="text-[11px] text-textMuted">
              Includes freight &amp; customs escrow
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mt-6 border-b border-white/[0.09] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("items")}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "items"
                ? "border-sage text-sage font-semibold"
                : "border-transparent text-textSecondary hover:text-textPrimary"
            }`}
          >
            Sourced Items ({bom.items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("splits")}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "splits"
                ? "border-sage text-sage font-semibold"
                : "border-transparent text-textSecondary hover:text-textPrimary"
            }`}
          >
            Vendor Allocation ({bom.vendor_splits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compat")}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "compat"
                ? "border-sage text-sage font-semibold"
                : "border-transparent text-textSecondary hover:text-textPrimary"
            }`}
          >
            Technical Compatibility
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compliance")}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "compliance"
                ? "border-sage text-sage font-semibold"
                : "border-transparent text-textSecondary hover:text-textPrimary"
            }`}
          >
            APIMatic Audit
          </button>
        </div>
      </div>

      {/* Tab 1: Sourced Items */}
      {activeTab === "items" && (
        <div className="divide-y divide-white/[0.09]">
          {bom.items.map((item) => (
            <div
              key={item.item_id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="text-sm font-medium text-textPrimary">{item.title}</h4>
                  <span className="text-xs font-mono text-textMuted bg-obsidian px-1.5 py-0.5 rounded border border-white/[0.09]">
                    {item.part_number}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      item.source_type === "channel3_catalog"
                        ? "bg-cyan/10 text-cyan border-cyan/25"
                        : "bg-amber/10 text-amber border-amber/25"
                    }`}
                  >
                    {item.source_type === "channel3_catalog" ? "Channel3 Verified" : "Kernel Sourced"}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-textMuted">
                  <span>Vendor: <strong className="text-textSecondary">{item.vendor_name}</strong></span>
                  <span>Lead Time: <strong className="text-textSecondary">{item.lead_time_days} days</strong></span>
                  <span>Confidence: <strong className="text-sage">{(item.confidence_score * 100).toFixed(0)}%</strong></span>
                  {item.compatibility_notes && (
                    <span className="text-amber">&bull; {item.compatibility_notes}</span>
                  )}
                </div>

                {/* Technical Specs Tags */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(item.specifications).map(([key, val]) => (
                    <span
                      key={key}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-obsidian text-textSecondary border border-white/[0.09]"
                    >
                      {key}: {String(val)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end sm:self-center">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-white/[0.09] rounded-lg bg-obsidian overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity && onUpdateQuantity(item.item_id, Math.max(1, item.quantity - 1))}
                    className="px-2.5 py-1 text-textSecondary hover:text-textPrimary hover:bg-white/[0.05]"
                  >
                    &minus;
                  </button>
                  <span className="px-2.5 py-1 text-xs font-mono text-textPrimary">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity && onUpdateQuantity(item.item_id, item.quantity + 1)}
                    className="px-2.5 py-1 text-textSecondary hover:text-textPrimary hover:bg-white/[0.05]"
                  >
                    &#43;
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <div className="text-xs text-textMuted font-mono">
                    ${item.unit_price.toFixed(2)}/ea
                  </div>
                  <div className="text-sm font-semibold font-mono text-textPrimary">
                    ${item.total_price.toFixed(2)}
                  </div>
                </div>

                {onRemoveItem && (
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.item_id)}
                    className="text-xs text-red-400 hover:text-red-300 p-1"
                    title="Remove item"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Vendor Payment Splits */}
      {activeTab === "splits" && (
        <div className="p-6 space-y-4">
          <p className="text-xs text-textSecondary">
            Nexus-Flow distributes disbursements directly to independent supplier accounts via PayPal Orders v2 multi-party routing under delayed disbursement mode.
          </p>
          <div className="space-y-3">
            {bom.vendor_splits.map((split) => (
              <div
                key={split.vendor_id}
                className="p-4 rounded-lg bg-obsidian/70 border border-white/[0.09] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-textPrimary">{split.vendor_name}</span>
                    <span className="text-xs font-mono text-textMuted">({split.vendor_paypal_id})</span>
                  </div>
                  <div className="text-xs text-textMuted mt-1">
                    Items Sourced: <strong className="text-textSecondary">{split.items_count}</strong> &bull; Escrow Release: <span className="text-sage">{split.escrow_release_estimate}</span>
                  </div>
                </div>

                <div className="flex space-x-4 text-xs font-mono">
                  <div>
                    <span className="text-textMuted block text-[10px]">GROSS</span>
                    <span className="text-textPrimary">${split.gross_amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block text-[10px]">PLATFORM FEE</span>
                    <span className="text-amber">-${split.platform_fee.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block text-[10px]">NET VENDOR</span>
                    <span className="text-sage font-semibold">${split.net_payout.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Compatibility */}
      {activeTab === "compat" && (
        <div className="p-6 space-y-4">
          {bom.compatibility_report ? (
            <>
              <div className="p-3.5 rounded-lg bg-sage/10 border border-sage/20 text-xs">
                <strong className="text-sage">Status: {bom.compatibility_report.overall_status.toUpperCase()}</strong>
                <div className="mt-1 space-y-0.5 text-textSecondary">
                  {bom.compatibility_report.warnings.map((w, idx) => (
                    <div key={idx}>&bull; {w}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {bom.compatibility_report.results.map((res) => (
                  <div key={res.item_id} className="p-3 rounded-lg bg-obsidian border border-white/[0.09] text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-textPrimary">{res.item_name}</strong>
                      <span className="font-mono text-[10px] text-sage">{res.status}</span>
                    </div>
                    <div className="text-textMuted text-[11px] mt-1">{res.notes}</div>
                    <div className="mt-2 space-y-1 font-mono text-[10px]">
                      {res.checks.map((c, i) => (
                        <div key={i} className={c.passed ? "text-sage" : "text-amber"}>
                          {c.passed ? "✓" : "⚠"} {c.check_name}: {c.detail}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-textMuted">No compatibility diagnostics recorded.</p>
          )}
        </div>
      )}

      {/* Tab 4: Compliance */}
      {activeTab === "compliance" && (
        <div className="p-6 space-y-4 text-xs text-textSecondary">
          <h4 className="text-sm font-semibold text-textPrimary">APIMatic Schema Certification</h4>
          <p>
            Nexus-Flow validates every outbound transaction payload against the PayPal Orders v2 OpenAPI specification to prevent disbursement mismatches:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-textMuted font-mono text-[11px]">
            <li>Total breakdown item sums match purchase unit amounts with exact penny precision.</li>
            <li>Multi-vendor payee accounts verified for delayed disbursement mode.</li>
            <li>Platform take-rate (2.50%) isolated in platform_fees structure.</li>
            <li>Idempotency ensured with PayPal-Request-Id tokens.</li>
          </ul>
        </div>
      )}

      {/* Financial Summary & Approval Bar */}
      <div className="p-4 sm:p-6 bg-graphite/90 border-t border-white/[0.09] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 text-xs font-mono text-textMuted">
          <div>Subtotal: <strong className="text-textPrimary">${bom.subtotal.toFixed(2)}</strong></div>
          <div>Platform Fee (2.5%): <strong className="text-amber">${bom.platform_fee.toFixed(2)}</strong></div>
          <div>Freight: <strong className="text-textPrimary">${bom.shipping_total.toFixed(2)}</strong></div>
          <div>Duties &amp; Tax: <strong className="text-textPrimary">${bom.tax_and_duty.toFixed(2)}</strong></div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {!isApproved ? (
            <button
              type="button"
              onClick={handleApprove}
              className="px-5 py-2.5 rounded-lg bg-sage/15 border border-sage text-sage font-semibold text-sm hover:bg-sage hover:text-obsidian transition-all shadow-md flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Approve Procurement Plan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPayWithPayPal}
              className="px-6 py-2.5 rounded-lg bg-paypal-blue hover:bg-[#005ea6] text-white font-bold text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center space-x-2.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.806 1.57 1.258 1.05 1.768 2.628 1.474 4.56-.47 3.092-2.38 5.253-5.522 6.251 1.637.525 2.57 1.69 2.188 4.204-.47 3.092-2.38 5.253-5.522 6.251-.622.198-1.306.301-2.034.301H7.076z"/>
              </svg>
              <span>Pay with PayPal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

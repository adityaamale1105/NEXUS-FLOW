"use client";

import React, { useState } from "react";
import { BillOfMaterials } from "./UnifiedBOMView";

interface Props {
  bom: BillOfMaterials;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (details: any) => void;
}

export const PayPalCheckoutModal: React.FC<Props> = ({
  bom,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedData, setCapturedData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthorizeAndCapture = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const orderId = bom.paypal_order_id || `5PL${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          bom_id: bom.bom_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to capture PayPal order: ${response.statusText}`);
      }

      const result = await response.json();
      setCapturedData(result.capture_details);
      onPaymentSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during PayPal settlement.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-charcoal border border-white/[0.09] rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/[0.09] bg-graphite/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-paypal-blue flex items-center justify-center">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.806 1.57 1.258 1.05 1.768 2.628 1.474 4.56-.47 3.092-2.38 5.253-5.522 6.251 1.637.525 2.57 1.69 2.188 4.204-.47 3.092-2.38 5.253-5.522 6.251-.622.198-1.306.301-2.034.301H7.076z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-textPrimary">
                PayPal Orders v2 Checkout
              </h3>
              <p className="text-xs text-textMuted font-mono">
                Sandbox Environment &bull; Multi-Party Delayed Escrow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-textMuted hover:text-textPrimary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!capturedData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-obsidian border border-white/[0.09] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-textMuted">
                  <span>BOM Reference:</span>
                  <span className="text-textPrimary font-semibold">{bom.bom_id}</span>
                </div>
                <div className="flex justify-between text-textMuted">
                  <span>PayPal Order ID:</span>
                  <span className="text-sage">{bom.paypal_order_id || "5PL_SIMULATED"}</span>
                </div>
                <div className="flex justify-between text-textMuted">
                  <span>Authorized Vendors:</span>
                  <span className="text-textSecondary">{bom.vendor_splits.length} Accounts</span>
                </div>
                <div className="flex justify-between text-textMuted">
                  <span>Platform Fee (2.50%):</span>
                  <span className="text-textSecondary">${bom.platform_fee.toFixed(2)} USD</span>
                </div>
                <div className="border-t border-white/[0.09] pt-2 flex justify-between text-sm font-bold text-textPrimary">
                  <span>Total Landed Amount:</span>
                  <span className="text-sage">${bom.total_amount.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Vendor Multi-Party Breakdown */}
              <div>
                <span className="text-xs font-mono uppercase text-textMuted block mb-2">
                  Multi-Vendor Delayed Escrow Allocation:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {bom.vendor_splits.map((split) => (
                    <div
                      key={split.vendor_id}
                      className="p-2.5 rounded-lg bg-obsidian/60 border border-white/[0.09] flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-textSecondary">{split.vendor_name}</span>
                      <span className="text-sage">${split.net_payout.toFixed(2)} USD</span>
                    </div>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-400 text-xs font-mono">
                  {errorMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-sage/15 border border-sage mx-auto flex items-center justify-center text-sage">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-textPrimary">Payment Authorized &amp; Escrow Locked</h4>
              <p className="text-xs text-textSecondary max-w-sm mx-auto">
                Funds successfully transferred to multi-vendor escrow accounts. Disbursement is synchronized with carrier delivery telematics (FedEx, DHL).
              </p>
              <div className="p-3 bg-obsidian rounded-lg border border-white/[0.09] text-xs font-mono text-left space-y-1 mt-4">
                <div className="text-textMuted">Capture Reference: <span className="text-sage">{capturedData.id || "CAP-882910"}</span></div>
                <div className="text-textMuted">Escrow Status: <span className="text-sage">HELD_IN_ESCROW</span></div>
                <div className="text-textMuted">Disbursement Mode: <span className="text-textSecondary">DELAYED_CARRIER_CONFIRMATION</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-graphite/90 border-t border-white/[0.09] flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono text-textSecondary hover:text-textPrimary hover:bg-white/[0.05] transition-colors"
          >
            {capturedData ? "Done" : "Cancel"}
          </button>

          {!capturedData && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleAuthorizeAndCapture}
              className="px-5 py-2 rounded-lg bg-paypal-blue hover:bg-[#005ea6] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Settling...</span>
                </>
              ) : (
                <span>Authorize &amp; Complete Checkout</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.09] bg-obsidian py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 rounded bg-walnut border border-sage/20 flex items-center justify-center text-sage">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <strong className="text-sm text-textPrimary tracking-tight">NEXUS-FLOW</strong>
            </div>
            <p className="text-xs text-textMuted leading-relaxed">
              Autonomous AI-powered procurement and financial orchestration platform. Built for the PayPal AI Hackathon 2026.
            </p>
            <div className="text-[11px] font-mono text-textMuted mt-3">
              Protocol Version: 1.0.0-PROD &bull; Orders v2 Ready
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-textPrimary tracking-wider mb-3">
              Integrations &amp; Protocols
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-textSecondary">PayPal Commerce: Orders v2 Multi-Vendor</li>
              <li className="text-textSecondary">APIMatic: Contract Schema Invariants</li>
              <li className="text-textSecondary">Channel3: B2B Supplier Catalogs</li>
              <li className="text-textSecondary">Kernel: Deep Web Price Discovery</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-textPrimary tracking-wider mb-3">
              Governance &amp; Strategy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/control-tower" className="text-textSecondary hover:text-sage transition-colors">
                  Merchant Control Tower
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-textSecondary hover:text-sage transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-textSecondary hover:text-sage transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:8000/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-textSecondary hover:text-sage transition-colors"
                >
                  OpenAPI Specification
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-textPrimary tracking-wider mb-3">
              Operational Contact
            </h4>
            <p className="text-xs text-textMuted mb-2">Nexus Protocol Engineering Desk</p>
            <div className="font-mono text-xs text-textSecondary space-y-1">
              <div>Email: <a href="mailto:protocol@nexusflow.network" className="text-sage hover:underline">protocol@nexusflow.network</a></div>
              <div>Phone: +1 (800) 555-0199</div>
              <div className="text-[11px] text-textMuted mt-1">Escrow hold: 72 hours standard</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.09] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-textMuted gap-2">
          <div>&copy; 2026 Nexus-Flow Autonomous Commerce Protocol. Built for PayPal &amp; AI Hackathon.</div>
          <div className="font-mono">TLS 1.3 / HSTS Enforced / APIMatic Validated / Orders v2</div>
        </div>
      </div>
    </footer>
  );
};

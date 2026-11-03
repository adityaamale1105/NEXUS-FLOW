import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Nexus-Flow 2026",
  description: "Terms of Service and Autonomous Commerce Agreement for Nexus-Flow Protocol.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans text-slate-300">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
          Legal Agreement &bull; Multi-Vendor Commerce
        </span>
        <h1 className="text-3xl font-bold text-white">Terms and Conditions</h1>
        <p className="text-xs text-slate-500 font-mono">
          Effective Date: January 1, 2026 &bull; Last Revised: October 28, 2026
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          By accessing the Nexus-Flow platform, utilizing the Universal Procurement Bar, or completing checkouts via the integrated PayPal Commerce Platform, you agree to be bound by these Terms and Conditions (&ldquo;Agreement&rdquo;). If you are using this platform on behalf of an enterprise or institution, you warrant that you possess full authority to bind that entity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">2. Autonomous Multi-Agent Procurement</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          Nexus-Flow utilizes automated computational agents to parse user prompts, query distributor databases (Channel3), crawl public pricing indexes (Kernel), and assemble composite Bills of Materials (BOM). While Nexus-Flow enforces strict APIMatic schema validations and distributor verification heuristics, real-time inventory counts and spot market prices are governed by the respective participating suppliers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">3. Multi-Party Payment Processing and Platform Fees</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          All financial settlements are executed through PayPal Commerce Platform Orders v2. Buyers authorize a unified transaction that is programmatically partitioned into distinct purchase units payable to individual hardware suppliers. Nexus-Flow assesses a standard platform take-rate fee of 2.50% on the gross item subtotal, deducted at the time of order disbursement.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">4. Escrow and Carrier Telemetry Release</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          Funds disbursed to merchant accounts may be held in delayed status pending verified carrier telematics. Payouts are automatically unlocked upon confirmation of transit checkpoints or seventy-two (72) hours following carrier delivery confirmation, ensuring buyer protection against non-delivery while protecting supplier rights against unauthorized chargebacks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">5. Limitation of Liability and Arbitration</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          Nexus-Flow is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. In no event shall Nexus-Flow, its hackathon contributors, or supplier partners be liable for indirect, incidental, or consequential damages resulting from hardware misuse, circuit board design errors, or transit carrier delays. Any dispute arising from these terms shall be settled through binding commercial arbitration in accordance with the rules of the American Arbitration Association.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">6. Contact Information</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          For commercial inquiries or legal notices regarding this Agreement:
        </p>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
          <div>Legal Desk: <a href="mailto:legal@nexusflow.network" className="text-blue-400 hover:underline">legal@nexusflow.network</a></div>
          <div>Direct Support: <a href="tel:+18005550199" className="text-blue-400 hover:underline">+1 (800) 555-0199</a></div>
        </div>
      </section>
    </div>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Nexus-Flow 2026",
  description: "Official privacy policy and autonomous data processing protocol for Nexus-Flow autonomous commerce platform.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans text-slate-300">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
          Legal &amp; Data Governance
        </span>
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-mono">
          Effective Date: January 1, 2026 &bull; Last Revised: October 28, 2026
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">1. Overview and Scope</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          Nexus-Flow (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Protocol&rdquo;) operates an autonomous, multi-agent electronic commerce engine designed to decompose complex natural language requirements into technical bills of materials, query catalog distributors, and route commercial settlements via PayPal. This Privacy Policy sets forth our policies regarding the collection, use, and protection of personal and transactional information under applicable data protection frameworks, including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">2. Data We Process</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          To provide multi-agent sourcing and secure payments, we collect and process the following categories of information:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
          <li><strong>Procurement Prompts:</strong> Technical specifications, part numbers, quantity requests, and contextual parameters entered into the procurement bar.</li>
          <li><strong>Authentication Information:</strong> Hashed credentials (salted PBKDF2-SHA256), email addresses, and merchant organizational identifiers. We do not store plaintext passwords.</li>
          <li><strong>Payment &amp; Escrow Tokens:</strong> PayPal Order identifiers, capture tokens, and payee merchant accounts. We do not store primary credit card account numbers (PAN) or CVV codes; all payment processing is performed securely via the PayPal Commerce Platform.</li>
          <li><strong>Supply Chain Telemetry:</strong> Anonymized logistics pings, carrier tracking codes, hub routing timestamps, and package sensory data.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">3. Multi-Agent Reasoning and External Providers</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          When fulfilling procurement queries, technical prompts are transmitted to our catalog providers (Channel3) and web crawlers (Kernel) strictly to verify component pricing, inventory levels, and manufacturer specifications. Prompt data shared with catalog partners contains no personally identifiable buyer details and is limited to technical item parameters.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">4. Data Security and Cryptographic Hardening</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          Nexus-Flow implements enterprise security controls, including TLS 1.3 encryption in transit, strict Content Security Policies (CSP), HTTP Strict Transport Security (HSTS), stateless HMAC-SHA256 authenticated sessions, and granular IP-based rate limiting to protect against automated denial-of-service and injection attacks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">5. User Rights and Data Inquiries</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          Under applicable regulations, buyers and merchants retain the right to access, rectify, export, or delete their account records and associated procurement histories. To exercise these rights, contact the Nexus Data Protection Officer:
        </p>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
          <div>Privacy Desk: <a href="mailto:privacy@nexusflow.network" className="text-blue-400 hover:underline">privacy@nexusflow.network</a></div>
          <div>Direct Compliance Line: <a href="tel:+18005550199" className="text-blue-400 hover:underline">+1 (800) 555-0199</a></div>
          <div>Jurisdiction: Delaware, United States &amp; European Economic Area (EEA)</div>
        </div>
      </section>
    </div>
  );
}

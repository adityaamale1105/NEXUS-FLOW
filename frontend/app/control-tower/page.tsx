import { Metadata } from "next";
import { MerchantControlTower } from "@/components/MerchantControlTower";

export const metadata: Metadata = {
  title: "Merchant Control Tower | Nexus-Flow 2026",
  description: "High-density telemetry dashboard powered by AG Grid monitoring real-time supply chain logistics, multi-agent health metrics, and PayPal payment routing.",
};

export default function ControlTowerPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Telemetry &amp; Settlement Operations
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
          Merchant Control Tower
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Real-time oversight over global distributed hardware shipments, multi-agent reasoning health, and multi-vendor PayPal split fee routing.
        </p>
      </div>

      <MerchantControlTower />
    </div>
  );
}

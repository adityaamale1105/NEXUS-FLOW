"use client";

import React, { useEffect, useRef } from "react";

export interface AgentStep {
  step_id: number;
  timestamp: string;
  agent_name: string;
  action: string;
  detail: string;
  status: "in_progress" | "completed" | "verified" | "warning";
  metadata?: Record<string, any>;
}

interface Props {
  steps: AgentStep[];
  isStreaming: boolean;
}

export const AgentThoughtTerminal: React.FC<Props> = ({ steps, isStreaming }) => {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  if (steps.length === 0 && !isStreaming) {
    return null;
  }

  const getStatusBadge = (status: AgentStep["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sage/15 text-sage border border-sage/30">
            COMPLETED
          </span>
        );
      case "verified":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30">
            APIMATIC VERIFIED
          </span>
        );
      case "warning":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber/15 text-amber border border-amber/30">
            ADVISORY
          </span>
        );
      case "in_progress":
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber/15 text-amber border border-amber/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse"></span>
            ACTIVE
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 rounded-xl border border-white/[0.09] bg-obsidian/95 shadow-2xl overflow-hidden font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="px-4 py-2.5 bg-charcoal/90 border-b border-white/[0.09] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-sage"></div>
          </div>
          <span className="text-textPrimary font-semibold text-[11px] tracking-wider uppercase ml-2">
            AGENT EXECUTION TELEMETRY
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          {isStreaming ? (
            <span className="text-sage flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sage animate-ping"></span>
              STREAM ACTIVE
            </span>
          ) : (
            <span className="text-textMuted">EXECUTION CONCLUDED</span>
          )}
        </div>
      </div>

      {/* Terminal Log Output */}
      <div className="p-4 max-h-80 overflow-y-auto space-y-3 bg-obsidian">
        {steps.map((step) => {
          const time = step.timestamp.split("T")[1]?.slice(0, 8) || "LIVE";
          return (
            <div
              key={step.step_id}
              className="flex items-start justify-between gap-3 text-xs leading-relaxed animate-fadeIn"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-cyan font-semibold">
                    {step.agent_name}:
                  </span>
                  <span className="text-textPrimary font-medium">{step.action}</span>
                </div>
                <p className="text-textSecondary text-[11px] mt-0.5">
                  {step.detail}
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-textMuted text-[10px]">{time}</span>
                {getStatusBadge(step.status)}
              </div>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

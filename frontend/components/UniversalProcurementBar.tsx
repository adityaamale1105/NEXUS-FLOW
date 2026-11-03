"use client";

import React, { useState } from "react";

interface Props {
  onExecute: (prompt: string, maxBudget?: number, strategy?: string) => void;
  isLoading: boolean;
}

const PRESET_PROMPTS = [
  "Build me a complete DIY smart-home kit with an ESP32, relay modules, temperature sensors and all required accessories. Budget $60.",
  "Source components for an automated environmental climate monitor with BME280 sensor and OLED display",
  "Build an autonomous robot vision rover with ESP32 camera, PIR motion sensor, and isolated AC-DC power module",
];

export const UniversalProcurementBar: React.FC<Props> = ({ onExecute, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [strategy, setStrategy] = useState<string>("recommended");
  const [showOptions, setShowOptions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = prompt.trim();
    if (clean.length < 3) {
      setErrorMsg("Please enter your procurement requirements (at least 3 characters).");
      return;
    }

    const budgetVal = maxBudget ? parseFloat(maxBudget) : undefined;
    if (budgetVal !== undefined && (isNaN(budgetVal) || budgetVal <= 0)) {
      setErrorMsg("Target budget must be a positive number.");
      return;
    }

    onExecute(clean, budgetVal, strategy);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col md:flex-row items-stretch rounded-xl bg-charcoal/90 border border-white/[0.09] shadow-2xl shadow-black/60 focus-within:border-sage/80 focus-within:ring-2 focus-within:ring-sage/20 transition-all p-2 gap-2">
          {/* Main Search Input */}
          <div className="flex-1 flex items-center px-3">
            <svg
              className="w-5 h-5 text-textMuted mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              placeholder="Describe your procurement requirements (e.g., Build me a complete DIY smart-home kit with an ESP32, relay modules, temperature sensors and power supply)..."
              className="w-full bg-transparent text-textPrimary placeholder-textMuted text-sm md:text-base focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Action and Filter Controls */}
          <div className="flex items-center space-x-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.09]">
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="px-3 py-2 text-xs font-mono rounded-lg bg-graphite text-textSecondary hover:text-textPrimary hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Parameters</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-sage hover:bg-[#B5C49C] text-obsidian font-semibold text-sm transition-all shadow-md shadow-sage/20 disabled:opacity-50 disabled:pointer-events-none flex items-center space-x-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-obsidian" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Synthesize Plan</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Parameters Panel */}
        {showOptions && (
          <div className="mt-2 p-3 rounded-lg bg-graphite border border-white/[0.09] flex flex-wrap gap-4 text-xs font-mono text-textSecondary animate-fadeIn">
            <div className="flex items-center space-x-2">
              <span className="text-textMuted">Budget Limit (USD):</span>
              <input
                type="number"
                placeholder="No limit"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-24 px-2 py-1 rounded bg-obsidian border border-white/[0.09] text-textPrimary text-xs focus:outline-none focus:border-sage"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-textMuted">Strategy:</span>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="px-2 py-1 rounded bg-obsidian border border-white/[0.09] text-textPrimary text-xs focus:outline-none focus:border-sage"
              >
                <option value="recommended">Recommended (Balanced)</option>
                <option value="lowest_cost">Lowest Landed Cost</option>
                <option value="delivery_priority">Fast Express Delivery</option>
              </select>
            </div>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-obsidian border-white/[0.09] text-sage focus:ring-0" />
              <span>Channel3 Verified Suppliers</span>
            </label>
            <div className="ml-auto text-sage">
              Platform Take-Rate: <strong>2.50%</strong>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-2 p-2 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-mono">
            {errorMsg}
          </div>
        )}
      </form>

      {/* Preset Scenario Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-mono text-textMuted">Sourcing Examples:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => { setPrompt(p); setErrorMsg(null); }}
            className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.09] text-textSecondary hover:text-sage hover:border-sage/40 transition-colors"
          >
            {idx === 0 ? "Smart Home Kit (ESP32 + Relays)" : idx === 1 ? "Climate Station (BME280 + OLED)" : "Robot Rover (Camera + PIR + Power)"}
          </button>
        ))}
      </div>
    </div>
  );
};

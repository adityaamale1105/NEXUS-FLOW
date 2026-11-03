"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Procure", href: "/#hero" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Thought Terminal", href: "/#terminal" },
    { name: "BOM Workspace", href: "/#bom" },
    { name: "Compatibility", href: "/#intelligence" },
    { name: "Suppliers", href: "/#suppliers" },
    { name: "Control Tower", href: "/#control-tower" },
    { name: "History", href: "/#history" },
    { name: "API Docs", href: "/api/docs", external: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.09] bg-obsidian/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-walnut to-graphite border border-sage/20 flex items-center justify-center shadow-lg shadow-black/40">
            <svg
              className="w-5 h-5 text-sage"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg text-textPrimary tracking-tight flex items-center gap-2">
              NEXUS-FLOW
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sage/15 text-sage border border-sage/30">
                2026
              </span>
            </span>
            <span className="text-[11px] text-textMuted tracking-tight font-mono">
              Autonomous Procurement Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            if (link.external) {
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-white/[0.04] transition-colors"
                >
                  {link.name}
                </a>
              );
            }
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-cyan bg-cyan/10 border border-cyan/25"
                    : "text-textSecondary hover:text-textPrimary hover:bg-white/[0.04]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Status Pill & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sage/10 border border-sage/20 text-sage text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
            <span>PayPal Sandbox Active</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-textSecondary hover:text-textPrimary hover:bg-graphite"
            aria-label="Toggle Navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.09] bg-charcoal px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-graphite"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

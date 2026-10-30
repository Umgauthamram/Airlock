'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface TourStep {
  id: string;
  section: string;
  title: string;
  badge: string;
  href: string;
  whatItDoes: string;
  howToUse: string;
  securityGuarantee: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'overview',
    section: 'System Overview',
    title: 'Command Center & Live Telemetry',
    badge: 'Real-Time Telemetry',
    href: '/app',
    whatItDoes:
      'Provides a real-time command center showing gateway health, pending operator approval counts, today’s agent script executions, cumulative token savings, and AST inspection latency.',
    howToUse:
      'Check here when logging in to review active alerts, fleet activity, and launch quick test simulations.',
    securityGuarantee: 'Zero-overhead telemetry with sub-millisecond (0.8ms) AST analysis latency.',
  },
  {
    id: 'approvals',
    section: 'Approvals Queue',
    title: 'Human-in-the-Loop Quarantine',
    badge: 'Zero-Trust Gate',
    href: '/app/approvals',
    whatItDoes:
      'Automatically quarantines agent scripts that trigger high-risk security policies (such as reading untrusted customer emails and attempting an external HTTP post).',
    howToUse:
      'Click on any pending item to inspect the script code, review the model’s explanation, examine flagged data flows, and click "Approve" or "Deny".',
    securityGuarantee:
      'Atomic state transitions ensure no held script can be executed twice or bypassed without human operator sign-off.',
  },
  {
    id: 'audit',
    section: 'Audit Trail',
    title: 'Cryptographic Audit Stream',
    badge: 'Immutable Logging',
    href: '/app/audit',
    whatItDoes:
      'Maintains an append-only, tamper-evident Redis stream recording every script submitted by agents, policy decisions, operator reviews, and tool execution logs with SHA-256 hashes.',
    howToUse:
      'Use this trail for SOC 2 / HIPAA compliance audits, forensic investigations, and full replay of agent actions.',
    securityGuarantee:
      'Cryptographic SHA-256 digests provide non-repudiation for every single tool invocation.',
  },
  {
    id: 'agents',
    section: 'Agents & Governance',
    title: 'Agent Fleet & Emergency Kill Switches',
    badge: 'Runtime Control',
    href: '/app/agents',
    whatItDoes:
      'Registers and monitors all authorized AI agents in your organization, tracking per-agent daily tool call budgets and suspension states.',
    howToUse:
      'Click the "Emergency Suspend" button next to any agent to trigger an instant kill-switch that halts all running scripts immediately.',
    securityGuarantee:
      'The sandbox checks the agent suspension status on every single runtime tool call, aborting instantly if suspended.',
  },
  {
    id: 'tools',
    section: 'MCP Tools Catalog',
    title: 'Model Context Protocol (MCP) Registry',
    badge: 'Semantic Tagging',
    href: '/app/tools',
    whatItDoes:
      'Catalogs all MCP tools available across your systems (email inboxes, databases, ticketing systems, external HTTP) and attaches security tags (reads_untrusted, writes_external, destructive).',
    howToUse:
      'Review tool schemas and verified capabilities so agents can only generate code targeting approved interfaces.',
    securityGuarantee:
      'Prevents tool hijacking, dynamic property dispatch, and out-of-scope tool invocation before execution.',
  },
  {
    id: 'policies',
    section: 'Security Policies',
    title: 'Deterministic Policy Guardrails (R1–R6)',
    badge: 'Deterministic Rules',
    href: '/app/policies',
    whatItDoes:
      'Enforces the 6 core deterministic rules: R1 blocks banned syntax; R2 holds untrusted read + external write; R3 holds irreversible mutations; R4 denies out-of-scope tools; R5 holds runaway loops; R6 allows verified safe scripts.',
    howToUse:
      'Read through the active policy rules to understand how Airlock differentiates safe background tasks from exfiltration attacks.',
    securityGuarantee:
      'Pure deterministic AST validation eliminates prompt injection hallucinations with 0% false holds on benign scripts.',
  },
  {
    id: 'results',
    section: 'Empirical Benchmark',
    title: 'Scientific Performance & Token Proof',
    badge: 'Measured Proof',
    href: '/app/results',
    whatItDoes:
      'Displays verified benchmark proof across 60 scenarios (30 attacks, 30 benign tasks) demonstrating 100% attack block rate, 0% false hold rate, and 99.6% token reduction.',
    howToUse:
      'Compare classic multi-turn agent loops (607,957 tokens) against Airlock script mode (2,700 tokens) to understand the massive cost and speed advantages.',
    securityGuarantee:
      'Reproducible offline benchmark (pnpm bench) validating security and economics before production deployment.',
  },
];

interface ProductTourModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function ProductTourModal({ forceOpen = false, onClose }: ProductTourModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Check if first-time user
    const hasSeenTour = localStorage.getItem('airlock_product_tour_v1');
    if (forceOpen || !hasSeenTour) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const step = TOUR_STEPS[currentStepIndex];

  function handleClose() {
    localStorage.setItem('airlock_product_tour_v1', 'seen');
    setIsOpen(false);
    if (onClose) onClose();
  }

  function handleNext() {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleClose();
    }
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }

  function handleNavigate() {
    router.push(step.href);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}: {step.section}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {step.badge}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              {step.title}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="Close Tour"
          >
            Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 text-sm text-slate-700 bg-white">
          {/* What it does section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1.5">
            <span className="text-xs uppercase font-bold text-slate-900 tracking-wider">
              What this section does:
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {step.whatItDoes}
            </p>
          </div>

          {/* How to use */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col gap-1.5">
            <span className="text-xs uppercase font-bold text-blue-950 tracking-wider">
              How to use it:
            </span>
            <p className="text-xs text-blue-900 leading-relaxed">
              {step.howToUse}
            </p>
          </div>

          {/* Security guarantee */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950">
            <strong>Security Guarantee:</strong> {step.securityGuarantee}
          </div>

          {/* Direct Section Link */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Target URL:</span>
              <code className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-mono text-[11px]">
                {step.href}
              </code>
            </div>

            <button
              onClick={handleNavigate}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                pathname === step.href
                  ? 'bg-slate-100 text-slate-500 cursor-default'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
              }`}
            >
              <span>{pathname === step.href ? 'Currently Viewing Section' : 'Take Me to Section →'}</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentStepIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStepIndex
                    ? 'w-6 bg-slate-900'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={s.section}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold transition-colors"
              >
                ← Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Section →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

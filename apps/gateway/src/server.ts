import Fastify from 'fastify';
import dotenv from 'dotenv';
import { AirlockGateway } from './gateway.js';
import { RedisStorageAdapter, MemoryStorageAdapter } from './redis.js';

dotenv.config();

export async function createServer() {
  const app = Fastify({ logger: true });

  const redisUrl = process.env.REDIS_URL || 'redis://:airlocklocal@127.0.0.1:6379';
  const orgId = process.env.DEMO_MODE === '1' ? 'demo' : 'main';

  let storage = new RedisStorageAdapter(redisUrl);
  const connected = await storage.init();
  if (!connected) {
    app.log.warn('Unable to connect to live Redis; falling back to in-memory storage adapter.');
    storage = new MemoryStorageAdapter() as any;
  }

  const gateway = new AirlockGateway({ orgId, storage });

  // 1. Health & Readiness probe
  app.get('/healthz', async () => {
    return { status: 'healthy', orgId, redisConnected: storage.isAvailable(), timestamp: new Date().toISOString() };
  });

  // 2. Metrics endpoint
  app.get('/metrics', async () => {
    return `# HELP airlock_gateway_up Status of gateway\n# TYPE airlock_gateway_up gauge\nairlock_gateway_up 1\n`;
  });

  // 3. Agent MCP Endpoint (Streamable HTTP MCP)
  app.post('/mcp', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'Missing Authorization header with agent API key.' });
    }

    const agent = await gateway.authenticateKey(authHeader);
    if (!agent) {
      return reply.status(401).send({ error: 'Invalid or unknown agent API key.' });
    }

    const body = req.body as any;
    const method = body?.method;
    const params = body?.params || {};

    if (method === 'search_tools') {
      const query = params.query || '';
      const limit = params.limit || 10;
      const stubs = gateway.searchTools(query, limit);
      return { result: { stubs } };
    }

    if (method === 'run_script') {
      const code = params.code;
      const intent = params.intent;
      if (!code) {
        return reply.status(400).send({ error: 'Missing code parameter.' });
      }

      const outcome = await gateway.runScript(code, agent, intent);
      return { result: outcome };
    }

    if (method === 'get_result') {
      const approvalId = params.approvalId;
      if (!approvalId) {
        return reply.status(400).send({ error: 'Missing approvalId parameter.' });
      }

      const approval = await gateway.getApproval(approvalId);
      if (!approval) {
        return reply.status(404).send({ error: 'Approval not found.' });
      }

      if (approval.status === 'approved') {
        const result = await gateway.getResult(approvalId);
        return { result: { status: 'completed', result } };
      }

      return { result: { status: approval.status, explanation: approval.explanation } };
    }

    return reply.status(400).send({ error: `Unknown MCP method: ${method}` });
  });

  // 4. Operator Approval Decision Route
  app.post('/api/approvals/:id/decision', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as { decision: 'approved' | 'denied'; decidedBy?: string; note?: string };

    if (!body?.decision || (body.decision !== 'approved' && body.decision !== 'denied')) {
      return reply.status(400).send({ error: "decision must be 'approved' or 'denied'." });
    }

    const outcome = await gateway.decideApproval(id, body.decision, body.decidedBy || 'operator', body.note);
    if (!outcome.success) {
      return reply.status(409).send(outcome);
    }
    return outcome;
  });

  // 5. Kill Switch Routes
  app.post('/api/agents/:id/suspend', async (req) => {
    const { id } = req.params as { id: string };
    await gateway.suspendAgent(id);
    return { success: true, suspended: true, agentId: id };
  });

  app.post('/api/agents/:id/resume', async (req) => {
    const { id } = req.params as { id: string };
    await gateway.resumeAgent(id);
    return { success: true, suspended: false, agentId: id };
  });

  // 6. Audit Stream Feed
  app.get('/api/audit', async (req) => {
    const query = req.query as { limit?: string };
    const limit = query?.limit ? parseInt(query.limit, 10) : 50;
    const events = await gateway.getRecentAuditEvents(limit);
    return { events };
  });

  return { app, gateway };
}

if (process.env.NODE_ENV !== 'test') {
  const port = parseInt(process.env.PORT || '4000', 10);
  createServer().then(({ app }) => {
    app.listen({ port, host: '0.0.0.0' }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`Airlock Gateway listening on port ${port}`);
    });
  });
}

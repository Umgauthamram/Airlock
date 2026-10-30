import Fastify from 'fastify';
import dotenv from 'dotenv';
import { timingSafeEqual } from 'node:crypto';
import { AirlockGateway } from './gateway.js';
import { RedisStorageAdapter, MemoryStorageAdapter } from './redis.js';

dotenv.config();

export async function createServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1024 * 1024, // 1 MB payload limit (F-20)
  });

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

  // 3. Agent MCP Endpoint (Standard JSON-RPC 2.0 & Streamable HTTP MCP)
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
    const isJsonRpc = body?.jsonrpc === '2.0';
    const reqId = body?.id ?? null;
    const method = body?.method;
    const params = body?.params || {};

    // Helper for sending JSON-RPC 2.0 or REST responses
    const sendSuccess = (resultData: any) => {
      if (isJsonRpc) {
        return reply.send({ jsonrpc: '2.0', id: reqId, result: resultData });
      }
      return reply.send({ result: resultData });
    };

    const sendError = (statusCode: number, code: number, message: string) => {
      if (isJsonRpc) {
        return reply.status(statusCode).send({
          jsonrpc: '2.0',
          id: reqId,
          error: { code, message },
        });
      }
      return reply.status(statusCode).send({ error: message });
    };

    // Standard MCP Protocol Handshake (F-24)
    if (method === 'initialize') {
      return sendSuccess({
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'airlock-gateway',
          version: '0.1.0',
        },
      });
    }

    if (method === 'notifications/initialized') {
      return reply.status(204).send();
    }

    // Standard MCP: tools/list
    if (method === 'tools/list') {
      const toolStubs = gateway.searchTools('', 50);
      return sendSuccess({
        tools: [
          {
            name: 'search_tools',
            description: 'Search available upstream MCP tools and retrieve concise TypeScript stubs.',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search term or keyword' },
                limit: { type: 'number', description: 'Max results to return' },
              },
            },
          },
          {
            name: 'run_script',
            description: 'Submit an execution script plan to the Airlock gateway for deterministic AST inspection and sandboxed run.',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'JavaScript/TypeScript script calling tools.<server>.<tool>(args)' },
                intent: { type: 'string', description: 'Human-readable goal of the script' },
              },
              required: ['code'],
            },
          },
          {
            name: 'get_result',
            description: 'Poll for execution result of an approved held script.',
            inputSchema: {
              type: 'object',
              properties: {
                approvalId: { type: 'string', description: 'Approval ID returned when script was held' },
              },
              required: ['approvalId'],
            },
          },
          {
            name: 'synthesize_script',
            description: 'Use Nemotron Super to synthesize a compliant TypeScript script from natural language.',
            inputSchema: {
              type: 'object',
              properties: {
                intent: { type: 'string', description: 'Goal or task intent' },
                toolStubs: { type: 'string', description: 'Available TypeScript interface stubs' },
              },
              required: ['intent'],
            },
          },
        ],
      });
    }

    // Standard MCP: tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === 'search_tools') {
        const stubs = gateway.searchTools(args.query || '', args.limit || 10);
        return sendSuccess({ content: [{ type: 'text', text: stubs }] });
      }

      if (toolName === 'run_script') {
        if (!args.code) {
          return sendError(400, -32602, 'Missing code parameter in arguments.');
        }
        const outcome = await gateway.runScript(args.code, agent, args.intent);
        return sendSuccess({ content: [{ type: 'text', text: JSON.stringify(outcome) }] });
      }

      if (toolName === 'get_result') {
        if (!args.approvalId) {
          return sendError(400, -32602, 'Missing approvalId in arguments.');
        }
        const approval = await gateway.getApproval(args.approvalId);
        if (!approval) {
          return sendError(404, -32602, 'Approval not found.');
        }
        if (approval.status === 'approved') {
          const result = await gateway.getResult(args.approvalId);
          return sendSuccess({ content: [{ type: 'text', text: JSON.stringify({ status: 'completed', result }) }] });
        }
        return sendSuccess({ content: [{ type: 'text', text: JSON.stringify({ status: approval.status, explanation: approval.explanation }) }] });
      }

      return sendError(400, -32601, `Unknown tool name: ${toolName}`);
    }

    // Direct Method Calls (Backward-compatible Airlock RPC)
    if (method === 'search_tools') {
      const query = params.query || '';
      const limit = params.limit || 10;
      const stubs = gateway.searchTools(query, limit);
      return sendSuccess({ stubs });
    }

    if (method === 'run_script') {
      const code = params.code;
      const intent = params.intent;
      if (!code) {
        return sendError(400, -32602, 'Missing code parameter.');
      }
      const outcome = await gateway.runScript(code, agent, intent);
      return sendSuccess(outcome);
    }

    if (method === 'get_result') {
      const approvalId = params.approvalId;
      if (!approvalId) {
        return sendError(400, -32602, 'Missing approvalId parameter.');
      }

      const approval = await gateway.getApproval(approvalId);
      if (!approval) {
        return sendError(404, -32602, 'Approval not found.');
      }

      if (approval.status === 'approved') {
        const result = await gateway.getResult(approvalId);
        return sendSuccess({ status: 'completed', result });
      }

      return sendSuccess({ status: approval.status, explanation: approval.explanation });
    }

    return sendError(400, -32601, `Unknown MCP method: ${method}`);
  });

  // ---------------------------------------------------------------------------
  // Model Synthesis & Repair Endpoints (Nemotron Super & Ultra via Token Factory)
  // ---------------------------------------------------------------------------
  app.post('/agent/synthesize', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'Missing Authorization header.' });
    }
    const agent = await gateway.authenticateKey(authHeader);
    if (!agent) {
      return reply.status(401).send({ error: 'Unauthorized.' });
    }

    const { intent, toolStubs } = req.body as { intent: string; toolStubs?: string };
    if (!intent) {
      return reply.status(400).send({ error: 'Missing intent parameter.' });
    }

    const stubs = toolStubs || gateway.searchTools(intent, 5);
    const synthesis = await gateway.synthesizeScript(intent, stubs);
    return synthesis;
  });

  app.post('/agent/repair', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'Missing Authorization header.' });
    }
    const agent = await gateway.authenticateKey(authHeader);
    if (!agent) {
      return reply.status(401).send({ error: 'Unauthorized.' });
    }

    const { code, reasons } = req.body as { code: string; reasons: string[] };
    if (!code || !reasons) {
      return reply.status(400).send({ error: 'Missing code or reasons parameter.' });
    }

    const repair = await gateway.repairScript(code, reasons);
    return repair;
  });

  // ---------------------------------------------------------------------------
  // Authenticated Control Plane Endpoints (Restricted to Internal Web App)
  // ---------------------------------------------------------------------------
  const DEFAULT_DEV_KEY = 'airlock_default_master_key_for_local_development_32_chars';
  const masterKey = process.env.AIRLOCK_MASTER_KEY || DEFAULT_DEV_KEY;

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.AIRLOCK_MASTER_KEY || process.env.AIRLOCK_MASTER_KEY === DEFAULT_DEV_KEY || process.env.AIRLOCK_MASTER_KEY.length < 32) {
      throw new Error('FATAL: AIRLOCK_MASTER_KEY must be set with at least 32 characters in production.');
    }
  }

  function verifyControlPlaneAuth(req: any, reply: any): boolean {
    const auth = req.headers.authorization;
    const token = auth ? auth.replace(/^Bearer\s+/i, '').trim() : '';
    if (!token) {
      reply.status(401).send({ error: 'Unauthorized: Invalid control plane credentials.' });
      return false;
    }
    const tokenBuf = Buffer.from(token, 'utf8');
    const masterBuf = Buffer.from(masterKey, 'utf8');
    if (tokenBuf.length !== masterBuf.length || !timingSafeEqual(tokenBuf, masterBuf)) {
      reply.status(401).send({ error: 'Unauthorized: Invalid control plane credentials.' });
      return false;
    }
    return true;
  }

  // 4. Operator Approval Decision Route
  app.post('/api/approvals/:id/decision', async (req, reply) => {
    if (!verifyControlPlaneAuth(req, reply)) return;

    const { id } = req.params as { id: string };
    const body = req.body as { decision: 'approved' | 'denied'; note?: string };
    const operatorId = (req.headers['x-operator-id'] as string) || 'operator';
    const orgId = (req.headers['x-org-id'] as string) || 'main';

    if (!body?.decision || (body.decision !== 'approved' && body.decision !== 'denied')) {
      return reply.status(400).send({ error: "decision must be 'approved' or 'denied'." });
    }

    const outcome = await gateway.decideApproval(id, body.decision, operatorId, body.note, orgId);
    if (!outcome.success) {
      const statusCode = outcome.status === 'not_found' ? 404 : 409;
      return reply.status(statusCode).send(outcome);
    }
    return outcome;
  });

  // 5. Kill Switch Routes
  app.post('/api/agents/:id/suspend', async (req, reply) => {
    if (!verifyControlPlaneAuth(req, reply)) return;

    const { id } = req.params as { id: string };
    const operatorId = (req.headers['x-operator-id'] as string) || 'operator';
    await gateway.suspendAgent(id, operatorId);
    return { success: true, suspended: true, agentId: id };
  });

  app.post('/api/agents/:id/resume', async (req, reply) => {
    if (!verifyControlPlaneAuth(req, reply)) return;

    const { id } = req.params as { id: string };
    const operatorId = (req.headers['x-operator-id'] as string) || 'operator';
    await gateway.resumeAgent(id, operatorId);
    return { success: true, suspended: false, agentId: id };
  });

  // 6. Audit Stream Feed
  app.get('/api/audit', async (req, reply) => {
    if (!verifyControlPlaneAuth(req, reply)) return;

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


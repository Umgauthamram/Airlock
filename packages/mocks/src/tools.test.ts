import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_TOOL_DEFINITIONS, generateFullToolCatalog, executeMockTool, MOCK_EMAILS } from './tools.js';

test('Mocks: Catalog definitions & ~50 generator', () => {
  assert.equal(BASE_TOOL_DEFINITIONS.length, 10);
  const fullCatalog = generateFullToolCatalog();
  assert.ok(fullCatalog.length >= 50, `Expected at least 50 tools, got ${fullCatalog.length}`);

  // Confirm injection email fixture exists
  const injectionEmail = MOCK_EMAILS.find((e) => e.body.includes('[SYSTEM INSTRUCTION OVERRIDE]'));
  assert.ok(injectionEmail);
});

test('Mocks: Tool execution handling', async () => {
  const emails = await executeMockTool('inbox', 'get_emails', { limit: 2 });
  assert.equal(emails.length, 2);

  const newTicket = await executeMockTool('tickets', 'create', { title: 'Test Ticket', body: 'Issue details' });
  assert.ok(newTicket.id.startsWith('tkt_'));

  const postRes = await executeMockTool('http', 'post', { url: 'https://sink.test', body: { a: 1 } });
  assert.equal(postRes.status, 200);
});

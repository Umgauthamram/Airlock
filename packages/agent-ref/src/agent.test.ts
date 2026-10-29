import test from 'node:test';
import assert from 'node:assert/strict';
import { ReferenceAgentHarness } from './agent.js';
import { generateFullToolCatalog } from '@airlock/mocks';

test('AgentRef: Compares token use in classic vs airlock mode', async () => {
  const harness = new ReferenceAgentHarness();
  const catalog = generateFullToolCatalog();

  const task = 'Find recent urgent emails and file support tickets';
  const classicRun = await harness.runClassic(task, catalog, [
    { toolKey: 'inbox.get_emails', result: [{ id: '1', subject: 'Urgent' }] },
    { toolKey: 'tickets.create', result: { id: 'tkt_123', status: 'open' } },
  ]);

  const airlockRun = await harness.runAirlock(
    task,
    'declare const tools: { inbox: { get_emails: any }, tickets: { create: any } };',
    'const emails = await tools.inbox.get_emails(); await tools.tickets.create({ title: "Urgent" });',
    'allow'
  );

  assert.equal(classicRun.mode, 'classic');
  assert.equal(classicRun.roundTrips, 3);
  assert.equal(classicRun.securityOutcome, 'executed_blindly');

  assert.equal(airlockRun.mode, 'airlock');
  assert.equal(airlockRun.roundTrips, 1);
  assert.equal(airlockRun.securityOutcome, 'gated_safely');

  // Token reduction should exceed 60%
  const tokenSavingsPercent = ((classicRun.totalTokens - airlockRun.totalTokens) / classicRun.totalTokens) * 100;
  assert.ok(
    tokenSavingsPercent > 60,
    `Expected token savings > 60%, got ${tokenSavingsPercent.toFixed(1)}%`
  );
});


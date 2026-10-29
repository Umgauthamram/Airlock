import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeScript } from './analyzer.js';

test('Analyzer: Valid benign script parses and extracts tool calls', () => {
  const code = `
    const emails = await tools.inbox.get_unread({ limit: 5 });
    for (const email of emails) {
      if (email.subject.includes('URGENT')) {
        await tools.tickets.create({ title: email.subject, body: email.body });
      }
    }
  `;

  const result = analyzeScript(code, {
    knownTagsByTool: {
      'inbox.get_unread': ['reads_untrusted'],
      'tickets.create': ['writes_internal'],
    },
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.calls.length, 2);

  // Check calls details
  const inboxCall = result.calls.find((c) => c.tool === 'get_unread');
  assert.ok(inboxCall);
  assert.equal(inboxCall?.server, 'inbox');
  assert.equal(inboxCall?.inLoop, false);

  const ticketCall = result.calls.find((c) => c.tool === 'create');
  assert.ok(ticketCall);
  assert.equal(ticketCall?.server, 'tickets');
  assert.equal(ticketCall?.inLoop, true); // inside for loop

  assert.deepEqual(result.uniqueToolKeys.sort(), ['inbox.get_unread', 'tickets.create']);
  assert.deepEqual(result.tags.sort(), ['reads_untrusted', 'writes_internal']);
});

test('Analyzer: Rejects aliasing tools object', () => {
  const code = `
    const t = tools;
    await t.inbox.get_unread();
  `;
  const result = analyzeScript(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.code === 'INVALID_TOOLS_USAGE'));
});

test('Analyzer: Rejects destructuring tools object', () => {
  const code = `
    const { inbox } = tools;
    await inbox.get_unread();
  `;
  const result = analyzeScript(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.code === 'INVALID_TOOLS_USAGE'));
});

test('Analyzer: Rejects computed/dynamic tool dispatch', () => {
  const code = `
    const serverName = 'inbox';
    await tools[serverName].get_unread();
  `;
  const result = analyzeScript(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.code === 'INVALID_TOOLS_USAGE'));
});

test('Analyzer: Rejects passing tools as argument', () => {
  const code = `
    function helper(t) {
      return t.inbox.get_unread();
    }
    helper(tools);
  `;
  const result = analyzeScript(code);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.code === 'INVALID_TOOLS_USAGE'));
});

test('Analyzer: Rejects eval and Function constructor', () => {
  const code1 = `eval("tools.inbox.get_unread()");`;
  const res1 = analyzeScript(code1);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.message.includes('eval')));

  const code2 = `const f = new Function("return 42");`;
  const res2 = analyzeScript(code2);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.code === 'BANNED_IDENTIFIER' || e.code === 'DISALLOWED_NEW'));
});

test('Analyzer: Rejects process and globalThis environment probing', () => {
  const code1 = `const token = process.env.API_KEY;`;
  const res1 = analyzeScript(code1);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.message.includes('process')));

  const code2 = `const g = globalThis;`;
  const res2 = analyzeScript(code2);
  assert.equal(res2.valid, false);
  assert.ok(res2.errors.some((e) => e.message.includes('globalThis')));
});

test('Analyzer: Rejects prototype pollution attempts', () => {
  const code = `const p = Object.__proto__;`;
  const res = analyzeScript(code);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some((e) => e.message.includes('__proto__')));
});

test('Analyzer: Rejects classes, this, var, and tagged templates', () => {
  const codeClass = `class Agent {}`;
  assert.equal(analyzeScript(codeClass).valid, false);

  const codeThis = `const x = this.foo;`;
  assert.equal(analyzeScript(codeThis).valid, false);

  const codeVar = `var x = 10;`;
  assert.equal(analyzeScript(codeVar).valid, false);

  const codeTagged = `const res = tag\`hello\`;`;
  assert.equal(analyzeScript(codeTagged).valid, false);
});

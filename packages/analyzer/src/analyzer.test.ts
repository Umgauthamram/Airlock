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

test('Analyzer: Rejects prototype pollution and constructor escape attempts', () => {
  const code1 = `const p = Object.__proto__;`;
  const res1 = analyzeScript(code1);
  assert.equal(res1.valid, false);
  assert.ok(res1.errors.some((e) => e.message.includes('__proto__')));

  // Specifically test the exact sandbox escape vector:
  const codeEscape1 = `return Object['constructor']('return typeof process')();`;
  const resEscape1 = analyzeScript(codeEscape1);
  assert.equal(resEscape1.valid, false);
  assert.ok(resEscape1.errors.length > 0);

  // Template literal constructor escape:
  const codeEscape2 = "return Object[`constructor`]('return typeof process')();";
  const resEscape2 = analyzeScript(codeEscape2);
  assert.equal(resEscape2.valid, false);
  assert.ok(resEscape2.errors.length > 0);

  // Array constructor escape:
  const codeEscape3 = `const c = [].constructor;`;
  const resEscape3 = analyzeScript(codeEscape3);
  assert.equal(resEscape3.valid, false);

  // Host object constructor chaining and computed invocation escape (F-01 probe)
  const codeEscape4 = `
    const res = await tools.crm.get_contacts({});
    const k = 'constr' + 'uctor';
    return res[k][k]('return typeof process')();
  `;
  const resEscape4 = analyzeScript(codeEscape4);
  assert.equal(resEscape4.valid, false);
  assert.ok(resEscape4.errors.some(e => e.code === 'BANNED_CHAINED_COMPUTED' || e.code === 'BANNED_COMPUTED_CALL'));
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

test('Analyzer: Rejects reflection escapes (getOwnPropertyNames and Reflect.get)', () => {
  // Attack vector 1: Object.getOwnPropertyNames followed by dynamic indexing
  const codeEscape1 = `
    const p = Object.getOwnPropertyNames(Object).find(x => x.startsWith('con'));
    const c = Object[p];
  `;
  const resEscape1 = analyzeScript(codeEscape1);
  assert.equal(resEscape1.valid, false);
  assert.ok(
    resEscape1.errors.some((e) => e.code === 'BANNED_REFLECTION' || e.code === 'BANNED_COMPUTED_PRIMITIVE')
  );

  // Attack vector 2: Reflect.get with runtime key synthesis
  const codeEscape2 = `
    const c = Reflect.get(Object, ['con', 'structor'].join(''));
  `;
  const resEscape2 = analyzeScript(codeEscape2);
  assert.equal(resEscape2.valid, false);
  assert.ok(resEscape2.errors.some((e) => e.code === 'BANNED_IDENTIFIER'));
});

test('Analyzer: Rejects infinite loops and loop await starvation (DoS prevention)', () => {
  const codeInfiniteWhile = `
    while (true) {
      await null;
    }
  `;
  const resWhile = analyzeScript(codeInfiniteWhile);
  assert.equal(resWhile.valid, false);
  assert.ok(
    resWhile.errors.some((e) => e.code === 'DISALLOWED_INFINITE_LOOP' || e.code === 'DISALLOWED_LOOP_AWAIT')
  );

  const codeInfiniteFor = `
    for (;;) {
      await null;
    }
  `;
  const resFor = analyzeScript(codeInfiniteFor);
  assert.equal(resFor.valid, false);
  assert.ok(
    resFor.errors.some((e) => e.code === 'DISALLOWED_INFINITE_LOOP' || e.code === 'DISALLOWED_LOOP_AWAIT')
  );
});



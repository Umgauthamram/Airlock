import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePolicy, DEFAULT_POLICY } from './engine.js';
import type { AnalysisResult } from '@airlock/shared';

test('Policy: Safe benign script is allowed', () => {
  const analysis: AnalysisResult = {
    valid: true,
    sha256: 'abc1',
    calls: [{ server: 'inbox', tool: 'get_unread', line: 1, inLoop: false }],
    uniqueToolKeys: ['inbox.get_unread'],
    tags: ['reads_untrusted'],
    errors: [],
  };

  const res = evaluatePolicy({
    analysis,
    toolTagMap: {
      'inbox.get_unread': ['reads_untrusted'],
    },
  });

  assert.equal(res.decision, 'allow');
  assert.equal(res.matchedRules.length, 0);
});

test('Policy: Untrusted read + external write is held (R1)', () => {
  const analysis: AnalysisResult = {
    valid: true,
    sha256: 'abc2',
    calls: [
      { server: 'inbox', tool: 'get_unread', line: 1, inLoop: false },
      { server: 'http', tool: 'post', line: 2, inLoop: false },
    ],
    uniqueToolKeys: ['inbox.get_unread', 'http.post'],
    tags: ['reads_untrusted', 'writes_external'],
    errors: [],
  };

  const res = evaluatePolicy({
    analysis,
    toolTagMap: {
      'inbox.get_unread': ['reads_untrusted'],
      'http.post': ['writes_external'],
    },
  });

  assert.equal(res.decision, 'hold');
  assert.ok(res.matchedRules.includes('R1'));
  assert.ok(res.flaggedFlows.includes('reads_untrusted -> writes_external'));
});

test('Policy: Out of scope tool call is denied (R4 precedence over hold)', () => {
  const analysis: AnalysisResult = {
    valid: true,
    sha256: 'abc3',
    calls: [
      { server: 'inbox', tool: 'get_unread', line: 1, inLoop: false },
      { server: 'admin_server', tool: 'nuke_db', line: 2, inLoop: false },
    ],
    uniqueToolKeys: ['inbox.get_unread', 'admin_server.nuke_db'],
    tags: ['reads_untrusted', 'destructive'],
    errors: [],
  };

  const res = evaluatePolicy({
    analysis,
    agentScopes: ['inbox.*'], // admin_server is out of scope!
    toolTagMap: {
      'inbox.get_unread': ['reads_untrusted'],
      'admin_server.nuke_db': ['destructive'],
    },
  });

  // R3 (destructive) matches hold, but R4 (out of scope) matches deny. Deny takes precedence!
  assert.equal(res.decision, 'deny');
  assert.ok(res.matchedRules.includes('R4'));
});

test('Policy: Write inside loop is held (R5)', () => {
  const analysis: AnalysisResult = {
    valid: true,
    sha256: 'abc4',
    calls: [
      { server: 'tickets', tool: 'create', line: 3, inLoop: true },
    ],
    uniqueToolKeys: ['tickets.create'],
    tags: ['writes_internal'],
    errors: [],
  };

  const res = evaluatePolicy({
    analysis,
    toolTagMap: {
      'tickets.create': ['writes_internal'],
    },
  });

  assert.equal(res.decision, 'hold');
  assert.ok(res.matchedRules.includes('R5'));
  assert.ok(res.flaggedFlows.includes('write_in_loop'));
});

test('Policy: Invalid AST analysis fails closed with deny', () => {
  const analysis: AnalysisResult = {
    valid: false,
    sha256: 'bad',
    calls: [],
    uniqueToolKeys: [],
    tags: [],
    errors: [{ line: 2, message: 'Disallowed identifier eval', code: 'BANNED_IDENTIFIER' }],
  };

  const res = evaluatePolicy({ analysis });
  assert.equal(res.decision, 'deny');
  assert.ok(res.reasons[0].includes('eval'));
});

test('Policy: Uncatalogued tool invocation is denied by default (R6 fail-closed)', () => {
  const analysis: AnalysisResult = {
    valid: true,
    sha256: 'abc5',
    calls: [
      { server: 'nosuch', tool: 'thing', line: 1, inLoop: false },
    ],
    uniqueToolKeys: ['nosuch.thing'],
    tags: [],
    errors: [],
  };

  const res = evaluatePolicy({
    analysis,
    toolTagMap: {
      'inbox.get_unread': ['reads_untrusted'],
    },
  });

  assert.equal(res.decision, 'deny');
  assert.ok(res.matchedRules.includes('R6'));
  assert.ok(res.flaggedFlows.includes('uncatalogued_tool'));
});


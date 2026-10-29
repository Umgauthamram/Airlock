import test from 'node:test';
import assert from 'node:assert/strict';
import { RedisKeys } from './keys.js';
import { hasMinimumRole, Role } from './roles.js';
import { PolicyRuleSchema } from './schemas.js';

test('RedisKeys generates tagged keys for single slot affinity', () => {
  const userKey = RedisKeys.user('demo', 'u_123');
  assert.equal(userKey, 'org:{demo}:user:u_123');

  const approvalKey = RedisKeys.approval('main', 'appr_456');
  assert.equal(approvalKey, 'org:{main}:approval:appr_456');

  const auditKey = RedisKeys.streamAudit('main');
  assert.equal(auditKey, 'org:{main}:stream:audit');
});

test('Role hierarchy verification', () => {
  assert.equal(hasMinimumRole(Role.VIEWER, Role.VIEWER), true);
  assert.equal(hasMinimumRole(Role.VIEWER, Role.OPERATOR), false);
  assert.equal(hasMinimumRole(Role.VIEWER, Role.ADMIN), false);

  assert.equal(hasMinimumRole(Role.OPERATOR, Role.VIEWER), true);
  assert.equal(hasMinimumRole(Role.OPERATOR, Role.OPERATOR), true);
  assert.equal(hasMinimumRole(Role.OPERATOR, Role.ADMIN), false);

  assert.equal(hasMinimumRole(Role.ADMIN, Role.VIEWER), true);
  assert.equal(hasMinimumRole(Role.ADMIN, Role.OPERATOR), true);
  assert.equal(hasMinimumRole(Role.ADMIN, Role.ADMIN), true);
});

test('PolicyRuleSchema validation', () => {
  const validRule = {
    id: 'R1',
    when: { all: ['reads_untrusted', 'writes_external'] },
    action: 'hold',
    message: 'Untrusted content and an external write in one script.',
  };
  const parsed = PolicyRuleSchema.parse(validRule);
  assert.equal(parsed.id, 'R1');
  assert.equal(parsed.action, 'hold');
});

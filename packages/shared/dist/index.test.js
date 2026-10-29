"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const keys_js_1 = require("./keys.js");
const roles_js_1 = require("./roles.js");
const schemas_js_1 = require("./schemas.js");
(0, node_test_1.default)('RedisKeys generates tagged keys for single slot affinity', () => {
    const userKey = keys_js_1.RedisKeys.user('demo', 'u_123');
    strict_1.default.equal(userKey, 'org:{demo}:user:u_123');
    const approvalKey = keys_js_1.RedisKeys.approval('main', 'appr_456');
    strict_1.default.equal(approvalKey, 'org:{main}:approval:appr_456');
    const auditKey = keys_js_1.RedisKeys.streamAudit('main');
    strict_1.default.equal(auditKey, 'org:{main}:stream:audit');
});
(0, node_test_1.default)('Role hierarchy verification', () => {
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.VIEWER, roles_js_1.Role.VIEWER), true);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.VIEWER, roles_js_1.Role.OPERATOR), false);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.VIEWER, roles_js_1.Role.ADMIN), false);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.OPERATOR, roles_js_1.Role.VIEWER), true);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.OPERATOR, roles_js_1.Role.OPERATOR), true);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.OPERATOR, roles_js_1.Role.ADMIN), false);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.ADMIN, roles_js_1.Role.VIEWER), true);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.ADMIN, roles_js_1.Role.OPERATOR), true);
    strict_1.default.equal((0, roles_js_1.hasMinimumRole)(roles_js_1.Role.ADMIN, roles_js_1.Role.ADMIN), true);
});
(0, node_test_1.default)('PolicyRuleSchema validation', () => {
    const validRule = {
        id: 'R1',
        when: { all: ['reads_untrusted', 'writes_external'] },
        action: 'hold',
        message: 'Untrusted content and an external write in one script.',
    };
    const parsed = schemas_js_1.PolicyRuleSchema.parse(validRule);
    strict_1.default.equal(parsed.id, 'R1');
    strict_1.default.equal(parsed.action, 'hold');
});
//# sourceMappingURL=index.test.js.map
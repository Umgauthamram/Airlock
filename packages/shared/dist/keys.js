"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisKeys = void 0;
exports.buildKey = buildKey;
/**
 * Redis Key Builders with {orgId} hash tags for single-slot cluster affinity and Lua atomic operations.
 */
function buildKey(orgId, type, id) {
    const prefix = `org:{${orgId}}:${type}`;
    return id ? `${prefix}:${id}` : prefix;
}
exports.RedisKeys = {
    // Documents (JSON)
    user: (orgId, userId) => buildKey(orgId, 'user', userId),
    invite: (orgId, emailLower) => buildKey(orgId, 'invite', emailLower.toLowerCase()),
    agent: (orgId, agentId) => buildKey(orgId, 'agent', agentId),
    server: (orgId, serverId) => buildKey(orgId, 'server', serverId),
    tool: (orgId, server, name) => buildKey(orgId, 'tool', `${server}:${name}`),
    policyActive: (orgId) => buildKey(orgId, 'policy', 'active'),
    policyVersion: (orgId, version) => buildKey(orgId, 'policy', `v:${version}`),
    script: (orgId, sha256) => buildKey(orgId, 'script', sha256),
    approval: (orgId, approvalId) => buildKey(orgId, 'approval', approvalId),
    result: (orgId, runOrApprovalId) => buildKey(orgId, 'result', runOrApprovalId),
    // Lookups (Strings)
    userByEmail: (orgId, emailLower) => buildKey(orgId, 'user_by_email', emailLower.toLowerCase()),
    agentKey: (orgId, keyHash) => buildKey(orgId, 'agentkey', keyHash),
    scriptCache: (orgId, hash) => buildKey(orgId, 'scriptcache', hash),
    killSwitch: (orgId, agentId) => buildKey(orgId, 'killswitch', agentId),
    // Counters & Limits
    budget: (orgId, agentId, yyyymmdd) => buildKey(orgId, 'budget', `${agentId}:${yyyymmdd}`),
    rateLimit: (orgId, agentId) => buildKey(orgId, 'rl', agentId),
    // Streams
    streamAudit: (orgId) => buildKey(orgId, 'stream:audit'),
    streamJobs: (orgId) => buildKey(orgId, 'stream:jobs'),
    streamJobsDlq: (orgId) => buildKey(orgId, 'stream:jobs:dlq'),
    streamPlayground: (orgId) => buildKey(orgId, 'stream:playground'),
};
//# sourceMappingURL=keys.js.map
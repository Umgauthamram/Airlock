/**
 * Redis Key Builders with {orgId} hash tags for single-slot cluster affinity and Lua atomic operations.
 */
export function buildKey(orgId: string, type: string, id?: string): string {
  const prefix = `org:{${orgId}}:${type}`;
  return id ? `${prefix}:${id}` : prefix;
}

export const RedisKeys = {
  // Documents (JSON)
  user: (orgId: string, userId: string) => buildKey(orgId, 'user', userId),
  invite: (orgId: string, emailLower: string) => buildKey(orgId, 'invite', emailLower.toLowerCase()),
  agent: (orgId: string, agentId: string) => buildKey(orgId, 'agent', agentId),
  server: (orgId: string, serverId: string) => buildKey(orgId, 'server', serverId),
  tool: (orgId: string, server: string, name: string) => buildKey(orgId, 'tool', `${server}:${name}`),
  policyActive: (orgId: string) => buildKey(orgId, 'policy', 'active'),
  policyVersion: (orgId: string, version: number) => buildKey(orgId, 'policy', `v:${version}`),
  script: (orgId: string, sha256: string) => buildKey(orgId, 'script', sha256),
  approval: (orgId: string, approvalId: string) => buildKey(orgId, 'approval', approvalId),
  result: (orgId: string, runOrApprovalId: string) => buildKey(orgId, 'result', runOrApprovalId),

  // Lookups (Strings)
  userByEmail: (orgId: string, emailLower: string) => buildKey(orgId, 'user_by_email', emailLower.toLowerCase()),
  agentKey: (orgId: string, keyHash: string) => buildKey(orgId, 'agentkey', keyHash),
  scriptCache: (orgId: string, hash: string) => buildKey(orgId, 'scriptcache', hash),
  killSwitch: (orgId: string, agentId: string) => buildKey(orgId, 'killswitch', agentId),

  // Counters & Limits
  budget: (orgId: string, agentId: string, yyyymmdd: string) => buildKey(orgId, 'budget', `${agentId}:${yyyymmdd}`),
  rateLimit: (orgId: string, agentId: string) => buildKey(orgId, 'rl', agentId),

  // Streams
  streamAudit: (orgId: string) => buildKey(orgId, 'stream:audit'),
  streamJobs: (orgId: string) => buildKey(orgId, 'stream:jobs'),
  streamJobsDlq: (orgId: string) => buildKey(orgId, 'stream:jobs:dlq'),
  streamPlayground: (orgId: string) => buildKey(orgId, 'stream:playground'),
};

/**
 * Redis Key Builders with {orgId} hash tags for single-slot cluster affinity and Lua atomic operations.
 */
export declare function buildKey(orgId: string, type: string, id?: string): string;
export declare const RedisKeys: {
    user: (orgId: string, userId: string) => string;
    invite: (orgId: string, emailLower: string) => string;
    agent: (orgId: string, agentId: string) => string;
    server: (orgId: string, serverId: string) => string;
    tool: (orgId: string, server: string, name: string) => string;
    policyActive: (orgId: string) => string;
    policyVersion: (orgId: string, version: number) => string;
    script: (orgId: string, sha256: string) => string;
    approval: (orgId: string, approvalId: string) => string;
    result: (orgId: string, runOrApprovalId: string) => string;
    userByEmail: (orgId: string, emailLower: string) => string;
    agentKey: (orgId: string, keyHash: string) => string;
    scriptCache: (orgId: string, hash: string) => string;
    killSwitch: (orgId: string, agentId: string) => string;
    budget: (orgId: string, agentId: string, yyyymmdd: string) => string;
    rateLimit: (orgId: string, agentId: string) => string;
    streamAudit: (orgId: string) => string;
    streamJobs: (orgId: string) => string;
    streamJobsDlq: (orgId: string) => string;
    streamPlayground: (orgId: string) => string;
};
//# sourceMappingURL=keys.d.ts.map
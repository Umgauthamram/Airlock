"use strict";
/**
 * Human and Machine Roles & Permission Validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
exports.hasMinimumRole = hasMinimumRole;
exports.isUserRole = isUserRole;
exports.Role = {
    VIEWER: 'viewer',
    OPERATOR: 'operator',
    ADMIN: 'admin',
};
const ROLE_RANKS = {
    viewer: 1,
    operator: 2,
    admin: 3,
};
/**
 * Checks whether userRole has at least requiredRole privileges.
 */
function hasMinimumRole(userRole, requiredRole) {
    if (!userRole)
        return false;
    const userRank = ROLE_RANKS[userRole] || 0;
    const requiredRank = ROLE_RANKS[requiredRole];
    return userRank >= requiredRank;
}
function isUserRole(value) {
    return typeof value === 'string' && (value === 'viewer' || value === 'operator' || value === 'admin');
}
//# sourceMappingURL=roles.js.map
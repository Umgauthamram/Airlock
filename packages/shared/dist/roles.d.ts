/**
 * Human and Machine Roles & Permission Validation
 */
export declare const Role: {
    readonly VIEWER: "viewer";
    readonly OPERATOR: "operator";
    readonly ADMIN: "admin";
};
export type UserRole = (typeof Role)[keyof typeof Role];
/**
 * Checks whether userRole has at least requiredRole privileges.
 */
export declare function hasMinimumRole(userRole: UserRole | string | undefined, requiredRole: UserRole): boolean;
export declare function isUserRole(value: unknown): value is UserRole;
//# sourceMappingURL=roles.d.ts.map
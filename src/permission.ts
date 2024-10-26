declare enum UserPermissions {
    MESSAGE = 0,
    DELETE_MESSAGE = 1,
};

export function addPermission(perm: number, add: number): number {
    return perm | add;
}

export function revokePermission(perm: number, revoke: number): number {
    return perm & ~revoke;
}

export function checkPermission(perm: number, check: number): boolean {
    return (perm & check) !== 0;
}
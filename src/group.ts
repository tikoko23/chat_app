import { DB, GroupQueryResult } from "./db.ts";
import { Optional, ResponseGroup } from "./types.ts";
import { Group, User } from "./types.ts";
import { fetchUser, userToResponse } from "./user.ts";
import { generateSalt } from "./crypt.ts";

export function createGroup(name: string, owner: Optional<User>): Group {
    if (owner === undefined)
        owner = null;

    const inviteLink = `${name}_${generateSalt(8)}`;

    DB.query(
        "INSERT OR IGNORE INTO groups (name, ownerId, inviteLink, createdAt) VALUES (?, ?, ?, datetime('now'))",
        [
            name,
            owner === null ? owner : owner.id,
            inviteLink
        ]
    );

    const result = DB.query("SELECT last_insert_rowid() AS id");

    if (!result || result.length === 0)
        throw new Error("Could not get last inserted row id");

    const groupId = result[0][0] as number;

    const group: Group = {
        id: groupId,
        name: name,
        owner: null,
        inviteLink: inviteLink
    };

    if (owner !== null) {
        joinGroup(group, owner);
        changeGroupOwner(group, owner);
    }

    group.owner = owner;

    return group;
}

export function changeGroupOwner(group: Group, newOwner: User | null): void {
    if (newOwner !== null && !isInGroup(group, newOwner))
        throw new Error("New owner must be in the group or null");

    const newOwnerId = newOwner === null ? null : newOwner.id;

    DB.query("UPDATE groups SET ownerId = ? WHERE id = ?", [ newOwnerId, group.id ]);
}

export function fetchGroup(how: "id", getter: number): Group | null;
export function fetchGroup(how: "name", getter: string): Group | null;
export function fetchGroup(how: "invite", getter: string): Group | null;
export function fetchGroup(how: "id" | "name" | "invite", getter: number | string): Group | null {
    let query: string = "";

    switch (how) {
        case "id":
            query = "SELECT * FROM groups WHERE id = ?";
            break;
        case "name":
            query = "SELECT * FROM groups WHERE name = ?";
            break;
        case "invite":
            query = "SELECT * FROM groups WHERE inviteLink = ?";
    }

    const result = DB.queryEntries<GroupQueryResult>(
        query,
        [ getter ]
    );

    if (!result || result.length === 0)
        return null;

    return parseGroupFromResult(result[0]);
}

export function parseGroupFromResult(result: GroupQueryResult): Group {
    const owner = fetchUser("id", Number(result.ownerId));

    return {
        id: Number(result.id),
        name: result.name,
        owner: owner,
        createdAt: result.createdAt,
        inviteLink: result.inviteLink
    }
}

export function getGroupsOwnedBy(user: User): Group[] {
    const result = DB.queryEntries<GroupQueryResult>("SELECT * FROM groups WHERE ownerId = ?", [ user.id ]);

    if (!result || result.length === 0)
        return [];

    return result.map(r => parseGroupFromResult(r));
}

export function isInGroup(group: Group, user: User): boolean {
    const result = DB.query("SELECT groupId FROM members WHERE userId = ? AND groupId = ?", [ user.id, group.id ]);

    return Boolean(result && result.length !== 0);
}

export function getMembersOfGroup(group: Group): User[] {
    const result = DB.queryEntries<{ userId: number }>("SELECT userId FROM members WHERE groupId = ?", [ group.id ]);

    if (!result || result.length === 0)
        return [];

    return result.map(e => fetchUser("id", e.userId)).filter(u => u !== null);
}

export function getJoinedGroups(user: User): Group[] {
    const result = DB.queryEntries<{ groupId: number }>("SELECT groupId FROM members WHERE userId = ?", [ user.id ]);

    if (!result || result.length === 0)
        return [];

    return result.map(e => fetchGroup("id", e.groupId)).filter(g => g !== null);
}

export function joinGroup(group: Group, user: User): void {
    DB.query(
        "INSERT OR IGNORE INTO members (groupId, userId, permissionLevel, joinedAt) VALUES (?, ?, ?, datetime('now'))",
        [ group.id, user.id, 0 ]
    );
}

export function leaveGroup(group: Group, user: User): void {
    if (group.owner?.id === user.id)
        throw new Error("Group owner cannot leave the group");

    DB.query("DELETE FROM members WHERE groupId = ? AND userId = ?", [ group.id, user.id ]);
}

export function groupToResponse(group: Group): ResponseGroup {
    return {
        id: group.id,
        name: group.name,
        owner: group.owner === null ? null : userToResponse(group.owner)
    };
}
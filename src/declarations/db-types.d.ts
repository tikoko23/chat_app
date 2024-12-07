export interface SQLiteDateRange {
    start: string,
    end: string
}

export interface BatchMessageFetchOptions {
    limit: number,
    offset?: number,
    date?: SQLiteDateRange,
    order?: "ASC" | "DESC",
    sortColumn?: string,
    userId?: number,
    groupId?: number
}

export type UserQueryResult = {
    id: number,
    name: string,
    displayName: string | null,
    email: string | null,
    createdAt: string,
    password: string,
    passwordSalt: string,
    token: string
}

export type GroupQueryResult = {
    id: number,
    name: string,
    ownerId: number,
    createdAt: string,
    inviteLink: string
}

export type MemberQueryResult = {
    groupId: number,
    userId: number,
    permissionLevel: number,
    joinedAt: string
}

export type MessageQueryResult = {
    id: number,
    groupId: number,
    authorId: number,
    replyId: number,
    createdAt: string,
    body: string,
    fullJson: string,
    attachments: string,
    editedAt: string | null
}
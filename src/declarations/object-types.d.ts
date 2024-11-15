import { Attachment } from "./file-types.d.ts"

export interface User {
    id: number,
    name: string,
    displayName: string | null,
    email: string | null,
    password: string,
    passwordSalt: string,
    token: string,
    createdAt?: string
}

export interface Group {
    id: number,
    name: string,
    owner: User | null,
    createdAt?: string,
    inviteLink: string
}

export interface MessageContent {
    body: string
}

export interface Message {
    id: number,
    group: Group,
    author: User,
    replyId: number | null,
    content: MessageContent,
    createdAt: string | null,
    attachments: Attachment[] | null,
    editedAt: string | null
}
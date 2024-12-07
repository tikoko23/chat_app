import { MessageContent } from "./object-types.d.ts";

export interface ResponseUser {
    id: number,
    name: string,
    displayName: string | null,
    createdAt?: string,
    email?: string
}

export interface ResponseGroup {
    id: number,
    name: string,
    owner: ResponseUser | null
}

export interface ResponseMessage {
    id: number,
    group: ResponseGroup,
    author: ResponseUser,
    replyId: number | null,
    content: MessageContent,
    createdAt: string | null,
    attachments: string[],
    editedAt: string | null
}

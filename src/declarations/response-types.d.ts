import { MessageContent } from "./object-types.d.ts";
import { Attachment } from "./file-types.d.ts";

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
    attachments: Attachment[] | null,
    editedAt: string | null
}

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | { [key: string]: JSONValue }
    | JSONValue[];

export type Optional<T> = T | null | undefined;
export type Nullable<T> = T | null;

export interface EndpointMeta {
    method: "GET" | "POST"
    exec: ((req: Request) => Promise<Response> | Response) | ((req: Request, post: Record<string, JSONValue>) => Promise<Response> | Response)
}

export interface DynamicPageMeta {
    exec: (req: Request) => Response | Promise<Response>
}

export interface User {
    id: number,
    name: string,
    displayName: Nullable<string>,
    email: Nullable<string>,
    password: string,
    passwordSalt: string,
    token: string,
    createdAt?: string
}

export interface ResponseUser {
    id: number,
    name: string,
    displayName: Nullable<string>,
    createdAt?: string,
    email?: string
}


export interface Group {
    id: number,
    name: string,
    owner: Nullable<User>,
    createdAt?: string,
    inviteLink: string
}

export interface ResponseGroup {
    id: number,
    name: string,
    owner: Nullable<ResponseUser>
}

export type AttachmentType =
    | "video"
    | "audio"
    | "image"
    | "archive"
    | "text"
    | "binary";

export interface File {
    path: string
}

export interface Attachment extends File {
    type: AttachmentType
}

export interface MessageContent {
    body: string
}

export interface Message {
    id: number,
    group: Group,
    author: User,
    replyId: Nullable<number>,
    content: MessageContent,
    createdAt: Nullable<string>,
    attachments: Nullable<Attachment[]>,
    editedAt: Nullable<string>
}

export interface ResponseMessage {
    id: number,
    group: ResponseGroup,
    author: ResponseUser,
    replyId: Nullable<number>,
    content: MessageContent,
    createdAt: Nullable<string>,
    attachments: Nullable<Attachment[]>,
    editedAt: Nullable<string>
}

export type MIMEType =
    | "text/plain"
    | "text/html"
    | "text/javascript"
    | "text/css"
    | "application/json"
    | "application/pdf"
    | "image/png"
    | "image/jpeg"
    | "image/gif"
    | "image/svg+xml"
    | "image/webp"
    | "audio/mpeg"
    | "audio/wav"
    | "audio/ogg"
    | "audio/aac"
    | "video/mp4"
    | "video/mpeg"
    | "application/octet-stream"

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

export interface WebSocketEvent {
    type: string,
    object: object
}
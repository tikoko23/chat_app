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
    | "application/octet-stream";

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
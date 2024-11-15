import { Attachment } from "./types.ts";

export const AttachmentTypeLiterals: readonly string[] = [
    "video",
    "audio",
    "image",
    "archive",
    "text",
    "binary"
];

export function isAttachment(object: unknown): object is Attachment {
    return (
        !Array.isArray(object) &&
        typeof object === "object" &&
        object !== null &&
        typeof (object as Record<string, unknown>).path === "string" &&
        typeof (object as Record<string, unknown>).type === "string" &&
        AttachmentTypeLiterals.includes((object as Record<string, unknown>).type as string)
    );
}
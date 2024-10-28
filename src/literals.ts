import { JSONValue } from "./types.d.ts";

export const AttachmentTypeLiterals: readonly string[] = [
    "video",
    "audio",
    "image",
    "archive",
    "text",
    "binary"
];

export function isAttachment(object: JSONValue): boolean {
    return (
        !Array.isArray(object) &&
        typeof object === "object" &&
        object !== null &&
        typeof object.path === "string" &&
        typeof object.type === "string" &&
        AttachmentTypeLiterals.includes(object.type)
    );
}
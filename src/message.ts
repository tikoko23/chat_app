import { QueryParameterSet } from "https://deno.land/x/sqlite@v3.9.1/src/query.ts";
import { DB, MessageQueryResult, MAXIMUM_DB_FETCH_SIZE } from "./db.ts";
import { fetchGroup, isInGroup } from "./group.ts";
import { Attachment, AttachmentType, BatchMessageFetchOptions, Group, Message, MessageContent, Nullable, Optional, User, SQLiteDateRange, JSONValue } from "./types.d.ts";
import { fetchUser } from "./user.ts";

export function createMessage(group: Group, sender: User, content: MessageContent, replyTo?: Optional<number>, attachments?: Attachment[]): Message {
    if (!isInGroup(group, sender))
        throw new Error("Sender must be in the group");

    if (replyTo === undefined)
        replyTo = null;

    if (replyTo !== null) {
        const repliedMsg = fetchMessage("id", replyTo);
        
        if (repliedMsg === null)
            throw new Error("Replied message must be a valid id");

        if (repliedMsg.group.id !== group.id)
            throw new Error("Replied message must be in the same channel");
    }

    let attachmentLinks: string[] = [];

    if (attachments !== undefined)
        attachmentLinks = attachments.map(a => a.path);

    const result = DB.queryEntries<MessageQueryResult>(
        "INSERT INTO messages (groupId, authorId, replyId, body, fullJson, attachments, editedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now')) RETURNING *",
        [
            group.id,
            sender.id,
            replyTo,
            content.body,
            JSON.stringify(content),
            JSON.stringify(attachmentLinks),
            null
        ]
    );

    if (!result || result.length === 0)
        throw new Error("Could not get last inserted message");

    return parseMessageFromResult(result[0]);
}

export function editMessage(message: Message, newContent: MessageContent): void {
    DB.query(
        "UPDATE messages SET body = ?, fullJson = ?, editedAt = datetime('now') WHERE id = ?",
        [
            newContent.body,
            JSON.stringify(newContent),
            message.id
        ]
    );
}

export function fetchMessage(how: "batch", getter: BatchMessageFetchOptions): Nullable<Message[]>;
export function fetchMessage(how: "id", getter: number): Nullable<Message>;
export function fetchMessage(how: "id" | "batch", getter: number | BatchMessageFetchOptions): Nullable<Message> | Nullable<Message[]> {
    switch (how) {
        case "id": {
            const result = DB.queryEntries<MessageQueryResult>("SELECT * FROM messages WHERE id = ?", [ getter as number ]);

            if (!result || result.length === 0)
                return null;

            return parseMessageFromResult(result[0]);
        }
        case "batch": {
            getter = getter as BatchMessageFetchOptions;

            if (getter.limit > MAXIMUM_DB_FETCH_SIZE)
                throw new Error(`Limit mustn't be greater than ${MAXIMUM_DB_FETCH_SIZE}`);
            
            const filterRegex = /^[a-zA-Z0-9_]+$/;

            for (const value of [ getter.sortColumn, getter.order ]) {
                if (value === undefined)
                    continue;

                if (!filterRegex.test(value))
                    throw new Error("Arguments must be alphanumerical");
            }
            
            let query = "SELECT * FROM messages";
            const args: QueryParameterSet = [];

            let iterator = [
                { type: "g", value: getter.groupId },
                { type: "u", value: getter.userId  },
                { type: "d", value: getter.date    },
            ];

            iterator = iterator.filter(i => i.value !== undefined);

            if (iterator.length > 0) {
                query += " WHERE ";
    
                iterator.forEach((v, i) => {
                    switch (v.type) {
                        case "g":
                            query += "(groupId = ?)";
                            args.push(v.value as number);
                            break;
                        case "u":
                            query += "(authorId = ?)";
                            args.push(v.value as number);
                            break;
                        case "d":
                            query += "(createdAt BETWEEN ? AND ?)";
                            args.push((v.value as SQLiteDateRange).start, (v.value as SQLiteDateRange).end);
                    }

                    if (i !== iterator.length - 1)
                        query += " AND ";
                });
            }

            if (getter.sortColumn !== undefined)
                query += ` ORDER BY ${getter.sortColumn}${getter.order ? ` ${getter.order}` : ""}`;

            query += ` LIMIT ${getter.limit}${getter.offset ? ` OFFSET ${getter.offset}` : ""}`;

            const result = DB.queryEntries<MessageQueryResult>(query, args);

            if (!result || result.length === 0)
                return null;

            return result.map(r => parseMessageFromResult(r));
        }
    }
}

export function parseMessageFromResult(result: MessageQueryResult): Message {
    const group = fetchGroup("id", result.groupId);
    const author = fetchUser("id", result.authorId);

    if (group === null)
        throw new Error("Invalid group");

    if (author === null)
        throw new Error("Invalid author");

    let content: MessageContent = { body: "" };

    try {
        content = JSON.parse(result.fullJson);
    } catch (_e) {
        content = {
            body: result.body
        };
    }

    let attachments: Nullable<Attachment[]> = null;

    if (result.attachments !== null) {
        try {
            const attachmentLinks: string[] = JSON.parse(result.attachments);

            attachments = attachmentLinks.map(l => { return { path: l, type: getAttachmentTypeFromFilename(l) }; });
        } catch (_e) {
            attachments = null
        }
    }
    
    return {
        id: Number(result.id),
        group: group,
        author: author,
        replyId: result.replyId,
        createdAt: result.createdAt,
        content: content,
        attachments: attachments,
        editedAt: result.editedAt
    };
}

export function getAttachmentTypeFromFilename(name: string): AttachmentType {
    const extension = name.substring(name.lastIndexOf("."));

    switch (extension) {
        case ".mp4":
        case ".mov":
            return "video";
        case ".png":
        case ".jpg":
        case ".jpeg":
            return "image";
        case ".mp3":
        case ".ogg":
        case ".wav":
            return "audio";
        case ".txt":
            return "text";
        case ".zip":
        case ".7z":
        case ".rar":
        case ".tar":
        case ".gz":
            return "archive";
        default:
            return "binary";
    }
}

export function isMessageContent(object: JSONValue): boolean {
    return typeof object === "object" && object !== null && !Array.isArray(object) && object.body !== undefined;
}
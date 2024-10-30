import { fetchGroup, getJoinedGroups } from "../../group.ts";
import { isAttachment } from "../../literals.ts";
import { createMessage, isMessageContent, messageToResponse } from "../../message.ts";
import { EndpointMeta, Attachment, JSONValue, MessageContent } from "../../types.d.ts";
import { fetchUser, getTokenFromRequest } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "POST",
    exec: (req: Request, post: Record<string, JSONValue>): Response => {
        const token = getTokenFromRequest(req);

        if (token === null)
            return new Response("Authorization header must be provided", { status: 401 });

        const user = fetchUser("token", token);

        if (user === null)
            return new Response("Invalid token", { status: 401 });

        const messageContent = post["messageContent"];
        const groupId = post["groupId"];
        const replyTo = post["replyTo"];
        let attachments: JSONValue | undefined = post["attachments"];

        if (!isMessageContent(messageContent))
            return new Response("Malformed message content", { status: 400 });

        if (typeof groupId !== "number")
            return new Response("Group id must be a number", { status: 400 });

        if (replyTo !== undefined && typeof replyTo !== "number")
            return new Response("Reply to must be a number if provided", { status: 400 });

        if (!Array.isArray(attachments) || attachments.length === 0)
            attachments = undefined;

        const attachmentsInvalid = attachments !== undefined && !attachments.every(isAttachment);

        if (attachmentsInvalid)
            return new Response("Malformed attachment(s)", { status: 400 });

        const group = fetchGroup("id", groupId);

        if (group === null)
            return new Response("Group not found", { status: 404 });

        const userGroups = getJoinedGroups(user);

        if (!userGroups.some(g => g.id === group.id))
            return new Response("Group forbidden", { status: 403 });

        const message = createMessage(
            group,
            user,
            messageContent as unknown as MessageContent,
            replyTo,
            attachments as unknown as Attachment[]
        );

        return new Response(JSON.stringify(messageToResponse(message)), { status: 201 });
    }
};

export default requestMeta;
import { getJoinedGroups } from "../../group.ts";
import { fetchMessage, messageToResponse } from "../../message.ts";
import { BatchMessageFetchOptions, EndpointMeta, JSONValue, SQLiteDateRange } from "../../types.ts";
import { fetchUser, getTokenFromRequest } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "POST",
    exec: (req: Request, post: Record<string, JSONValue>): Response => {
        const token = getTokenFromRequest(req);

        if (token === null)
            return new Response("Authorization header must be provided", { status: 401 });

        const requestingUser = fetchUser("token", token);

        if (requestingUser === null)
            return new Response("Invalid token", { status: 401 });

        if (post["id"]) {
            if (typeof post["id"] !== "number")
                return new Response("Id must be number if provided", { status: 400 });

            const message = fetchMessage("id", post["id"]);

            if (message === null)
                return new Response("Not found", { status: 404 });

            const userGroups = getJoinedGroups(requestingUser);
            const isInUsersGroup = userGroups.some(g => g.id === message.group.id);

            if (message.author.id !== requestingUser.id && !isInUsersGroup)
                return new Response("Forbidden", { status: 403 });

            return new Response(JSON.stringify(message), { status: 200 });
        }

        const limit = post["limit"] || 16;
        const offset = post["offset"] || 0;
        const sortBy = post["sort"] ?? undefined;
        const dateRange = post["dateRange"] ?? undefined;

        const groupId = post["groupId"] ?? undefined;
        const authorId = post["authorId"] ?? undefined;

        const order = post["order"] ?? undefined;

        if (order !== undefined && order !== "ASC" && order !== "DESC")
            return new Response("Order must be 'ASC' or 'DESC' if provided", { status: 400 });

        if (groupId !== undefined && typeof groupId !== "number")
            return new Response("Group id must be a number if provided", { status: 400 });

        if (authorId !== undefined && typeof authorId !== "number")
            return new Response("Author id must be a number if provided", { status: 400 });

        if (typeof limit !== "number")
            return new Response("Limit must be number", { status: 400 });

        if (dateRange !== undefined && typeof dateRange !== "object")
            return new Response("Date range must be a range of strings", { status: 400 });

        if (Array.isArray(dateRange))
            return new Response("Date range must be a range of strings", { status: 400 });

        if (dateRange !== undefined && (typeof dateRange.start !== "string" || typeof dateRange.end !== "string"))
            return new Response("Date range must be a range of strings", { status: 400 });

        const messages = fetchMessage("batch", {
            limit: limit,
            date: dateRange as unknown as SQLiteDateRange,
            sortColumn: sortBy,
            groupId: groupId,
            userId: authorId,
            offset: offset,
            order: order
        } as BatchMessageFetchOptions);

        if (messages === null)
            return new Response("Not found", { status: 404 });

        const userGroups = getJoinedGroups(requestingUser);

        const allowed = messages
            .filter(m => (m.author.id === requestingUser.id || userGroups.some(g => g.id === m.group.id)))
            .map(m => messageToResponse(m));

        if (allowed.length === 0)
            return new Response("Not found", { status: 404 });

        return new Response(JSON.stringify(allowed), { status: 200 });
    }
};

export default requestMeta;
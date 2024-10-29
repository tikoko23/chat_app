import { createGroup, groupToResponse } from "../../group.ts";
import { EndpointMeta, JSONValue } from "../../types.d.ts";
import { fetchUser, getTokenFromRequest } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "POST",
    exec: (req: Request, post: Record<string, JSONValue>): Response => {
        const token = getTokenFromRequest(req);

        const name = post.name;

        if (typeof name !== "string")
            return new Response("Group name must be string");

        if (token === null)
            return new Response("Authorization header must be provided", { status: 401 });

        const user = fetchUser("token", token);

        if (user === null)
            return new Response("Invalid token", { status: 401 });

        const group = createGroup(name, user);

        const response = groupToResponse(group);

        return new Response(JSON.stringify(response), { status: 200 });
    }
};

export default requestMeta;
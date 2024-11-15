import { isInGroup } from "../../group.ts";
import { fetchGroup, groupToResponse, joinGroup } from "../../group.ts";
import { EndpointMeta } from "../../types.ts";
import { fetchUser, getTokenFromRequest } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "GET",
    exec: (req: Request): Response => {
        const token = getTokenFromRequest(req);

        const url = new URL(req.url);

        const invite = url.searchParams.get("invite");

        if (invite === null)
            return new Response("Invite must be provided", { status: 400 });

        if (token === null)
            return new Response("Authorization header must be provided", { status: 401 });

        const user = fetchUser("token", token);

        if (user === null)
            return new Response("Invalid token", { status: 401 });

        const group = fetchGroup("invite", invite);

        if (group === null)
            return new Response("Invalid invite", { status: 400 });

        if (isInGroup(group, user))
            return new Response("Already in group", { status: 400 });

        joinGroup(group, user);

        const response = groupToResponse(group);

        return new Response(JSON.stringify(response), { status: 200 });
    }
};

export default requestMeta;
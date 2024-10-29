import { fetchGroup, groupToResponse } from "../../group.ts";
import { EndpointMeta } from "../../types.d.ts";
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

        const response = groupToResponse(group);

        return new Response(JSON.stringify(response), { status: 200 });
    }
};

export default requestMeta;
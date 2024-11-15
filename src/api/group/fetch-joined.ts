import { getJoinedGroups, groupToResponse } from "../../group.ts";
import { EndpointMeta } from "../../types.ts";
import { fetchUser, getTokenFromRequest } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "GET",
    exec: (req: Request): Response => {
        const token = getTokenFromRequest(req);

        if (token === null)
            return new Response("Authorization header must be provided", { status: 401 });

        const user = fetchUser("token", token);

        if (user === null)
            return new Response("Invalid token", { status: 401 });

        const groups = getJoinedGroups(user).map(groupToResponse);

        return new Response(JSON.stringify(groups), { status: 200 });
    }
}

export default requestMeta;
import { EndpointMeta } from "../../types.d.ts";
import { fetchUser, getTokenFromRequest, userToResponse } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "GET",
    exec: (req: Request): Response => {
        const token = getTokenFromRequest(req);

        if (token === null)
            return new Response("Authorization header must be provided", { status: 401 });

        const user = fetchUser("token", token);

        if (user === null)
            return new Response("Invalid token", { status: 404 });

        const result = userToResponse(user, false);

        return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "appliaction/json" } });
    }
};

export default requestMeta;
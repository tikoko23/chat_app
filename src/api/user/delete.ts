import { deleteUser, getTokenFromRequest } from "../../user.ts";
import { EndpointMeta } from "../../types.d.ts";
import { fetchUser } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "GET",
    exec: (req: Request): Response => {
        const token = getTokenFromRequest(req);
        
        if (token === null)
            return new Response("Authorization header must include a token", { status: 400 });

        const data = fetchUser("token", token);

        if (data === null)
            return new Response("Invalid token", { status: 400 });

        deleteUser(data);

        return new Response("OK", { status: 200 });
    }
}

export default requestMeta;
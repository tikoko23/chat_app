import { EndpointMeta, JSONValue } from "../../types.d.ts";
import { createUser } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "POST",
    exec: async (_req: Request, post: Record<string, JSONValue>): Promise<Response> => {

        const username = post["username"];
        const password = post["password"];
        const displayName = post["displayName"];
        const email = post["email"];

        if (!username)
            return new Response("Username is required", { status: 400 });
        
        if (!password)
            return new Response("Password is required", { status: 400 });

        if (typeof username !== "string")
            return new Response("Username must be a string", { status: 400 });

        if (typeof password !== "string")
            return new Response("Password must be a string", { status: 400 });

        if (typeof displayName !== "string" && displayName !== null && displayName !== undefined)
            return new Response("Display name must be a string or null or undefined", { status: 400 });

        if (typeof email !== "string" && email !== null && email !== undefined)
            return new Response("Email must be a string or null or undefined", { status: 400 });

        const added = await createUser(username, password, displayName, email);

        if (added === null)
            return new Response("User already exists", { status: 400 });

        return new Response("OK", { status: 201 });
    }
};

export default requestMeta;
import { hashString } from "../../crypt.ts";
import { EndpointMeta, JSONValue } from "../../types.ts";
import { fetchUser, isValidUser } from "../../user.ts";

const requestMeta: EndpointMeta = {
    method: "POST",
    exec: async (_req: Request, post: Record<string, JSONValue>): Promise<Response> => {
        const username = post["username"];
        const password = post["password"];

        if (!username)
            return new Response("Username is required", { status: 400 });

        if (!password)
            return new Response("Password is required", { status: 400 });

        if (typeof username !== "string")
            return new Response("Username must be a string", { status: 400 });

        if (typeof password !== "string")
            return new Response("Password must be a string", { status: 400 });

        let generatedToken: string

        try {
            generatedToken = await pullTokenFromDatabase(username, password);
        } catch (e) {
            switch ((e as Record<string, unknown>).message) {
            case "Invalid credentials":
                return new Response("Invalid credentials", { status: 401 });
            case "Token is not a string":
                return new Response("Broken database entry", { status: 400 });
            case "User does not exist":
                return new Response("User does not exist", { status: 404 });
            default:
                return new Response("Internal server error", { status: 500 });
            }
        }

        return new Response(
            JSON.stringify({
                status: "OK",
                token: generatedToken
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}

export default requestMeta;

export async function generateAccessToken(username: string, password: string, firstTime: boolean = false): Promise<string> {

    if (!firstTime && !await isValidUser(username, password))
        throw new Error("Invalid credentials");

    const tokenSource = `${username}:${crypto.randomUUID()}@${Date.now()}`;
    const token = await hashString(tokenSource);
    return token;
}

export async function pullTokenFromDatabase(username: string, password: string): Promise<string> {
    if (!await isValidUser(username, password))
        throw new Error("Invalid credentials");

    const user = fetchUser("name", username);

    if (user === null)
        throw new Error("User does not exist");

    return user.token;
}
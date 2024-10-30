export const SOCKETS: Record<string, WebSocket[]> = {};

const MAX_CONNECTIONS_PER_ACCOUNT = 16;

export function processSocketRequest(req: Request): Response {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (token === null)
        return new Response("Authorization header must be provided", { status: 401 });

    const requestSocketKey = req.headers.get("Sec-WebSocket-Key");

    if (requestSocketKey === null)
        return new Response("Sec-WebSocket-Key was not provided", { status: 400 });

    const { socket, response } = Deno.upgradeWebSocket(req);

    if (SOCKETS[token] === undefined)
        SOCKETS[token] = [];

    if (SOCKETS[token].length >= MAX_CONNECTIONS_PER_ACCOUNT)
        return new Response(`Maximum connections per account is reached (${MAX_CONNECTIONS_PER_ACCOUNT})`, { status: 503 });

    SOCKETS[token].push(socket);

    return response;
}
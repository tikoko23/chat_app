import "./init.ts";

import { loadApi, processApiRequest } from "./api.ts";
import { serveRequest } from "./cdn.ts";
import { DB, initDefaultTables, loadDefaultDB } from "./db.ts";
import { serveHtml, loadDynamicPages, parseHtml } from "./html.ts";
import { processSocketRequest } from "./websocket.ts";
import { CONSOLE_PROMPT, initConsole } from "./console.ts";
import { getConfig } from "./config.ts";
import { CFG_PATHS } from "./config-paths.ts";

const SERVE_ROOT        = getConfig<string>(`${CFG_PATHS.server}/serve_root`)         ?? ".";
const RICKROLL_REDIRECT = getConfig<boolean>(`${CFG_PATHS.server}/rickroll_redirect`) ?? false;

const rickrollDetector = /never.*gonna.*give.*you.*up/gi;

if (import.meta.main) {
    initConsole();

    loadMainDB();
    serve().then(() => {
        Deno.stdout.write(CONSOLE_PROMPT);
    });
}

export function loadMainDB() {
    loadDefaultDB();
    initDefaultTables(DB);
}

export async function serve(): Promise<Deno.HttpServer<Deno.NetAddr>> {
    console.log("Activating API");
    {
        const count = await loadApi(true, "   ");

        console.log(`Successfully activated ${count} endpoints`);
    }

    await parseHtml();

    const dynamicPages = await loadDynamicPages();

    return Deno.serve(async (req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>): Promise<Response> => {
        const now = new Date(Date.now());

        const fullAddress = `${info.remoteAddr.hostname}:${info.remoteAddr.port}`;
        const seconds = `${(now.getMilliseconds() / 1e3).toFixed(3)}`;
        const timestamp = `${(now.toUTCString())} @${seconds}`;

        console.log(`${timestamp} | ${req.method} ${fullAddress} -> ${req.url}`);

        const url = new URL(req.url);
        const path = url.pathname;

        if (path.startsWith("/info") || rickrollDetector.test(url.pathname) || RICKROLL_REDIRECT)
            return new Response(null, {
                status: 302,
                headers: {
                    "Location": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                }
            });

        if (path.startsWith("/api"))
            return await processApiRequest(req, url);

        if (path.startsWith("/socket"))
            return processSocketRequest(req);

        if (path.startsWith("/cdn") || path.startsWith("/asset") || path.startsWith("/styles") || path.startsWith("/scripts"))
            return await serveRequest(req, SERVE_ROOT);

        if (dynamicPages[url.pathname] !== undefined)
            return await dynamicPages[url.pathname].exec(req);

        return await serveHtml(url.pathname);
    })
}
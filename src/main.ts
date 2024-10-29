import { loadApi, processApiRequest } from "./api.ts";
import { serveFile } from "./cdn.ts";
import { DB, initDefaultTables, loadDefaultDB } from "./db.ts";
import { getHtml, loadDynamicPages, parseHtml } from "./html.ts";

const KILL_SWITCH = false;

const rickrollDetector = /never.*gonna.*give.*you.*up/gi;

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

    return Deno.serve(async (req: Request, info: Deno.ServeHandlerInfo): Promise<Response> => {
        const now = new Date(Date.now());
        console.log(`${(now.toUTCString())} @${(now.getMilliseconds() / 1e3).toFixed(3)} | ${req.method} ${info.remoteAddr.hostname}:${info.remoteAddr.port} -> ${req.url}`);

        const url = new URL(req.url);

        if (KILL_SWITCH)
            return new Response(null, {
                status: 302,
                headers: {
                    "Location": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                }
            });

        if (url.pathname === "/")
            return new Response(getHtml("/index.html"), {
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                }
            });

        if (url.pathname.startsWith("/info") || rickrollDetector.test(url.pathname))
            return new Response(null, {
                status: 302,
                headers: {
                    "Location": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                }
            });

        if (url.pathname.startsWith("/api"))
            return await processApiRequest(req, url);

        if (url.pathname.startsWith("/cdn"))
            return serveFile(req, url.pathname.replace(/^\/cdn/g, ""));

        if (url.pathname.startsWith("/asset"))
            return serveFile(req, url.pathname.replace(/^\/asset/g, ""), "./asset");

        if (url.pathname.startsWith("/styles")) {
            if (url.pathname !== url.pathname.replace(/\.\.\/|\/\.\.|\\|\.\.\\/g, ""))
                return new Response("Forbidden", { status: 403 });

            try {
                const content = await Deno.readFile(`.${url.pathname}`);
                return new Response(content, { status: 200, headers: { "Content-Type": "text/css" }});
            } catch (_e) {
                return new Response("Not found", { status: 404 });
            }
        }

        if (url.pathname.startsWith("/scripts")) {
            if (url.pathname !== url.pathname.replace(/\.\.\/|\/\.\.|\\|\.\.\\/g, ""))
                return new Response("Forbidden", { status: 403 });

            try {
                const content = await Deno.readFile(`.${url.pathname}`);
                return new Response(content, { status: 200, headers: { "Content-Type": "application/javascript" }});
            } catch (_e) {
                return new Response("Not found", { status: 404 });
            }
        }

        if (dynamicPages[url.pathname] !== undefined)
            return await dynamicPages[url.pathname].exec(req);
        
        return new Response(getHtml(url.pathname), {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        });
    })
}

if (import.meta.main) {
    loadMainDB();
    serve();
}
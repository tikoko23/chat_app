import { loadApi, processApiRequest } from "./api.ts";
import { serveFile } from "./cdn.ts";
import { initDefaultTables } from "./db.ts";
import { getHtml, loadDynamicPages, parseHtml } from "./html.ts";
import { getMembersOfGroup } from "./group.ts";
import { changeGroupOwner, createGroup, fetchGroup, joinGroup, leaveGroup } from "./group.ts";
import { createMessage, editMessage, fetchMessage } from "./message.ts";
import { Group, User } from "./types.d.ts";
import { fetchUser } from "./user.ts";

const KILL_SWITCH = false;

console.log("Activating API");
{
    const count = await loadApi(true, "   ");

    console.log(`Successfully activated ${count} endpoints`);
}

// await runCmd("./clear_database.sh");

initDefaultTables();

await parseHtml();

const dynamicPages = await loadDynamicPages();

const rickrollDetector = /never.*gonna.*give.*you.*up/gi;

Deno.serve(async (req: Request, info: Deno.ServeHandlerInfo): Promise<Response> => {
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
});

export function runCmd(cmd_str: string, args: Deno.CommandOptions = {}): Promise<Deno.CommandOutput> {
    const cmd = new Deno.Command(cmd_str, args);
    return cmd.output();
}

if (1 !== 1) {
    try {
        await runCmd("./create_dummy_user.sh");

        const test = fetchUser("name", "TEST") as User;
        const test_2 = fetchUser("name", "TEST_2") as User;
        const group = createGroup("TEST_GROUP", test);
        
        try {
            changeGroupOwner(fetchGroup("name", group.name) as Group, test_2);
        } catch (e) {
            console.error(e.message);
        }

        try {
            leaveGroup(fetchGroup("name", group.name) as Group, test);
        } catch (e) {
            console.error(e.message);
        }

        joinGroup(fetchGroup("name", group.name) as Group, test_2);

        changeGroupOwner(fetchGroup("name", group.name) as Group, test_2);
        
        changeGroupOwner(fetchGroup("name", group.name) as Group, null);

        getMembersOfGroup(fetchGroup("id", group.id) as Group).forEach(u => console.log(u.name));

        const msg = createMessage(fetchGroup("id", group.id) as Group, test, { body: "hi" });
        createMessage(fetchGroup("id", group.id) as Group, test_2, { body: "hi back!" }, msg.id);

        editMessage(msg, { body: "not hi anymore :c" });

        const messages = fetchMessage("batch", {
            limit: 4,
            date: { start: "2024-10-24 14:08:10", end: "2024-10-24 17:10:59" },
            groupId: 1,
            order: "DESC",
            sortColumn: "authorId"
        });

        console.log(messages);

        leaveGroup(fetchGroup("id", group.id) as Group, test);

        leaveGroup(fetchGroup("id", group.id) as Group, test_2);
    } catch (e) {
        console.error(e);
    }
}
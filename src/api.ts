import { DB } from "./db.ts"
import { EndpointMeta } from "./types.d.ts";
import { JSONValue } from "./types.d.ts";

export let API: Record<string, EndpointMeta> = {};

export async function processApiRequest(req: Request, url: URL): Promise<Response> {
    if (!API[url.pathname])
        return new Response("Endpoint not found", { status: 404 });

    const endpointMeta = API[url.pathname];

    if (endpointMeta.method !== req.method)
        return new Response("Method not allowed", { status: 405 });

    let postArgs: Record<string, JSONValue> | undefined = undefined;

    if (req.method === "POST") {
        try {
            postArgs = await req.json();
            if (Array.isArray(postArgs))
                throw new Error();
        } catch (_e) {
            postArgs = undefined
        }
    }

    return await endpointMeta.exec(req, postArgs || {});
}

export async function loadApi(log: boolean = false, prefix: string = ""): Promise<number> {
    const descendants = getDescendants("./src/api").filter(path => path.endsWith(".ts")).map(path => path.replace(/\.ts$/g, ""));
    const modules: Record<string, EndpointMeta> = {};

    let count = 0
    for (const path of descendants) {
        const module = await import(`../${path}.ts`);
        const sanitizedPath = path.replace(/^\.\/src/g, "");
        modules[sanitizedPath] = module.default;
        ++count;
        if (log)
            console.log(`${prefix}${modules[sanitizedPath].method}: ${sanitizedPath}`);
    }

    API = modules;

    return count;
}

export function closeApi() {
    for (const db of Object.values(DB)) {
        db.close();
    }
}

export function getDescendants(path: string, followSymlink: boolean = true, countDirectiories: boolean = false): string[] {
    let dirContents;

    try {
        dirContents = Deno.readDirSync(path);
    } catch (_e) {
        return [];
    }

    const desc: string[] = [];

    for (const entry of dirContents) {
        if (entry.isDirectory) {
            if (countDirectiories)
                desc.push(`${path}/${entry.name}`);

            desc.push(...getDescendants(`${path}/${entry.name}`, followSymlink, countDirectiories));
        } else if (followSymlink && entry.isSymlink) {
            const targetPath: string = Deno.readLinkSync(`${path}/${entry.name}`);
            const stat = Deno.statSync(targetPath);

            if (stat.isFile)
                desc.push(targetPath);
            else {
                if (countDirectiories)
                    desc.push(`${path}/${entry.name}`);

                desc.push(...getDescendants(targetPath, followSymlink, countDirectiories));
            }
        } else
            desc.push(`${path}/${entry.name}`);
    }

    return desc;
}
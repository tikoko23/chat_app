import { MIMEType, User } from "./types.ts";
import { extname, dirname } from "https://deno.land/std@0.202.0/path/mod.ts";
import { writeAll } from "https://deno.land/std@0.224.0/io/write_all.ts";
import { fetchUser } from "./user.ts";
import { Optional } from "./types.ts";

const DISABLE_FILE_CACHE = true;

const CDN_ROOT = "./cdn";
const USER_UPLOAD_SUBDIR = "user_upload";
const MAX_UPLOAD_SIZE_BYTES = 8388608;
const MAX_FILENAME_LENGTH = 255;

export async function serveFile(path: string, forcedMIME?: Optional<string>): Promise<Response> {
    if (/\.\.\/|\/\.\./.test(path))
        return new Response("Cannot target parent directory", { status: 400 });

    try {
        const lstat = await Deno.lstat(path);

        if (!lstat.isFile)
            return new Response("Resource isn't a regular file", { status: 403 });

    } catch (_e) {
        return new Response("Resource not found", { status: 404 });
    }

    const data = await Deno.readFile(path);

    const responseHeaders: Record<string, string> = { "Content-Type": forcedMIME ?? getContentType(path) }

    if (DISABLE_FILE_CACHE)
        responseHeaders["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";

    return new Response(data, { headers: responseHeaders, status: 200 });
}

export async function serveRequest(req: Request, root: string = CDN_ROOT): Promise<Response> {
    if (req.method !== "GET")
        return new Response("Method not allowed", { status: 405 });

    const url = new URL(req.url);

    const forcedMIME = url.searchParams.get("mime");

    return await serveFile(`${root}${url.pathname}`, forcedMIME);
}

export async function addFile(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method !== "POST")
        return new Response("Method not allowed", { status: 405 });

    const contentLength = req.headers.get("Content-Length");

    if (contentLength && parseInt(contentLength) > MAX_UPLOAD_SIZE_BYTES) {
        return new Response("Maximum upload size is 8MiB", { status: 413 });
    }

    const token = req.headers.get("Authorization");

    let data: User | null;

    if (token === null || (data = fetchUser("token", token)) === null)
        return new Response("Invalid token", { status: 401 });

    const path = url.searchParams.get("filename");

    const filename = sanitizeFilename(`${Date.now()}___${path ?? "upload"}`);

    const filePath = `${CDN_ROOT}/${USER_UPLOAD_SUBDIR}/${data.id}/${filename}`;

    const body = req.body;

    if (body === null)
        return new Response("File data not provided", { status: 400 });

    await Deno.mkdir(dirname(filePath), { recursive: true });

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
        reader = body.getReader();
    } catch (error) {
        console.error(error);
        return new Response("Malformed request body", { status: 400 });
    }

    let writer: Deno.FsFile | null = null;

    try {
        writer = await Deno.open(filePath, { write: true, create: true });
    } catch (error) {
        console.error(error);

        return new Response("Internal server error", { status: 507 });
    }

    let totalBytes = 0;
    try {
        while (totalBytes <= MAX_UPLOAD_SIZE_BYTES) {
            const data = await reader.read();

            if (data.done)
                break;

            if (!data.value)
                continue;

            totalBytes += data.value.byteLength;

            await writeAll(writer, data.value);
        }
    } catch (error) {
        console.error(error);
        writer.close();
        await Deno.remove(filePath).catch(console.error);

        return new Response("Internal server error", { status: 507 });
    } finally {
        writer.close();
    }


    if (totalBytes > MAX_UPLOAD_SIZE_BYTES) {
        await Deno.remove(filePath);
        return new Response("Maximum upload size is 8MiB", { status: 413 });
    }

    return new Response(JSON.stringify({ path: filePath, status: "OK" }), { status: 200, headers: { "Location": filePath } });
}

function getContentType(path: string): MIMEType {
    const ext = extname(path);
    switch (ext) {
    case ".htm":
    case ".html":
        return "text/html";
    case ".js":
        return "text/javascript";
    case ".css":
        return "text/css";
    case ".json":
        return "application/json";
    case ".pdf":
        return "application/pdf";
    case ".png":
        return "image/png";
    case ".jpg":
    case ".jpeg":
        return "image/jpeg";
    case ".gif":
        return "image/gif";
    case ".svg":
        return "image/svg+xml";
    case ".webp":
        return "image/webp";
    case ".mp3":
        return "audio/mpeg";
    case ".wav":
        return "audio/wav";
    case ".ogg":
        return "audio/ogg";
    case ".aac":
        return "audio/aac";
    case ".mp4":
        return "video/mp4";
    case ".mpeg":
        return "video/mpeg";
    case ".txt":
        return "text/plain";
    default:
        return "application/octet-stream";
    }
}

export function sanitizeFilename(name: string): string {
    return name
        .replace(/\.\.\/|\/\.\./g, "")
        .replace(/[<>:"/\\|?*]/g, "_")
        .replace(/^\.+|\.+$/g, "")
        .substring(0, MAX_FILENAME_LENGTH);
}

import { readAll } from "../scripts/read-all.js";
import { Nullable } from "./types.d.ts";

export function runCmd(cmd_str: string, args: Deno.CommandOptions = {}): Promise<Deno.CommandOutput> {
    const cmd = new Deno.Command(cmd_str, args);
    return cmd.output();
}

export async function extractStringFromStream(steam: ReadableStream<Uint8Array>): Promise<string>
export async function extractStringFromStream(steam: Nullable<ReadableStream<Uint8Array>>): Promise<null>
export async function extractStringFromStream(stream: Nullable<ReadableStream<Uint8Array>>): Promise<Nullable<string>> {
    if (stream === null)
        return stream;

    const bytes = await readAll(stream);
    return String.fromCharCode(...bytes);
}
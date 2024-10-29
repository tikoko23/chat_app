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

export async function readAll(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
    const reader = stream.getReader();

    let fullData = new Uint8Array();
    
    while (true) {
        const { value, done } = await reader.read();

        if (done)
            break;

        const newData = new Uint8Array(fullData.length + value.length);
        newData.set(fullData);
        newData.set(value, fullData.length);
        fullData = newData;
    }

    return fullData;
}
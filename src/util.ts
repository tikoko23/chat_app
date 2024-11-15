export function runCmd(cmd_str: string, args: Deno.CommandOptions = {}): Promise<Deno.CommandOutput> {
    const cmd = new Deno.Command(cmd_str, args);
    return cmd.output();
}

export async function extractStringFromStream(stream: null): Promise<null>
export async function extractStringFromStream(stream: ReadableStream<Uint8Array>): Promise<string>
export async function extractStringFromStream(stream: ReadableStream<Uint8Array> | null): Promise<string | null> {
    if (stream === null)
        return null;

    const bytes = await readAll(stream);
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
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
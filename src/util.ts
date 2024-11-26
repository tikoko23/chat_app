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

/**
 * Adds an empty line above the cursor; then prints `message` and puts the cursor back where it was, keeping the current line of text.
 * Any text that would overflow after shifting the lines down will be scrolled away. This is done by creating two new lines to be overwritten and this hasn't been thoroughly tested.
 * @param message
 * @param fd Can be `Deno.stdout` or `Deno.stderr`
 */
export function logAbove(message: string, fd: typeof Deno.stdout | typeof Deno.stderr = Deno.stdout) {
    const escapeSequenceStart = "\x1b7\x1b\n\n\x1b[2A\x1b[1L\r";
    const escapeSequenceEnd = "\x1b8\x1b[1B";

    const final = `${escapeSequenceStart}${message}${escapeSequenceEnd}`;

    const encoder = new TextEncoder();
    const bytes = encoder.encode(final);

    fd.writeSync(bytes);
}
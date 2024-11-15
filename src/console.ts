import { parseArgs } from "@std/cli";
import { COMMAND_PREFIX_REGEX, CONSOLE_COMMANDS } from "./commands.ts";
import { ArgCommand, ExecCommand, OutputCommand } from "./declarations/command-types.d.ts";

export const CONSOLE_PROMPT = new TextEncoder().encode("> ");
export let ARGS: ReturnType<typeof parseArgs>;

export function initConsole() {
    ARGS = parseArgs(Deno.args);

    if (!Deno.stdin.isTerminal() && !ARGS["any-stdin"]) {
        console.error("Stdin is not a terminal (use '--any-stdin' to ignore)");
        Deno.exit(1);
    }

    const stream = Deno.stdin.readable;
    const decoderStream = new TextDecoderStream();
    const decoderWritable = decoderStream.writable;
    const decoderReader = decoderStream.readable.getReader();

    stream.pipeTo(decoderWritable);

    (async () => {
        let currentBuffer = "";
        while (true) {
            let value: string | undefined;
            let done: boolean;

            try {
                const result = await decoderReader.read();
                value = result.value;
                done = result.done;
            } catch (e) {
                console.error("Stdin unexpectedly closed", e);
                break;
            }

            if (done)
                break;

            currentBuffer += value;

            const lines = currentBuffer.split("\n");

            if (lines.length <= 1)
                continue;

            for (let i = 0; i < lines.length - 1; ++i) {
                await processCommand(lines[i]);
                await Deno.stdout.write(CONSOLE_PROMPT);
            }

            currentBuffer = lines[lines.length - 1];
        }
    })();
}

const commandNameRegex = RegExp(`^${COMMAND_PREFIX_REGEX}(?<commandName>[A-Za-z0-9_.]+)\\s*?(?<argString>.*)$`);
export async function processCommand(line: string): Promise<number> {
    const result = commandNameRegex.exec(line);

    const encoder = new TextEncoder();

    if (result === null || result.groups?.["commandName"] === undefined) {
        await Deno.stderr.write(encoder.encode("Command name could not be parsed\n"));
        return 1;
    }

    const commandName = result.groups["commandName"];
    const meta = CONSOLE_COMMANDS[commandName];

    if (meta === undefined) {
        await Deno.stderr.write(encoder.encode(`Console: Unknown command '${commandName}'\n`));
        return 1;
    }

    const rawArgs = result.groups["argString"].trim().split(" ");
    const args = parseArgs(rawArgs.length === 1 && rawArgs[0] === "" ? [] : rawArgs);

    switch (meta.commandType) {
        case "arg": {
            const status = (await (meta.exec as ArgCommand)(args)) || 0;
            return status;
        }
        case "output": {
            const encoder = new TextEncoder();

            const status = await (meta.exec as OutputCommand)(args, {
                write: async (data: string) => {
                    const processed = encoder.encode(data);
                    await Deno.stdout.write(processed);
                },
                writeRaw: async (data: Uint8Array) => {
                    await Deno.stdout.write(data);
                }
            });

            return status || 0;
        }
        case "exec": {
            const status = (await (meta.exec as ExecCommand)()) || 0;
            return status;
        }
    }
}
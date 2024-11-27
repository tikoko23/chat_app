import { CFG_PATHS } from "./config-paths.ts";
import { getConfig } from "./config.ts";
import { CommandArgs, CommandWriter } from "./declarations/command-types.d.ts";
import { ConsoleCommandMeta } from "./declarations/meta-types.d.ts";
import { parseHtml } from "./html.ts";

export const COMMAND_PREFIX_REGEX = getConfig<string>(`${CFG_PATHS.commands}/prefix_regex`) ?? "";
export const COMMAND_PREFIX       = getConfig<string>(`${CFG_PATHS.commands}/prefix`)       ?? "!";

export const CONSOLE_COMMANDS: Record<string, ConsoleCommandMeta> = {};

CONSOLE_COMMANDS["help"] = {
    commandType: "output",
    exec: async (args: CommandArgs, output: CommandWriter) => {
        let finalStr = "";

        if (args._.length > 0) {
            args._.forEach(commandName => {
                const meta = CONSOLE_COMMANDS[commandName];

                if (meta === undefined) {
                    finalStr += `help: Command '${finalStr}' not found!`;
                    return;
                }

                finalStr += `==== ${commandName} ====\n`;
                finalStr += `Summary:\n    ${meta.summary}\n`;

                if (meta.argumentsDescription !== undefined)
                    finalStr += `Arguments:\n    ${meta.argumentsDescription}\n`;

                if (meta.description !== undefined)
                    finalStr += `Description:\n    ${meta.description}\n`;

                if (meta.examples !== undefined)
                    finalStr += `Examples:\n    ${meta.examples.join("\n    ")}\n`;

                finalStr += "\n";
            });
        } else {
            finalStr += "Commands:\n";
            for (const [ name, meta ] of Object.entries(CONSOLE_COMMANDS)) {
                const argDescription = (meta.argumentsDescription === undefined) ? ("") : (` ${meta.argumentsDescription},`);

                finalStr += `  ${COMMAND_PREFIX}${name}:${argDescription} ${meta.summary}\n`;
            }
        }

        await output.write(finalStr);
    },
    summary: "Lists commands or shows command specific help",
    description: "By default, lists all commands. If given one or more arguments, lists command specific help for each of them.",
    argumentsDescription: "help [commands?..]",
    examples: [
        "help",
        "help help"
    ]
}

CONSOLE_COMMANDS["exit"] = {
    commandType: "exec",
    exec: () => {
        Deno.exit(0);
    },
    summary: "Exits the program",
    argumentsDescription: "No arguments"
}

CONSOLE_COMMANDS["clear"] = {
    commandType: "output",
    exec: async (_: CommandArgs, output: CommandWriter) => {
        await output.write("\x1b[2J\x1b[H");
    },
    summary: "Clears the screen",
    argumentsDescription: "No arguments"
}

CONSOLE_COMMANDS["pages"] = {
    commandType: "output",
    exec: async (args: CommandArgs, output: CommandWriter) => {
        if (args["r"] || args["reload"]) {
            await output.write("Reloading HTML pages...\n");
            await parseHtml();
            await output.write("Reload finished\n");
            return;
        }
    },
    summary: "Utility for managing HTML pages during runtime",
    argumentsDescription: "pages [-r, --reload]",
    examples: [
        "pages -r"
    ]
}
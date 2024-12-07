import { CFG_PATHS } from "./config-paths.ts";
import { getConfig } from "./config.ts";
import { CommandArgs, CommandWriter } from "./declarations/command-types.d.ts";
import { ConsoleCommandMeta } from "./declarations/meta-types.d.ts";
import { parseHtml } from "./html.ts";
import { createGroup, deleteGroup, fetchGroup } from "./group.ts";
import { Group, User } from "./types.ts";
import { fetchUser } from "./user.ts";

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
};

CONSOLE_COMMANDS["exit"] = {
    commandType: "exec",
    exec: () => {
        Deno.exit(0);
    },
    summary: "Exits the program",
    argumentsDescription: "No arguments"
};

CONSOLE_COMMANDS["clear"] = {
    commandType: "output",
    exec: async (_: CommandArgs, output: CommandWriter) => {
        await output.write("\x1b[2J\x1b[H");
    },
    summary: "Clears the screen",
    argumentsDescription: "No arguments"
};

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
};

CONSOLE_COMMANDS["mk-group"] = {
    commandType: "output",
    exec: async (args: CommandArgs, output: CommandWriter) => {
        if (args._[0] === undefined) {
            await output.write("Argument 1 must be provided\n");
            return;
        }

        let owner: User | null = null;

        if (args["-o"] || args["--owner"])
            owner = fetchUser("id", args["-o"] || args["--owner"]);

        createGroup(String(args._[0]), owner);
    },
    summary: "Creates a group with the first argument as the name and optionally the owner",
    argumentsDescription: "mk-group <name> [-o, --owner] params...",
    examples: [
        "mk-group new_group",
        "mk-group new_group -o 23",
    ]
};

CONSOLE_COMMANDS["rm-group"] = {
    commandType: "output",
    exec: async (args: CommandArgs, output: CommandWriter) => {
        const id = Number(args._[0]);

        if (id === undefined || isNaN(id)) {
            await output.write("Argument 1 must be provided\n");
            return;
        }

        const group = fetchGroup("id", id);

        if (group === null) {
            await output.write("Group not found\n");
            return;
        }

        deleteGroup(group);
    },
    summary: "Deletes a group",
    argumentsDescription: "rm-group <id>",
    examples: [
        "rm-group 23"
    ]
};

CONSOLE_COMMANDS["show-group"] = {
    commandType: "output",
    exec: async (args: CommandArgs, output: CommandWriter) => {
        let group: Group | null = null;

        if (args["n"] || args["name"])
            group = fetchGroup("name", String(args["n"] || args["name"]))
        else {
            const id = Number(args._[0]) || -1;

            if (id === -1) {
                await output.write("First argument must be a number if name isn't provided\n");
                return;
            }

            group = fetchGroup("id", id)
        }

        if (group === null) {
            await output.write("Group not found\n");
            return;
        }

        output.write(`Id: ${group.id}\nName: ${group.name}\nOwner: ${group.owner}\nInvite Link: ${group.inviteLink}\nCreated at: ${group.createdAt}\n`);
    },
    summary: "Returns the information about a group",
    argumentsDescription: "show-group <id?> [-n, --name]?",
    examples: [
        "show-group 23",
        "show-group -n group_name",
    ]
}
import { parseArgs } from "@std/cli";

export type CommandStatus = number | void;
export type CommandReturnType = Promise<CommandStatus> | CommandStatus;

export type CommandArgs = ReturnType<typeof parseArgs>;

export type CommandWriter = { write: (data: string) => Promise<void>, writeRaw: (data: Uint8Array) => Promise<void> };

export type ExecCommand = () => CommandReturnType;
export type ArgCommand = (args: CommandArgs) => CommandReturnType;
export type OutputCommand = (args: CommandArgs, output: CommandWriter) => CommandReturnType;

export type CommandType = "exec" | "arg" | "output";
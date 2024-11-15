import { parseArgs } from "@std/cli";
export let ARGS: ReturnType<typeof parseArgs>;

export function parseCli() {
    ARGS = parseArgs(Deno.args);
}
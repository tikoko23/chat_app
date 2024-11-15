import { ARGS, parseCli } from "./args.ts";
import { loadConfig, updateConfigPaths } from "./config.ts";

parseCli();

const path = ARGS["config-path"];

if (path !== undefined) {
    console.log(`Using custom config path: ${path}`)
    updateConfigPaths([ path ]);
}

console.log("Loading config");
loadConfig()
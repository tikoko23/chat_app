import { parse } from "@std/yaml";
import { relative, dirname } from "@std/path";

export const CONFIG: Record<string, unknown> = {};

let CONFIG_FILE_PATHS: readonly string[] = [
    "./config.yml",
    "./config.yaml",

    "./config/config.yml",
    "./config/config.yaml",

    "$SRC/config.yml",
    "$SRC/config.yaml",

    "$SRC/config/config.yml",
    "$SRC/config/config.yaml",

    "$HOME/.config/yok.yml",
    "$HOME/.config/yok.yaml",

    "$HOME/.config/yok/config.yml",
    "$HOME/.config/yok/config.yaml",

    "/etc/yok-config.yml",
    "/etc/yok-config.yaml",

    "/etc/yok.d/config.yml",
    "/etc/yok.d/config.yaml",
];

export function updateConfigPaths(customConfigPaths?: string[]) {
    const previouslyProcessed: Record<string, boolean> = {};

    CONFIG_FILE_PATHS = CONFIG_FILE_PATHS.map(p => {
        const path = resolvePath(p);

        if (path === null)
            return null;

        const newPath = `/${relative("/", path)}`;

        if (previouslyProcessed[newPath])
            return null;

        previouslyProcessed[newPath] = true;

        return newPath;
    }).filter(p => p !== null);

    if (customConfigPaths !== undefined) {
        const paths = customConfigPaths.map(p => resolvePath(p)).filter(p => p !== null);
        CONFIG_FILE_PATHS = [ ...paths, ...CONFIG_FILE_PATHS ];
    }
}

export function loadConfig() {
    for (const path of CONFIG_FILE_PATHS.toReversed()) {
        const result = loadYamlFile(path);

        for (const [ key, value ] of Object.entries(result as Record<string, unknown>))
            CONFIG[key] = value;
    }
}

export function loadYamlFile(path: string, importPrefix: string = "##", noLog: boolean = false): ReturnType<typeof parse> {
    let fileContents;

    try {
        fileContents = Deno.readTextFileSync(path);
    } catch (_e) {
        return {};
    }

    const conf: Record<string, unknown> = {};

    const dir = dirname(path);

    let lineCount = 0;
    let currentLine = "";
    for (const char of fileContents) {
        if (char !== "\n") {
            currentLine += char;
            continue;
        }

        ++lineCount;

        if (!currentLine.startsWith(importPrefix))
            break;

        const statement = currentLine.substring(importPrefix.length).trim();
        currentLine = "";

        const result = /^import\{(?<path>.+)\}/.exec(statement);
        const importPath = result?.groups?.path;

        if (importPath === undefined) {
            console.warn(`Invalid import path in ${path}:${lineCount}.`);
            break;
        }

        let filePath = "";

        switch (importPath[0]) {
            case ".":
                filePath = `${dir}/${importPath}`;
                break;
            case "/":
                filePath = importPath;
                break;
            default:
                console.warn(`Invalid import path in ${path}:${lineCount}. Path must start with '.' or '/'`);
                break;
        }

        if (filePath === "")
            break;

        const importResult = loadYamlFile(filePath, importPrefix, noLog);

        for (const [ key, value ] of Object.entries(importResult as Record<string, unknown>))
            conf[key] = value;
    }

    if (!noLog)
        console.log(`Processing ${path}`);

    const result = parse(fileContents);

    if (result !== null) {
        for (const [ key, value ] of Object.entries(result as Record<string, unknown>))
            conf[key] = value;
    }

    return conf;
}

function resolvePath(path: string): string | null {
    const scriptPath = new URL(import.meta.url).pathname;
    const rootDir = `${dirname(scriptPath)}/..`;

    const homePath = Deno.env.get("HOME");
    const hasHome = path.includes("$HOME");

    if (hasHome && homePath === undefined)
        return null;

    return path.replace("$HOME", homePath || "_").replace("$SRC", rootDir);
}

export function getConfig<T = unknown>(configEntry: string): T | null {
    const parts = configEntry.split("/").filter(s => s !== "");

    let currentEntry: unknown = CONFIG;
    for (const part of parts) {
        const subEntry = (currentEntry as Record<string, unknown>)[part];

        if (subEntry === undefined)
            return null;

        currentEntry = subEntry;
    }

    return currentEntry as T;
}
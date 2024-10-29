import { dirname } from "https://deno.land/std@0.202.0/path/dirname.ts";
import { getDescendants } from "./api.ts";
import { DynamicPageMeta, Nullable } from "./types.d.ts";
import { serveFile } from "./cdn.ts";

function getBetweenBrackets(
    str: string, brackets: "[]" | "()" | "{}", startingPosition: number = 0, stopAtNewLine: boolean = true
): Nullable<{ start: number; end: number; match: string }> {

    let depth = 0;
    let seen = false;
    let finalStr = "";
    let i;
    let start = startingPosition;

    for (i = startingPosition; i < str.length && (depth !== 0 || !seen); ++i) {
        const char = str[i];

        if (char === "\n" && stopAtNewLine && !seen)
            break;

        if (char === brackets[0]) {
            finalStr += char;
            seen = true;
            depth++;
            continue;
        }

        if (char === brackets[1]) {
            finalStr += char;
            if (depth === 0)
                start = i;
            seen = true;
            depth--;

            if (depth < 0)
                break;
            continue;
        }

        if (depth > 0)
            finalStr += char;
    }

    return depth !== 0 || !seen ? null : {
        start: start,
        end: i,
        match: finalStr.length >= 2 ? finalStr.substring(1, finalStr.length - 1) : finalStr
    };
}

export async function parseHtml() {
    await Deno.remove("./html_gen", { recursive: true }).catch(() => {});

    const variables = await loadHtmlVariables();
    const descendents = getDescendants("./html").filter(p => p.endsWith(".html"));

    for (const path of descendents) {
        const varRegex = /\$\$(?<var>[a-zA-Z_][a-zA-Z0-9_]*)/g;
        let text = await Deno.readTextFile(path);

        let match;
        while ((match = varRegex.exec(text)) !== null) {
            const variableName = match.groups?.var || "";
            let variable = variables[variableName];

            if (variable === undefined)
                throw new Error(`${path}: Variable ${variableName} not declared`);

            const bodyStart = match.index + variableName.length + 2;

            const cBrackets = getBetweenBrackets(text, "{}", bodyStart);
            const pBrackets = text[bodyStart] === "[" ? getBetweenBrackets(text, "[]", bodyStart) : null;

            variable = variable.replace("{}", () => cBrackets?.match || "");

            variable = variable.replace("[]", () => pBrackets?.match || "");

            const endingIndex = Math.max(cBrackets?.end || bodyStart, pBrackets?.end || bodyStart);
            const startingIndex = match.index;

            text = text.substring(0, startingIndex) + variable + text.substring(endingIndex);
        }

        const newPath = path.replace("/html/", "/html_gen/");
        await Deno.mkdir(dirname(newPath), { recursive: true });
        await Deno.writeTextFile(newPath, text);
    }
}

export async function loadHtmlVariables(): Promise<Record<string, string>> {
    const varRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*)$/gm;
    const variables: Record<string, string> = {};

    const fileContents = await Deno.readTextFile("./html/variables.txt");
    const matches = [...fileContents.matchAll(varRegex)];

    matches.forEach(m => {
        const [ _, varName, varValue ] = m;

        if (variables[varName])
            throw new Error(`Redeclaration of ${varName}:\n    ${m[0]}`);

        variables[varName] = varValue;
    });

    return variables;
}

const checkedFileSuffixes: readonly string[] = [
    "",
    ".html",
    "/index.html"
];

export async function serveHtml(path: string, internal: boolean = false): Promise<Response> {
    if (!internal && path.includes("/hide/"))
        return await serveFile("./html_gen/404.html");

    for (const suffix of checkedFileSuffixes) {
        try {
            const fileResponse = await serveFile(`./html_gen${path}${suffix}`);

            if (fileResponse.status === 200)
                return fileResponse;
        } catch (_e) { /**/ }
    }

    return await serveFile("./html_gen/404.html");
}

export function serveMessage(message: { title: string, text: string }): string {
    const template = Deno.readTextFileSync("./html_gen/hide/visual-response.html");

    return template.replaceAll("###TITLE", message.title).replaceAll("###TEXT", message.text);
}

export async function loadDynamicPages(): Promise<Record<string, DynamicPageMeta>> {
    const descendents = getDescendants("./dynamic_pages")
        .filter(p => p.endsWith(".ts"));

    const loaded: Record<string, DynamicPageMeta> = {};

    for (const path of descendents) {
        const module = await import(path);
        const sanitizedPath = path.replace(/^\.\/dynamic_pages/g, "");

        loaded[sanitizedPath] = module.default;
    }

    return loaded;
}

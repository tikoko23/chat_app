import "../src/init.ts";

import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { getDescendants } from "../src/api.ts";
import { extractStringFromStream } from "../src/util.ts";
import { hashString } from "../src/crypt.ts";
import { newSplitPromise } from "./test_util.ts";
import { getConfig, loadConfig, updateConfigPaths } from "../src/config.ts";

Deno.test({
    name: "floatingPointImprecision",
    fn() {
        assertNotEquals(0.1 + 0.2, 0.3, "how did you break floating point imprecision smh");
    }
})

Deno.test({
    name: "getDescendants",
    fn() {
        {
            const descendants = getDescendants("./tests/files");
            assertEquals(descendants.length, 2);
        }
        {
            const descendants = getDescendants("./tests/files", true, true);
            assertEquals(descendants.length, 3);
        }
        {
            const descendants = getDescendants("/this_directory_shouldnt_exist/some_subdir");
            assertEquals(descendants.length, 0);
        }
    }
});

Deno.test({
    name: "extractString",
    async fn() {
        const testString = "this is a test string. it has different characters like 'ä' to test the encoding!";

        const rStream = new ReadableStream<Uint8Array>({
            start(controller) {
                const encoder = new TextEncoder();
                const processed = encoder.encode(testString);

                controller.enqueue(processed);
                controller.close();
            }
        });

        const readString = await extractStringFromStream(rStream);

        assertEquals(testString, readString);
    }
});

Deno.test({
    name: "hashString",
    async fn() {
        const source = "qwerty2323";
        const expected = "49d7cd2f87a875bb70e7044e9b3b90dfae3c55c1b71d5f8d08459810e9626c5e";

        const result = await hashString(source);

        assertEquals(result, expected);
    }
});

Deno.test({
    name: "splitPromise",
    async fn() {
        const p = await newSplitPromise<number>();

        (async () => {
            await new Promise(r => setTimeout(r, 50));
            p.resolver(23);
        })();

        const result = await p.promise;

        assertEquals(result, 23);
    }
});

Deno.test({
    name: "configTest",
    async fn() {
        updateConfigPaths([ "$SRC/tests/test_conf/config.yml" ]);
        await loadConfig();

        const all = getConfig<Record<string, object>>("/") ?? {};
        const keys = Object.keys(all);

        assert(keys.includes("stats") && keys.includes("recipes"));

        assertEquals(getConfig<number>("stats/0/meals-served"), 23);

        const expectedRecipes = [ "brownie", "lemonade", "omelette" ];
        const recipes = getConfig<Record<string, unknown>[]>("recipes") ?? [];

        assertEquals(recipes.map(r => r.name), expectedRecipes);

        const expectedIngredients = [ "sugar", "flour", "butter", "eggs", "cocoa powder", "vanilla", "baking powder", "salt", "walnuts" ];
        const brownieIngredients = getConfig<string[]>("recipes/0/ingredients");

        assertEquals(brownieIngredients, expectedIngredients);
    }
});
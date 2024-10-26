import { assertEquals } from "@std/assert";
import { getDescendants } from "../src/api.ts";

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
    }
})
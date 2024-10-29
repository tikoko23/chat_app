import { assertEquals, assertNotEquals } from "@std/assert";
import { getDescendants } from "../src/api.ts";

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
    }
});
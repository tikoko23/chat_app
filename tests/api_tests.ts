import { assert, assertEquals } from "@std/assert";
import { getDescendants } from "../src/api.ts";
import { fetchUser } from "../src/user.ts";
import { User } from "../src/types.d.ts";
import { unloadDB } from "../src/db.ts";
import { test } from "./test_util.ts";
import { extractStringFromStream } from "../src/util.ts";

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

async function createTestUser(): Promise<User> {
    const response = await fetch("http://localhost:8000/api/user/create", {
        method: "POST",
        body: JSON.stringify({
            username: "test_user",
            password: "strong_password"
        })
    });

    const stream = response.body;

    assert(stream !== null, "body must be returned");

    const string = await extractStringFromStream(stream);

    assert(response.status === 201, string);

    const user = fetchUser("name", "test_user");

    assert(user !== null, "user should exist");

    return user;
}

Deno.test({
    name: "userAPI/create",
    async fn() {
        await test(async () => {
            await createTestUser();
        });
    }
});

Deno.test({
    name: "userAPI/fetch",
    async fn() {
        await test(async () => {
            const user = await createTestUser();

            const response = await fetch("http://localhost:8000/api/user/fetch-self", {
                method: "GET",
                headers: { "Authorization": user.token }
            });

            const stream = response.body;

            assert(stream !== null, "body must be returned");
            
            const string = await extractStringFromStream(stream);

            assert(response.status === 200, string);

            let json;
            try {
                json = JSON.parse(string);
            } catch (_e) {
                console.warn("Faulty string:", string);
                throw new Error("couldn't parse json");
            }

            assertEquals(json.id, user.id);
            assertEquals(json.name, user.name);
            unloadDB();
        });
    }
});
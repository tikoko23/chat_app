import { assert, assertEquals } from "@std/assert";
import { fetchUser } from "../src/user.ts";
import { User } from "../src/types.d.ts";
import { unloadDB } from "../src/db.ts";
import { test } from "./test_util.ts";
import { extractStringFromStream } from "../src/util.ts";

const API = "http://localhost:8000/api";
const USER_API = `${API}/user`;

async function createTestUser(name: string = "test_user", pass: string = "strong_password"): Promise<User> {
    const response = await fetch(`${USER_API}/create`, {
        method: "POST",
        body: JSON.stringify({
            username: name,
            password: pass
        })
    });

    const stream = response.body;

    assert(stream !== null, "body must be returned");

    const string = await extractStringFromStream(stream);

    assert(response.status === 201, string);

    const user = fetchUser("name", name);

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

            const response = await fetch(`${USER_API}/fetch-self`, {
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

Deno.test({
    name: "userAPI/get-access-token",
    async fn() {
        await test(async () => {
            const user = await createTestUser("test_user", "strong_password");

            const response = await fetch(`${USER_API}/get-access-token`, {
                method: "POST",
                body: JSON.stringify({
                    username: user.name,
                    password: "strong_password"
                })
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

            assert(user.token === json.token, "tokens should match");
        });
    }
});
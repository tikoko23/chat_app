import { assert, assertEquals } from "@std/assert";
import { fetchUser } from "../src/user.ts";
import { User } from "../src/types.ts";
import { unloadDB } from "../src/db.ts";
import { newSplitPromise, test } from "./test_util.ts";
import { extractStringFromStream } from "../src/util.ts";
import { createMessage } from "../src/message.ts";
import { createGroup, joinGroup } from "../src/group.ts";
import { ResponseMessage } from "../src/declarations/response-types.d.ts";
import { WebSocketEvent } from "../src/declarations/event-types.d.ts";

const HOST = "http://localhost:8000";
const API = `${HOST}/api`;
const USER_API = `${API}/user`;
const SOCKET_ENDPOINT = `${HOST}/socket`;

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

Deno.test({
    name: "socketEventMessageCreate",
    async fn() {
        await test(async () => {
            const user1 = await createTestUser("user1");
            const user2 = await createTestUser("user2");

            const group = createGroup("group", user1);
            joinGroup(group, user2);

            const user1Socket = new WebSocket(`${SOCKET_ENDPOINT}?token=${user1.token}`);
            const user2Socket = new WebSocket(`${SOCKET_ENDPOINT}?token=${user2.token}`);

            const socket1Split = await newSplitPromise<void>();
            const socket2Split = await newSplitPromise<void>();

            user1Socket.onopen = function() {
                socket1Split.resolver();
            }

            user2Socket.onopen = function() {
                socket2Split.resolver();
            }

            await socket1Split.promise;
            await socket2Split.promise;

            const testMessageContent = { body: "message_body" };

            const user1Split = await newSplitPromise<boolean>();
            const user2Split = await newSplitPromise<boolean>();

            user1Socket.onerror = function(er) {
                throw er;
            }

            user2Socket.onerror = function(er) {
                throw er;
            }

            user1Socket.onmessage = function(m) {
                const event = JSON.parse(m.data) as WebSocketEvent;

                switch (event.type) {
                    case "message.create": {
                        const message = event.object as ResponseMessage;

                        user1Split.resolver(message.content.body === testMessageContent.body);
                    }
                }
            }

            user2Socket.onmessage = function(m) {
                const event = JSON.parse(m.data) as WebSocketEvent;

                switch (event.type) {
                    case "message.create": {
                        const message = event.object as ResponseMessage;

                        user2Split.resolver(message.content.body === testMessageContent.body);
                    }
                }
            }

            createMessage(group, user1, testMessageContent);

            const [ user1Recieved, user2Recieved ] = await Promise.all([ user1Split.promise, user2Split.promise ]);

            assert(user1Recieved);
            assert(user2Recieved);

            user1Socket.close();
            user2Socket.close();
        });
    }
});
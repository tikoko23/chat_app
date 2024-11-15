import { initDefaultTables, loadCustomDB, makeDB, unloadDB } from "../src/db.ts";
import { serve } from "../src/main.ts";

async function beginTest(): Promise<Deno.HttpServer<Deno.NetAddr>> {
    const testDB = makeDB("./data/test.db", { mode: "write" });
    const file = Deno.createSync("./data/test.db");
    file.close();

    loadCustomDB(testDB);

    initDefaultTables(testDB);
    return await serve();
}

async function endTest(server: Deno.HttpServer<Deno.NetAddr>): Promise<void> {
    await server.shutdown();
    unloadDB();
}

export async function test(callback: (server?: Deno.HttpServer<Deno.NetAddr>) => Promise<void> | void): Promise<void> {
    const server = await beginTest();

    try {
        await callback(server);
    } catch (e) {
        await endTest(server);
        throw e;
    }

    await endTest(server);
}

export async function newSplitPromise<P>(): Promise<{ promise: Promise<P>, resolver: (arg0: P) => void }> {
    let resolver: (arg0: P) => void = (_: P) => {};

    const promise = new Promise<P>(res => {
        resolver = res;
    });

    // Wait for the next event loop tick, (hopefully) guarantees assignment to `resolver`
    await new Promise(r => setTimeout(r, 0));

    return { promise, resolver };
}
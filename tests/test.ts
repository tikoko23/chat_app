import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

const db = new DB("test_db.db");

db.query(`
    CREATE TABLE IF NOT EXISTS test (
        id INTEGER
    )
`);

db.query("INSERT INTO test (id) VALUES (?)", [ null ]);

const res = db.queryEntries<{ id: unknown }>("SELECT id FROM test");

for (const r of res) {
    console.log(typeof r.id, "   ", r.id === null);
}
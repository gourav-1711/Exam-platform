// test-db.ts
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    await client.connect();
    console.log("Connected!");

    const res = await client.query("select version()");
    console.log(res.rows[0]);

    await client.end();
  } catch (err) {
    console.error(err);
  }
})();
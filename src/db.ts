import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types.ts";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: "rinha",
    host: "db",
    user: "admin",
    password: "123",
    port: 5432,
    max: 5,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});

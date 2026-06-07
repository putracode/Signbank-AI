import { Pool } from "pg";

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool();

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err);
});

export default pool;

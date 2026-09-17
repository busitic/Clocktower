import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const result = await pool.query("SELECT NOW()");
  console.log("✅ Connected! Server time:", result.rows[0]);
} catch (err) {
  console.error("❌ Connection failed:", err);
} finally {
  await pool.end();
}
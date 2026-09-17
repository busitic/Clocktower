import "dotenv/config"
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/*
  WHY WE BUILD THE POOL OURSELVES
  --------------------------------
  Passing a connectionString straight to PrismaPg sometimes fails to
  negotiate SSL correctly against Neon, even with sslmode=require in the
  URL — Neon's proxy then refuses the raw TCP connection (ECONNREFUSED).
  Building the `pg` Pool ourselves lets us set `ssl` explicitly, which
  fixes it reliably.
*/
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
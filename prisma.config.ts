import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/*
  PRISMA 7 CONFIG
  ----------------
  As of Prisma 7, connection URLs no longer live in schema.prisma — they live
  here instead. This file is read ONLY by the Prisma CLI (migrate, studio,
  db seed) — NOT by the running app. The app connects separately via an
  adapter in src/lib/db.ts.

  We deliberately point the CLI at DIRECT_URL (the unpooled connection).
  Migrations need a single stable session; a pooled connection can't
  reliably hold the kind of lock a schema migration needs.
*/
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
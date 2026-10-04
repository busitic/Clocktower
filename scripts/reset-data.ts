// One-off cleanup: wipes all users, properties, enquiries, etc.
// Keeps Amenity (reference data the add-property form needs) and
// _prisma_migrations (Prisma's own history; deleting it breaks migrations).
// Run without --yes first: it only prints what it WOULD do.
import { prisma } from "../src/lib/db";

const KEEP = ["_prisma_migrations", "Amenity"];

async function main() {
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const all = rows.map((r) => r.tablename);
  const wipe = all.filter((t) => !KEEP.includes(t));
  const keep = all.filter((t) => KEEP.includes(t));

  console.log("Will KEEP:", keep.join(", ") || "(none)");
  console.log("Will WIPE:", wipe.join(", "));

  if (!keep.includes("Amenity")) {
    console.error("\nNo table called 'Amenity' found. Stopping so amenities aren't wiped by mistake.");
    process.exit(1);
  }

  if (!process.argv.includes("--yes")) {
    console.log("\nDry run only. Re-run with --yes to actually delete.");
    return;
  }

  // TRUNCATE ... CASCADE empties the tables in one statement and handles
  // foreign keys, so there's no need to work out a safe delete order.
  const list = wipe.map((t) => `"${t}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
  console.log("\nDone. All users, properties, enquiries and favourites removed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
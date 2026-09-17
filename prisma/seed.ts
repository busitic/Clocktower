import { prisma } from "../src/lib/db";


/*
  Amenities are seeded separately from properties because they are REFERENCE
  DATA — a fixed list the app depends on, not sample content. The `icon`
  field is a Lucide icon name so the UI can render the right icon straight
  from the database.
*/
const AMENITIES = [
  { slug: "wifi", name: "Wi-Fi included", icon: "Wifi", category: "essentials" },
  { slug: "bills-included", name: "All bills included", icon: "Receipt", category: "essentials" },
  { slug: "furnished", name: "Fully furnished", icon: "Sofa", category: "essentials" },
  { slug: "washing-machine", name: "Washing machine", icon: "WashingMachine", category: "essentials" },
  { slug: "dishwasher", name: "Dishwasher", icon: "Utensils", category: "kitchen" },
  { slug: "parking", name: "Off-road parking", icon: "CarFront", category: "transport" },
  { slug: "bike-storage", name: "Secure bike storage", icon: "Bike", category: "transport" },
  { slug: "bus-route", name: "On a campus bus route", icon: "BusFront", category: "transport" },
  { slug: "garden", name: "Garden or yard", icon: "Trees", category: "outdoor" },
  { slug: "ensuite", name: "En-suite bathroom", icon: "ShowerHead", category: "comfort" },
  { slug: "double-bed", name: "Double beds", icon: "BedDouble", category: "comfort" },
  { slug: "desk", name: "Study desk in room", icon: "Lamp", category: "study" },
  { slug: "gym", name: "Gym access", icon: "Dumbbell", category: "comfort" },
  { slug: "security", name: "Alarm or CCTV", icon: "ShieldCheck", category: "safety" },
  { slug: "fire-safety", name: "Fire safety certified", icon: "Flame", category: "safety" },
  { slug: "pets", name: "Pets considered", icon: "PawPrint", category: "general" },
];

async function main() {
  console.log("🌱 Seeding amenities…");

  for (const amenity of AMENITIES) {
    /*
      `upsert` = update if it exists, create if it doesn't.
      This makes the seed SAFE TO RUN REPEATEDLY — no duplicates, no errors.
      Always prefer upsert over create in seed scripts.
    */
    await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: amenity,
      create: amenity,
    });
  }

  console.log(`✅ Seeded ${AMENITIES.length} amenities`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
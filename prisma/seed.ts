import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";
import { calculateCampusDistance } from "../src/lib/campus";
import type { PropertyType, TenancyType, BillsPolicy } from "@prisma/client";

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

// Obviously fake test accounts, per the brief — no real personal data.
const TEST_PASSWORD = "Password123";

const STUDENTS = [
  { name: "Amara Okafor", email: "amara.student@example.com", university: "Edge Hill University" },
  { name: "Liam Hughes", email: "liam.student@example.com", university: "Edge Hill University" },
  { name: "Priya Sharma", email: "priya.student@example.com", university: "Edge Hill University" },
  { name: "Jack Fielding", email: "jack.student@example.com", university: "Edge Hill University" },
];

const LANDLORDS = [
  { name: "Ormskirk Lets Ltd", email: "contact@ormskirklets.example.com", phone: "01695 555001", companyName: "Ormskirk Lets Ltd", isVerified: true },
  { name: "Derby Street Properties", email: "info@derbystreetprops.example.com", phone: "01695 555002", companyName: "Derby Street Properties", isVerified: true },
  { name: "Susan Whitfield", email: "susan.landlord@example.com", phone: "01695 555003", companyName: null, isVerified: false },
];

// Coordinates are real Ormskirk-area locations; property details are fake.
// distance fields are DELIBERATELY left for calculateCampusDistance to fill —
// never hand-typed, consistent with how the app itself will create listings.
const PROPERTIES: Array<{
  title: string;
  description: string;
  rentPence: number;
  depositPence: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyType;
  tenancyType: TenancyType;
  billsPolicy: BillsPolicy;
  isFurnished: boolean;
  totalHousemates: number | null;
  addressLine1: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  busRoute: string | null;
  amenitySlugs: string[];
  landlordIndex: number;
}> = [
  {
    title: "Modern 4-bed student house on Ruff Lane",
    description: "Recently refurbished four-bedroom terrace, a short walk from campus along Ruff Lane. Double beds throughout, large shared kitchen-diner and a private yard.",
    rentPence: 47500, depositPence: 47500, bedrooms: 4, bathrooms: 2,
    propertyType: "HOUSE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 4,
    addressLine1: "14 Ruff Lane", city: "Ormskirk", postcode: "L39 4LW",
    latitude: 53.5665, longitude: -2.8797, busRoute: "385 stops on Ruff Lane, every 15 min",
    amenitySlugs: ["wifi", "furnished", "washing-machine", "garden", "double-bed", "desk"], landlordIndex: 0,
  },
  {
    title: "En-suite room in Derby Street house-share",
    description: "Single en-suite room in a well-maintained 6-bedroom student house. Bills included, close to Ormskirk town centre and the train station.",
    rentPence: 62000, depositPence: 62000, bedrooms: 6, bathrooms: 6,
    propertyType: "ENSUITE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "INCLUDED", isFurnished: true, totalHousemates: 6,
    addressLine1: "27 Derby Street", city: "Ormskirk", postcode: "L39 2BS",
    latitude: 53.5692, longitude: -2.8841, busRoute: "385 & 375 both stop nearby",
    amenitySlugs: ["wifi", "bills-included", "furnished", "ensuite", "security", "desk"], landlordIndex: 1,
  },
  {
    title: "Cosy studio near the Clock Tower",
    description: "Self-contained studio flat in the heart of Ormskirk, ideal for a postgraduate or final-year student who wants their own space.",
    rentPence: 55000, depositPence: 55000, bedrooms: 1, bathrooms: 1,
    propertyType: "STUDIO", tenancyType: "TWELVE_MONTH", billsPolicy: "CAPPED", isFurnished: true, totalHousemates: null,
    addressLine1: "3 Aughton Street", city: "Ormskirk", postcode: "L39 3BT",
    latitude: 53.5701, longitude: -2.8878, busRoute: "Town centre — all routes",
    amenitySlugs: ["wifi", "furnished", "washing-machine", "security"], landlordIndex: 2,
  },
  {
    title: "3-bed semi on St Helens Road",
    description: "Family-sized semi-detached house, popular with second and third-year groups. Large garden and off-road parking for two cars.",
    rentPence: 42000, depositPence: 42000, bedrooms: 3, bathrooms: 1,
    propertyType: "HOUSE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 3,
    addressLine1: "58 St Helens Road", city: "Ormskirk", postcode: "L39 4QP",
    latitude: 53.5589, longitude: -2.8749, busRoute: "385 direct to campus, 5 min",
    amenitySlugs: ["wifi", "furnished", "parking", "garden", "washing-machine"], landlordIndex: 0,
  },
  {
    title: "Budget double room, Westhead",
    description: "Affordable double room in a quiet residential house-share just outside town. Great for students who cycle to campus.",
    rentPence: 38000, depositPence: 38000, bedrooms: 5, bathrooms: 2,
    propertyType: "ROOM", tenancyType: "FLEXIBLE", billsPolicy: "INCLUDED", isFurnished: true, totalHousemates: 5,
    addressLine1: "9 Wango Lane", city: "Westhead, Ormskirk", postcode: "L40 6HP",
    latitude: 53.5798, longitude: -2.8593, busRoute: "375, hourly",
    amenitySlugs: ["bills-included", "furnished", "bike-storage", "double-bed"], landlordIndex: 2,
  },
  {
    title: "5-bed house share, Church Street",
    description: "Spacious five-bedroom house right in the town centre. Two bathrooms, dishwasher, and a garden for summer evenings.",
    rentPence: 49500, depositPence: 49500, bedrooms: 5, bathrooms: 2,
    propertyType: "HOUSE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 5,
    addressLine1: "41 Church Street", city: "Ormskirk", postcode: "L39 3AA",
    latitude: 53.5688, longitude: -2.8869, busRoute: "Town centre — all routes",
    amenitySlugs: ["wifi", "furnished", "dishwasher", "garden", "washing-machine"], landlordIndex: 1,
  },
  {
    title: "Apartment with gym access, town centre",
    description: "Modern 2-bed apartment in a managed building with resident gym and secure entry. Ideal for a postgraduate couple or two friends.",
    rentPence: 72000, depositPence: 72000, bedrooms: 2, bathrooms: 2,
    propertyType: "APARTMENT", tenancyType: "TWELVE_MONTH", billsPolicy: "CAPPED", isFurnished: true, totalHousemates: 2,
    addressLine1: "Flat 6, Moor Street", city: "Ormskirk", postcode: "L39 2AF",
    latitude: 53.5679, longitude: -2.8851, busRoute: "Town centre — all routes",
    amenitySlugs: ["wifi", "furnished", "gym", "security", "dishwasher"], landlordIndex: 0,
  },
  {
    title: "Burscough 4-bed, commuter-friendly",
    description: "Larger, cheaper house in Burscough with easy rail access into Ormskirk. Good option for students prioritising space over walking distance.",
    rentPence: 32000, depositPence: 32000, bedrooms: 4, bathrooms: 1,
    propertyType: "HOUSE", tenancyType: "TWELVE_MONTH", billsPolicy: "EXCLUDED", isFurnished: false, totalHousemates: 4,
    addressLine1: "12 Liverpool Road South", city: "Burscough", postcode: "L40 7QS",
    latitude: 53.5987, longitude: -2.8479, busRoute: "Rail: Burscough Bridge to Ormskirk, 8 min",
    amenitySlugs: ["parking", "garden", "washing-machine"], landlordIndex: 2,
  },
  {
    title: "Skelmersdale 3-bed, lower cost option",
    description: "Well-priced 3-bed house for students on a tighter budget, with a regular bus connection to campus.",
    rentPence: 28000, depositPence: 28000, bedrooms: 3, bathrooms: 1,
    propertyType: "HOUSE", tenancyType: "TWELVE_MONTH", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 3,
    addressLine1: "22 Findon Close", city: "Skelmersdale", postcode: "WN8 6JS",
    latitude: 53.5486, longitude: -2.7743, busRoute: "375 to Ormskirk, 20 min",
    amenitySlugs: ["furnished", "parking", "washing-machine"], landlordIndex: 1,
  },
  {
    title: "Premium en-suite, Prescot Road",
    description: "High-spec en-suite room with a modern shared kitchen and study lounge. Popular with international postgraduates.",
    rentPence: 68000, depositPence: 68000, bedrooms: 6, bathrooms: 6,
    propertyType: "ENSUITE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "INCLUDED", isFurnished: true, totalHousemates: 6,
    addressLine1: "5 Prescot Road", city: "Ormskirk", postcode: "L39 4TX",
    latitude: 53.5641, longitude: -2.8712, busRoute: "385, 10 min",
    amenitySlugs: ["wifi", "bills-included", "furnished", "ensuite", "desk", "security"], landlordIndex: 0,
  },
  {
    title: "Pet-friendly 3-bed cottage, Aughton",
    description: "Characterful cottage-style house in the village of Aughton. One of the few pet-friendly options near campus.",
    rentPence: 45000, depositPence: 45000, bedrooms: 3, bathrooms: 1,
    propertyType: "HOUSE", tenancyType: "TWELVE_MONTH", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 3,
    addressLine1: "8 Long Lane", city: "Aughton", postcode: "L39 5BX",
    latitude: 53.5514, longitude: -2.8834, busRoute: "385, 12 min",
    amenitySlugs: ["furnished", "garden", "parking", "pets"], landlordIndex: 2,
  },
  {
    title: "Newly built 6-bed on Chapel Street",
    description: "Purpose-built student accommodation, completed last year. Every room en-suite, with a large communal kitchen and study area.",
    rentPence: 71500, depositPence: 71500, bedrooms: 6, bathrooms: 6,
    propertyType: "ENSUITE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "INCLUDED", isFurnished: true, totalHousemates: 6,
    addressLine1: "2 Chapel Street", city: "Ormskirk", postcode: "L39 3AT",
    latitude: 53.5695, longitude: -2.8858, busRoute: "Town centre — all routes",
    amenitySlugs: ["wifi", "bills-included", "furnished", "ensuite", "security", "fire-safety", "desk"], landlordIndex: 1,
  },
  {
    title: "Affordable single room, Southport Road",
    description: "Single room in a friendly, established house-share. Good bus links and close to local shops.",
    rentPence: 35000, depositPence: 35000, bedrooms: 4, bathrooms: 2,
    propertyType: "ROOM", tenancyType: "FLEXIBLE", billsPolicy: "CAPPED", isFurnished: true, totalHousemates: 4,
    addressLine1: "63 Southport Road", city: "Ormskirk", postcode: "L39 1QR",
    latitude: 53.5734, longitude: -2.8814, busRoute: "385, 12 min",
    amenitySlugs: ["wifi", "furnished", "bike-storage"], landlordIndex: 0,
  },
  {
    title: "2-bed flat, ideal for a couple or two friends",
    description: "Compact but well-appointed 2-bedroom flat above a row of shops, five minutes from the town centre.",
    rentPence: 58000, depositPence: 58000, bedrooms: 2, bathrooms: 1,
    propertyType: "FLAT", tenancyType: "TWELVE_MONTH", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 2,
    addressLine1: "Flat 2, Moorgate", city: "Ormskirk", postcode: "L39 4RY",
    latitude: 53.5651, longitude: -2.8823, busRoute: "385, 8 min",
    amenitySlugs: ["wifi", "furnished", "washing-machine"], landlordIndex: 2,
  },
  {
    title: "Large 7-bed house, Greetby Hill",
    description: "One of the biggest student houses on our books — seven double rooms, three bathrooms, and a huge shared living space.",
    rentPence: 44000, depositPence: 44000, bedrooms: 7, bathrooms: 3,
    propertyType: "HOUSE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 7,
    addressLine1: "19 Greetby Hill", city: "Ormskirk", postcode: "L39 2DT",
    latitude: 53.5712, longitude: -2.8802, busRoute: "Town centre — all routes",
    amenitySlugs: ["wifi", "furnished", "washing-machine", "dishwasher", "double-bed"], landlordIndex: 1,
  },
  {
    title: "Quiet 1-bed flat for postgraduates",
    description: "Peaceful one-bedroom flat away from the main student areas — best suited to a postgraduate or mature student who values quiet.",
    rentPence: 51000, depositPence: 51000, bedrooms: 1, bathrooms: 1,
    propertyType: "FLAT", tenancyType: "TWELVE_MONTH", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 1,
    addressLine1: "11 Yew Tree Road", city: "Ormskirk", postcode: "L39 4SS",
    latitude: 53.5605, longitude: -2.8781, busRoute: "385, 7 min",
    amenitySlugs: ["wifi", "furnished", "desk"], landlordIndex: 0,
  },
  {
    title: "Bright 4-bed with garden, Wigan Road",
    description: "Sunny four-bedroom terrace with a well-kept garden, popular with returning groups year after year.",
    rentPence: 46000, depositPence: 46000, bedrooms: 4, bathrooms: 2,
    propertyType: "HOUSE", tenancyType: "ACADEMIC_YEAR", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 4,
    addressLine1: "34 Wigan Road", city: "Ormskirk", postcode: "L39 2AS",
    latitude: 53.5673, longitude: -2.8788, busRoute: "385, 6 min",
    amenitySlugs: ["wifi", "furnished", "garden", "washing-machine", "double-bed"], landlordIndex: 2,
  },
  {
    title: "Liverpool commuter flat, direct rail to Ormskirk",
    description: "For students who want city-centre nightlife with a direct train line straight to campus — journey time around 35 minutes.",
    rentPence: 65000, depositPence: 65000, bedrooms: 2, bathrooms: 1,
    propertyType: "FLAT", tenancyType: "TWELVE_MONTH", billsPolicy: "EXCLUDED", isFurnished: true, totalHousemates: 2,
    addressLine1: "17 Bold Street", city: "Liverpool", postcode: "L1 4DN",
    latitude: 53.4025, longitude: -2.9776, busRoute: "Rail: Liverpool Central to Ormskirk, 35 min",
    amenitySlugs: ["wifi", "furnished", "gym", "security"], landlordIndex: 1,
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seeding amenities…");
  for (const amenity of AMENITIES) {
    await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: amenity,
      create: amenity,
    });
  }
  console.log(`✅ Seeded ${AMENITIES.length} amenities`);

  console.log("🌱 Seeding users…");
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@clocktower.example.com" },
    update: {},
    create: {
      name: "Clocktower Admin",
      email: "admin@clocktower.example.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const studentRecords = [];
  for (const student of STUDENTS) {
    const record = await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: { ...student, passwordHash, role: "STUDENT" },
    });
    studentRecords.push(record);
  }

  const landlordRecords = [];
  for (const landlord of LANDLORDS) {
    const record = await prisma.user.upsert({
      where: { email: landlord.email },
      update: {},
      create: { ...landlord, passwordHash, role: "LANDLORD" },
    });
    landlordRecords.push(record);
  }
  console.log(
    `✅ Seeded 1 admin, ${studentRecords.length} students, ${landlordRecords.length} landlords`,
  );
  console.log(`   All test accounts use the password: ${TEST_PASSWORD}`);

  console.log("🌱 Seeding properties…");
  let count = 0;
  for (const p of PROPERTIES) {
    const distance = calculateCampusDistance(p.latitude, p.longitude);
    const slug = `${slugify(p.title)}-${slugify(p.postcode)}`;

    await prisma.property.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: p.title,
        description: p.description,
        rentPence: p.rentPence,
        depositPence: p.depositPence,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        propertyType: p.propertyType,
        tenancyType: p.tenancyType,
        billsPolicy: p.billsPolicy,
        isFurnished: p.isFurnished,
        totalHousemates: p.totalHousemates,
        addressLine1: p.addressLine1,
        city: p.city,
        postcode: p.postcode,
        latitude: p.latitude,
        longitude: p.longitude,
        busRoute: p.busRoute,
        distanceMetres: distance.distanceMetres,
        walkMinutes: distance.walkMinutes,
        cycleMinutes: distance.cycleMinutes,
        availableFrom: new Date("2026-09-01"),
        isAvailable: true,
        status: "APPROVED",
        approvedAt: new Date(),
        landlordId: landlordRecords[p.landlordIndex].id,
        amenities: {
          connect: p.amenitySlugs.map((slug) => ({ slug })),
        },
      },
    });
    count++;
  }
  console.log(`✅ Seeded ${count} properties`);

  console.log("🎉 Seed complete");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
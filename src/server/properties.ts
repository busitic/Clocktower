import { prisma } from "@/lib/db";
import { calculateCampusDistance } from "@/lib/campus";
import type { PropertySearchInput, PropertyInput } from "@/lib/validations/property";
import type { Prisma } from "@prisma/client";

/*
  WHY THIS FILE EXISTS
  ----------------------
  Every function here is a plain async function that talks to Prisma and
  returns plain data — no request/response objects, no auth checks, no
  HTTP status codes. That separation means:
  1. API routes (Phase 4) can call these.
  2. Server Components (Phase 5+) can call these DIRECTLY, with no HTTP
     round-trip to your own API — a real Next.js App Router advantage.
  3. Tests (Phase 13) can call these with zero mocking of Next.js internals.
*/

export async function searchProperties(params: PropertySearchInput) {
  const {
    city, postcode, minPrice, maxPrice, bedrooms, propertyType,
    billsIncluded, furnished, maxWalkMinutes, amenities, sort, page, pageSize,
  } = params;

  // Build the WHERE clause incrementally. Every search only ever returns
  // APPROVED + available properties — a DRAFT or REJECTED listing must
  // never appear to the public, regardless of what filters are applied.
  const where: Prisma.PropertyWhereInput = {
    status: "APPROVED",
    isAvailable: true,
  };

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (postcode) where.postcode = { contains: postcode, mode: "insensitive" };
  if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };
  if (propertyType) where.propertyType = propertyType;
  if (furnished !== undefined) where.isFurnished = furnished;
  if (maxWalkMinutes !== undefined) where.walkMinutes = { lte: maxWalkMinutes };
  if (billsIncluded) where.billsPolicy = { in: ["INCLUDED", "CAPPED"] };

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.rentPence = {};
    if (minPrice !== undefined) where.rentPence.gte = minPrice * 100;
    if (maxPrice !== undefined) where.rentPence.lte = maxPrice * 100;
  }

  if (amenities.length > 0) {
    // AND-of-EVERY-amenity: property must have ALL selected amenities,
    // not just one of them. `every` would be wrong here — Prisma's `some`
    // combined with one clause per amenity is the correct pattern for
    // "must have A AND B", achieved by requiring the count to match.
    where.AND = amenities.map((slug) => ({
      amenities: { some: { slug } },
    }));
  }

  const orderBy: Prisma.PropertyOrderByWithRelationInput =
    sort === "price-asc" ? { rentPence: "asc" } :
    sort === "price-desc" ? { rentPence: "desc" } :
    sort === "oldest" ? { createdAt: "asc" } :
    sort === "closest" ? { walkMinutes: "asc" } :
    { createdAt: "desc" }; // "newest", the default

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        amenities: true,
        landlord: { select: { name: true, isVerified: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getPropertyBySlug(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      amenities: true,
      landlord: {
        select: { id: true, name: true, image: true, isVerified: true, companyName: true },
      },
    },
  });
}

 export async function getVisibleProperty(
  slug: string,
  viewer: {id: string; role: string} | null,
 ) {
  const property = await getPropertyBySlug(slug);
  if (!property) return null;

  if(property.status === "APPROVED") return property;

  const isOwner = viewer?.id === property.landlordId;
  const isAdmin = viewer?.role === "ADMIN";
  return isOwner || isAdmin ? property : null;
  
 }


export async function getPropertyById(id: string) {
  return prisma.property.findUnique({ where: { id } });
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createProperty(landlordId: string, input: PropertyInput) {
  // Distance is ALWAYS calculated server-side from coordinates — never
  // accepted from the client. A landlord cannot claim a shorter walk time
  // than the maths says is true.
  const distance = calculateCampusDistance(input.latitude, input.longitude);

  // Ensure a unique slug even if two properties share a very similar title.
  const baseSlug = `${slugify(input.title)}-${slugify(input.postcode)}`;
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  return prisma.property.create({
    data: {
      slug,
      title: input.title,
      description: input.description,
      rentPence: Math.round(input.rentPounds * 100),
      depositPence: Math.round(input.depositPounds * 100),
      billsCapPence: input.billsCapPounds ? Math.round(input.billsCapPounds * 100) : null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      propertyType: input.propertyType,
      tenancyType: input.tenancyType,
      billsPolicy: input.billsPolicy,
      isFurnished: input.isFurnished,
      isStudentOnly: input.isStudentOnly,
      totalHousemates: input.totalHousemates,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      postcode: input.postcode,
      latitude: input.latitude,
      longitude: input.longitude,
      busRoute: input.busRoute,
      distanceMetres: distance.distanceMetres,
      walkMinutes: distance.walkMinutes,
      cycleMinutes: distance.cycleMinutes,
      availableFrom: input.availableFrom,
      status: "PENDING", // every new listing needs admin approval — Phase 10
      landlordId,
      amenities: { connect: input.amenitySlugs.map((slug) => ({ slug })) },
    },
  });
}

/**
 * Throws "NOT_FOUND" or "FORBIDDEN" — the API route translates these into
 * the right HTTP status. Kept as plain string errors so this function has
 * zero dependency on Next.js's Request/Response types.
 */
export async function updateProperty(
  propertyId: string,
  landlordId: string,
  input: Partial<PropertyInput>,
) {
  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) throw new Error("NOT_FOUND");
  // THE ownership check: a landlord may only ever edit their own listing.
  if (existing.landlordId !== landlordId) throw new Error("FORBIDDEN");

  // Recalculate distance only if the coordinates actually changed —
  // no point re-running the maths otherwise.
  const distance =
    input.latitude !== undefined && input.longitude !== undefined
      ? calculateCampusDistance(input.latitude, input.longitude)
      : null;

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description && { description: input.description }),
      ...(input.rentPounds !== undefined && { rentPence: Math.round(input.rentPounds * 100) }),
      ...(input.depositPounds !== undefined && { depositPence: Math.round(input.depositPounds * 100) }),
      ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
      ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
      ...(input.isFurnished !== undefined && { isFurnished: input.isFurnished }),
      ...(input.availableFrom && { availableFrom: input.availableFrom }),
      ...(distance && {
        distanceMetres: distance.distanceMetres,
        walkMinutes: distance.walkMinutes,
        cycleMinutes: distance.cycleMinutes,
        latitude: input.latitude,
        longitude: input.longitude,
      }),
      ...(input.amenitySlugs && {
        amenities: { set: input.amenitySlugs.map((slug) => ({ slug })) },
      }),
    },
  });
}

export async function deleteProperty(propertyId: string, landlordId: string) {
  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.landlordId !== landlordId) throw new Error("FORBIDDEN");

  return prisma.property.delete({ where: { id: propertyId } });
}

export async function setPropertyAvailability(
  propertyId: string,
  landlordId: string,
  isAvailable: boolean,
) {
  const existing = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.landlordId !== landlordId) throw new Error("FORBIDDEN");

  return prisma.property.update({ where: { id: propertyId }, data: { isAvailable } });
}
"use server";

import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { propertyInputSchema, propertyImagesSchema, type PropertyInputForm } from "@/lib/validations/property";
import { calculateCampusDistance } from "@/lib/campus";
import { redirect } from "next/navigation";

async function geocodePostcode(postcode: string) {
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
  if (!res.ok) throw new Error("Couldn't find that postcode — double check it and try again.");
  const data = await res.json();
  return { latitude: data.result.latitude as number, longitude: data.result.longitude as number };
}

function slugify(title: string) {
  return (
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" + Math.random().toString(36).slice(2, 7)
  );
}

// rawInput is the form's fields MINUS lat/lng (the form only collects a
// postcode) — we geocode first, merge coordinates in, THEN validate,
// because propertyInputSchema requires latitude/longitude as inputs.
export async function createProperty(rawInput: PropertyInputForm, rawImages: unknown) {
  const user = await requireRole("LANDLORD");

  const { latitude, longitude } = await geocodePostcode(rawInput.postcode);
  const input = propertyInputSchema.parse({ ...rawInput, latitude, longitude });
  const images = propertyImagesSchema.parse(rawImages);

  const distance = calculateCampusDistance(latitude, longitude);

  const property = await prisma.property.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      description: input.description,
      propertyType: input.propertyType,
      tenancyType: input.tenancyType,
      rentPence: Math.round(input.rentPounds * 100),
      depositPence: Math.round(input.depositPounds * 100),
      billsPolicy: input.billsPolicy,
      billsCapPence: input.billsCapPounds ? Math.round(input.billsCapPounds * 100) : null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
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
      // status defaults to PENDING — new listings wait for admin approval,
      // same moderation gate the seed data bypassed with status: "APPROVED".
      landlordId: user.id,
      amenities: { connect: input.amenitySlugs.map((slug) => ({ slug })) },
      images: { create: images.map((img, i) => ({ url: img.url, altText: img.altText, position: i })) },
    },
  });

  redirect(`/dashboard/landlord/properties?created=${property.id}`);
}
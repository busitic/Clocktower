"use server";

import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { propertyInputSchema, type PropertyFormClientOutput } from "@/lib/validations/property";
import { calculateCampusDistance } from "@/lib/campus";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const imageSchema = z
  .array(z.object({
    url: z.string().url(),
    fileKey: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
    altText: z.string().trim().min(3),
  }))
  .min(1, "Add at least one image");

type GeocodeResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; error: string };

async function geocodePostcode(postcode: string): Promise<GeocodeResult> {
  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`,
    );
    if (res.status === 404) {
      return { ok: false, error: "We couldn't find that postcode. Check it and try again." };
    }
    if (!res.ok) {
      return { ok: false, error: "Postcode lookup is unavailable right now. Please try again shortly." };
    }
    const data = await res.json();
    return {
      ok: true,
      latitude: data.result.latitude as number,
      longitude: data.result.longitude as number,
    };
  } catch {
    return { ok: false, error: "Postcode lookup is unavailable right now. Please try again shortly." };
  }
}

function slugify(title: string) {
  return (
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" + Math.random().toString(36).slice(2, 7)
  );
}

export async function createProperty(rawInput: PropertyFormClientOutput, rawImages: unknown) {
  const user = await requireRole("LANDLORD");

  const geo = await geocodePostcode(rawInput.postcode);
  if (!geo.ok) return { ok: false as const, error: geo.error };
  const { latitude, longitude } = geo;

  const input = propertyInputSchema.parse({ ...rawInput, latitude, longitude });
  const images = imageSchema.parse(rawImages);
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
      status: "PENDING",
      landlordId: user.id,
      amenities: { connect: input.amenitySlugs.map((slug) => ({ slug })) },
      images: {
        create: images.map((img, i) => ({
          url: img.url,
          fileKey: img.fileKey,
          altText: img.altText,
          position: i,
        })),
      },
    },
  });

  revalidatePath("/dashboard/landlord/properties");
  redirect(`/dashboard/landlord/properties?created=${property.id}`);
}
"use server";

import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { UTApi } from "uploadthing/server";
import { propertyInputSchema, type PropertyFormClientOutput } from "@/lib/validations/property";
import { calculateCampusDistance } from "@/lib/campus";

const utapi = new UTApi();

const imageSchema = z
  .array(z.object({
    url: z.string().url(),
   fileKey: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
    altText: z.string().trim().min(3),
  }))
  .min(1, "Add at least one image");
async function geocodePostcode(postcode: string) {
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
  if (!res.ok) throw new Error("Couldn't find that postcode — double check it and try again.");
  const data = await res.json();
  return { latitude: data.result.latitude as number, longitude: data.result.longitude as number };
}

async function assertOwnership(propertyId: string, landlordId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { landlordId: true },
  });
  if (!property || property.landlordId !== landlordId) {
    throw new Error("Not found or not yours.");
  }
}

export async function deleteProperty(propertyId: string) {
  const user = await requireRole("LANDLORD");
  await assertOwnership(propertyId, user.id);

  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { images: { select: { fileKey: true } } },
  });

  await prisma.property.delete({ where: { id: propertyId } });

  const fileKeys = existing?.images.map((img) => img.fileKey).filter((k): k is string => !!k) ?? [];
  if (fileKeys.length > 0) {
    await utapi.deleteFiles(fileKeys);
  }

  revalidatePath("/dashboard/landlord/properties");
}

export async function toggleAvailability(propertyId: string, nextValue: boolean) {
  const user = await requireRole("LANDLORD");
  await assertOwnership(propertyId, user.id);

  await prisma.property.update({ where: { id: propertyId }, data: { isAvailable: nextValue } });
  revalidatePath("/dashboard/landlord/properties");
}

export async function updateProperty(
  propertyId: string,
  rawInput: PropertyFormClientOutput,
  rawImages: unknown,
) {
  const user = await requireRole("LANDLORD");
  await assertOwnership(propertyId, user.id);

  const { latitude, longitude } = await geocodePostcode(rawInput.postcode);
  const input = propertyInputSchema.parse({ ...rawInput, latitude, longitude });
  const images = imageSchema.parse(rawImages);
  const distance = calculateCampusDistance(latitude, longitude);

  const existing = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { images: { select: { fileKey: true } } },
  });

  const newFileKeys = new Set(images.map((img) => img.fileKey));
  const removedFileKeys =
    existing?.images.map((img) => img.fileKey).filter((k): k is string => !!k && !newFileKeys.has(k)) ?? [];

  await prisma.property.update({
    where: { id: propertyId },
    data: {
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
      approvedAt: null,
      rejectedNote: null,
      amenities: { set: [], connect: input.amenitySlugs.map((slug) => ({ slug })) },
      images: {
        deleteMany: {},
        create: images.map((img, i) => ({
          url: img.url,
          fileKey: img.fileKey,
          altText: img.altText,
          position: i,
        })),
      },
    },
  });

  if (removedFileKeys.length > 0) {
    await utapi.deleteFiles(removedFileKeys);
  }

  revalidatePath("/dashboard/landlord/properties");
  redirect(`/dashboard/landlord/properties?updated=${propertyId}`);
}
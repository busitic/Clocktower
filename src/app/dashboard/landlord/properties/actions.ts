"use server";

import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// requireRole already throws if not a landlord — this second check is what
// stops Landlord A editing Landlord B's property by guessing an id, which
// requireRole alone can't catch (it only checks WHO you are, not WHAT you own).
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

  // Schema cascades (onDelete: Cascade) clean up PropertyImage, Favourite,
  // Enquiry, PropertyReport, PropertyView automatically.
  await prisma.property.delete({ where: { id: propertyId } });
  revalidatePath("/dashboard/landlord/properties");
}

export async function toggleAvailability(propertyId: string, nextValue: boolean) {
  const user = await requireRole("LANDLORD");
  await assertOwnership(propertyId, user.id);

  await prisma.property.update({ where: { id: propertyId }, data: { isAvailable: nextValue } });
  revalidatePath("/dashboard/landlord/properties");
}
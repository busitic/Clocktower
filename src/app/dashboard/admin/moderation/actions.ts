"use server";


import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";


export async function approveProperty(propertyId: string) {
    await requireRole("ADMIN");


    await prisma.property.update({
        where: {id: propertyId},
        data: {status: "APPROVED", approvedAt: new Date(), rejectedNote: null},
    });

    revalidatePath("/dashboard/admin/moderation");
}


export async function rejectProperty(propertyId: string, note: string) {
    await requireRole("ADMIN");

    if (!note.trim()) {
        throw new Error("A rejection reason is required so the landlord knows what to fix.");
    }

    await prisma.property.update({
        where: {id: propertyId},
        data: {status: "REJECTED", rejectedNote: note.trim(), approvedAt: null},
    });

    revalidatePath("/dashboard/admin/moderation");
}
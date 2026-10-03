"use server";

import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function resolveReport(reportId: string, note: string) {
  await requireRole("ADMIN");
  await prisma.propertyReport.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolvedAt: new Date(), adminNote: note || null },
  });
  revalidatePath("/dashboard/admin/reports");
}

export async function dismissReport(reportId: string, note: string) {
  await requireRole("ADMIN");
  await prisma.propertyReport.update({
    where: { id: reportId },
    data: { status: "DISMISSED", resolvedAt: new Date(), adminNote: note || null },
  });
  revalidatePath("/dashboard/admin/reports");
}
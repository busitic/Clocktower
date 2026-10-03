"use server";

import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import z from "zod";

const reportSchema = z.object({
    propertyId: z.string(),
    reason: z.enum(["MISLEADING", "UNAVAILABLE", "INAPPROPRIATE", "SUSPECTED_SCAM", "DUPLICATE", "OTHER"]),
    details: z.string().trim().max(1000).optional(),
});

export async function reportProperty(input: z.infer<typeof reportProperty>) {
    const user = await requireUser();
    const { propertyId, reason, details } = reportSchema.parse(input);

    try {
        await prisma.propertyReport.create({
            data: {propertyId, reporterId:user.id, reason, details},
        });
    } catch (err) {
        if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
            throw new Error("You've already reported this listing.");
        }
        throw err;
    }
}
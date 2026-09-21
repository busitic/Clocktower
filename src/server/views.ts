import { prisma } from "@/lib/db";

export async function recordPropertyView(userId: string, propertyId: string) {
    await prisma.propertyView.upsert({
        where: {userId_propertyId: {userId, propertyId}},
        update: { viewedAt: new Date(), viewCount: { increment: 1 } },
        create: {userId, propertyId},
    });
}
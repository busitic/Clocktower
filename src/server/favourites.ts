import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";


export async function addFavourite(userId: string, propertyId: string) {
    try {
        return await prisma.favourite.create({data: {userId, propertyId}});
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new Error("ALREADY_FAVOURITED");
        }
        throw error;
    }
}


export async function removeFavourite(userId: string, propertyId: string) {
    return prisma.favourite.deleteMany({where: {userId, propertyId} });
}

export async function getFavourites(userId: string) {
    return prisma.favourite.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            property: {
                include: {
                    images: { orderBy: { position: "asc" }, take: 1 },
                },
            },
        },
    });
}
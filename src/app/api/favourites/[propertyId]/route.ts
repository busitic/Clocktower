import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session"; 
import { removeFavourite } from "@/server/favourites";


type Params = { params: Promise<{ propertyId: string}> };

export async function DELETE(_request: Request, {params}: Params) {
    const { propertyId } = await params;
    
    try {
        const user = await requireRole("STUDENT");
        await removeFavourite(user.id, propertyId);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHENTICATED") {
            return NextResponse.json({ error: "You must be logged in" }, { status: 401 })
        }
        return NextResponse.json({ error: "Something went wrong"}, {status: 500});
    }
}
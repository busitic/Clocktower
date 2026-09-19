import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/session";
import { addFavourite, getFavourites } from "@/server/favourites";

const favouriteSchema = z.object({ propertyId: z.string().cuid() });

export async function GET() {
  try {
    const user = await requireRole("STUDENT");
    const favourites = await getFavourites(user.id);
    return NextResponse.json(favourites);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("STUDENT");
    const body = await request.json();
    const { propertyId } = favouriteSchema.parse(body);

    const favourite = await addFavourite(user.id, propertyId);
    return NextResponse.json(favourite, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Only students can save favourites" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "ALREADY_FAVOURITED") {
      return NextResponse.json({ error: "Already in your favourites" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 400 });
  }
}
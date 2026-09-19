import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { propertySearchSchema, propertyInputSchema } from "@/lib/validations/property";
import { searchProperties, createProperty } from "@/server/properties";
import { requireRole } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    // Object.fromEntries turns ?city=Ormskirk&bedrooms=2 into a plain object
    // that Zod can then validate and coerce.
    const params = propertySearchSchema.parse(Object.fromEntries(searchParams));
    const result = await searchProperties(params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Only landlords may create listings. requireRole throws if not.
    const user = await requireRole("LANDLORD");

    const body = await request.json();
    const input = propertyInputSchema.parse(body);
    const property = await createProperty(user.id, input);

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid property data", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Only landlords can create listings" }, { status: 403 });
    }
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
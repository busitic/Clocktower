import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { propertyInputSchema } from "@/lib/validations/property";
import { getPropertyById, updateProperty, deleteProperty } from "@/server/properties";
import { requireRole } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
  return NextResponse.json(property);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const user = await requireRole("LANDLORD");
    const body = await request.json();
    // .partial() allows updating just one or two fields, not the whole object.
    const input = propertyInputSchema.partial().parse(body);
    const property = await updateProperty(id, user.id, input);

    return NextResponse.json(property);
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
      return NextResponse.json(
        { error: "You can only edit your own properties" },
        { status: 403 },
      );
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const user = await requireRole("LANDLORD");
    await deleteProperty(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "You can only delete your own properties" },
        { status: 403 },
      );
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
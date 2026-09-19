import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { enquirySchema } from "@/lib/validations/property";
import { createEnquiry, getEnquiriesForStudent, getEnquiriesForLandlord } from "@/server/enquiries";
import { requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();

    // Same endpoint, different data depending on role — the API shape
    // stays simple while respecting who's asking.
    const enquiries =
      user.role === "LANDLORD"
        ? await getEnquiriesForLandlord(user.id)
        : await getEnquiriesForStudent(user.id);

    return NextResponse.json(enquiries);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can send enquiries" }, { status: 403 });
    }

    const body = await request.json();
    const input = enquirySchema.parse(body);
    const enquiry = await createEnquiry(user.id, input);

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid enquiry", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
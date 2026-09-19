import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/session";
import { updateEnquiryStatus, addEnquiryReply } from "@/server/enquiries";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["NEW", "READ", "RESPONDED", "CLOSED"]).optional(),
  reply: z.string().trim().min(1).max(1000).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const user = await requireUser();
    const body = await request.json();
    const { status, reply } = patchSchema.parse(body);

    if (reply) {
      await addEnquiryReply(id, user.id, reply);
    }
    if (status) {
      await updateEnquiryStatus(id, user.id, status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "You're not part of this conversation" },
        { status: 403 },
      );
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
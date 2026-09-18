import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            {error: parsed.error.flatten().fieldErrors },
            {status: 400},
        );
    }


const { name, email, password, role, university } = parsed.data;
const normalisedEmail = email.toLowerCase();

const existing = await prisma.user.findUnique({
    where: {email: normalisedEmail },
});
if (existing) {
    return NextResponse.json(
        {error: "Unable to create account with these details"},
        {status: 400},
    );
}

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.create({
   data: {
    name,
    email: normalisedEmail,
    passwordHash,
    role,
    university: role === "STUDENT" ? university : null,
   },
});

return NextResponse.json({ success: true }, { status: 201 });
};
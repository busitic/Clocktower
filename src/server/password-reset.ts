"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // links work for 1 hour
const RESEND_COOLDOWN_MS = 60 * 1000; // at most one email per account per minute

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const emailSchema = z.string().trim().toLowerCase().email();

// ASSUMPTION: match this to your registerSchema's password rule.
// max(72) is bcrypt's hard limit: anything longer is silently truncated.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

/*
  Always returns { ok: true }, whether or not the email has an account.
  Otherwise this form would let anyone check which emails are registered.
*/
export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: true };

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  // No password means an OAuth-only account; suspended accounts can't log in anyway
  if (!user || !user.passwordHash || user.isSuspended) return { ok: true };

  // Per-account throttle: skip if a link was issued in the last minute
  const recent = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
  });
  if (recent) return { ok: true };

  const token = randomBytes(32).toString("hex");

  // Replace any earlier link so only the newest one works
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const link = `${baseUrl}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your Clocktower password",
      text: `Hi ${user.name},\n\nUse this link to choose a new password. It works for 1 hour:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email and your password will stay the same.`,
    });
  } catch (err) {
    // Don't tell the caller: a failure here would reveal that the account exists
    console.error("Password reset email failed:", err instanceof Error ? err.message : err);
  }

  return { ok: true };
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired. Please request a new one." };
  }

  // ASSUMPTION: 12 rounds. Match whatever your /api/register route uses.
  const passwordHash = await bcrypt.hash(parsed.data, 12);

  // Single-use: the new hash and the token deletion succeed or fail together
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true };
}
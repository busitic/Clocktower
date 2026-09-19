import { prisma } from "@/lib/db";
import type { EnquiryInput } from "@/lib/validations/property";
import type { EnquiryStatus } from "@prisma/client";

export async function createEnquiry(studentId: string, input: EnquiryInput) {
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { landlordId: true },
  });
  if (!property) throw new Error("NOT_FOUND");

  return prisma.enquiry.create({
    data: {
      studentId,
      landlordId: property.landlordId,
      propertyId: input.propertyId,
      message: input.message,
      moveInDate: input.moveInDate,
      groupSize: input.groupSize,
    },
  });
}

export async function getEnquiriesForStudent(studentId: string) {
  return prisma.enquiry.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true, slug: true, city: true } },
      landlord: { select: { name: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getEnquiriesForLandlord(landlordId: string) {
  return prisma.enquiry.findMany({
    where: { landlordId },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { title: true, slug: true } },
      student: { select: { name: true, email: true, university: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });
}

/**
 * Enforces that only a participant in the enquiry (the student who sent
 * it, or the landlord who received it) can update it — never a third party.
 */
export async function updateEnquiryStatus(
  enquiryId: string,
  userId: string,
  status: EnquiryStatus,
) {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
  if (!enquiry) throw new Error("NOT_FOUND");
  if (enquiry.studentId !== userId && enquiry.landlordId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      status,
      readAt: status === "READ" ? new Date() : enquiry.readAt,
    },
  });
}

export async function addEnquiryReply(enquiryId: string, authorId: string, body: string) {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
  if (!enquiry) throw new Error("NOT_FOUND");
  if (enquiry.studentId !== authorId && enquiry.landlordId !== authorId) {
    throw new Error("FORBIDDEN");
  }

  const [reply] = await prisma.$transaction([
    prisma.enquiryReply.create({ data: { enquiryId, authorId, body } }),
    // A reply from the landlord automatically moves status to RESPONDED —
    // one write, kept atomic with the reply itself via $transaction so
    // they can never end up out of sync.
    prisma.enquiry.update({
      where: { id: enquiryId },
      data: {
        status: authorId === enquiry.landlordId ? "RESPONDED" : enquiry.status,
      },
    }),
  ]);

  return reply;
}
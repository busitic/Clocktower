import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PropertyForm } from "@/components/dashboard/property-form";
import { createProperty } from "./actions";

export default async function NewPropertyPage() {
  await requireRole("LANDLORD");
  const amenities = await prisma.amenity.findMany({ orderBy: { category: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add a property</h1>
      <PropertyForm amenities={amenities} onSubmit={createProperty} submitLabel="List property" />
    </div>
  );
}
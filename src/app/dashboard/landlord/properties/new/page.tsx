import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PropertyForm } from "@/components/dashboard/property-form";
import { createProperty } from "./actions";

export default async function NewPropertyPage() {
  await requireRole("LANDLORD");
  const amenities = await prisma.amenity.findMany({ orderBy: { category: "asc" } });

  return (
   
    <div className=" max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Add a property</h1>
        <p className="text-muted-foreground">
          Tell students about your place. Listings are reviewed before they go live.
        </p>
      </div>
      <PropertyForm amenities={amenities} onSubmit={createProperty} submitLabel="List property" />
    </div>
  );
}
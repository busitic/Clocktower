import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertyRowActions } from "@/components/dashboard/property-row-actions";
import { Plus } from "lucide-react";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function LandlordPropertiesPage() {
  const user = await requireRole("LANDLORD");

  const properties = await prisma.property.findMany({
    where: { landlordId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      _count: { select: { enquiries: true, favourites: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your properties</h1>
          <p className="text-muted-foreground">{properties.length} listing{properties.length !== 1 && "s"}</p>
        </div>
        {/* render={<X/>} not asChild — Base UI (style: base-vega), per Phase 5 */}
        <Button render={<Link href="/dashboard/landlord/properties/new" />}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add property
        </Button>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          You haven&apos;t listed any properties yet.
        </div>
      ) : (
        <div className="rounded-lg border divide-y">
          {properties.map((property) => (
            <div key={property.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                {property.images[0] && (
                  <Image src={property.images[0].url} alt={property.images[0].altText} fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/properties/${property.slug}`} className="font-medium truncate hover:underline">
                    {property.title}
                  </Link>
                  <Badge className={statusStyles[property.status]}>{property.status}</Badge>
                  {!property.isAvailable && <Badge variant="outline">Unavailable</Badge>}
                </div>
                {property.status === "REJECTED" && property.rejectedNote && (
                  <p className="text-sm text-destructive mt-1">Rejected: {property.rejectedNote}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  £{(property.rentPence / 100).toFixed(0)}/mo · {property.bedrooms} bed ·{" "}
                  {property._count.enquiries} enquir{property._count.enquiries !== 1 ? "ies" : "y"} ·{" "}
                  {property._count.favourites} favourited
                </p>
              </div>
              <PropertyRowActions propertyId={property.id} isAvailable={property.isAvailable} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
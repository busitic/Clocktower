import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { ModerationRowActions } from "@/components/dashboard/moderation-row-actions";

export default async function ModerationQueuePage() {
  await requireRole("ADMIN");

  const pendingProperties = await prisma.property.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" }, // oldest first — first submitted, first reviewed
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      landlord: { select: { name: true, email: true, companyName: true, isVerified: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Moderation queue</h1>
        <p className="text-muted-foreground">
          {pendingProperties.length} propert{pendingProperties.length !== 1 ? "ies" : "y"} awaiting review
        </p>
      </div>

      {pendingProperties.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          Nothing to review right now.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingProperties.map((property) => (
            <div key={property.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                {property.images[0] && (
                  <Image src={property.images[0].url} alt={property.images[0].altText} fill className="object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link href={`/properties/${property.slug}`} target="_blank" className="font-medium hover:underline">
                  {property.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  £{(property.rentPence / 100).toFixed(0)}/mo · {property.bedrooms} bed · {property.city}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Listed by {property.landlord.companyName ?? property.landlord.name}
                  {property.landlord.isVerified && " ✓ verified"} · {property.landlord.email}
                </p>
              </div>

              <ModerationRowActions propertyId={property.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getVisibleProperty } from "@/server/properties";
import { recordPropertyView } from "@/server/views";
import { formatPrice } from "@/lib/utils";
import { formatCampusDistance } from "@/lib/campus";
import { ImageGallery } from "@/components/property/image-gallery";
import { EnquiryForm } from "@/components/property/enquiry-form";
import { FavouriteButton } from "@/components/property/favourite-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BedDouble, Bath, MapPin, Calendar, Wifi, Receipt, Sofa,
  WashingMachine, Utensils, CarFront, Bike, BusFront, Trees,
  ShowerHead, BedDouble as BedIcon, Lamp, Dumbbell, ShieldCheck,
  Flame, PawPrint, Check,
} from "lucide-react";
import { ReportDialog } from "@/components/property/report-dialog";
import { PropertyMapWrapper } from "@/components/property/property-map-wrapper";

// Maps each amenity's icon slug (stored in the DB, per Phase 2's seed) to
// an actual Lucide component. Falls back to Check for anything unmapped.
const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Receipt, Sofa, WashingMachine, Utensils, CarFront, Bike,
  BusFront, Trees, ShowerHead, BedDouble: BedIcon, Lamp, Dumbbell,
  ShieldCheck, Flame, PawPrint,
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getVisibleProperty(slug, null);
  if (!property) return { title: "Property not found" };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
  };
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const viewer = session?.user ? { id: session.user.id, role: session.user.role } : null;

  const property = await getVisibleProperty(slug, viewer);
  if (!property) notFound();

  const isStudent = session?.user?.role === "STUDENT";
  const isOwnProperty = session?.user?.id === property.landlordId;

  // Fire-and-forget-ish: don't block the page render on this write, but
  // do await it since we're in a Server Component with no client JS to
  // hand it off to. Only students accrue view history.
  if (isStudent) {
    await recordPropertyView(session!.user.id, property.id);
  }

  let isFavourited = false;
  if (isStudent) {
    const favourite = await prisma.favourite.findUnique({
      where: { userId_propertyId: { userId: session!.user.id, propertyId: property.id } },
    });
    isFavourited = !!favourite;
  }

  const billsLabel =
    property.billsPolicy === "INCLUDED" ? "All bills included" :
    property.billsPolicy === "CAPPED" ? `Bills capped at ${formatPrice(property.billsCapPence ?? 0)}/month` :
    "Bills not included";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {property.status !== "APPROVED" && (
        <Badge variant="outline" className="mb-4">
          Preview — this listing is {property.status.toLowerCase()}, not yet visible to students
        </Badge>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <ImageGallery images={property.images} />

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{property.title}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="size-4" />
                {property.addressLine1}, {property.city} {property.postcode}
              </p>
            </div>
            {isStudent && (
              <FavouriteButton propertyId={property.id} initialFavourited={isFavourited} />
            )}
          </div>

          {property.walkMinutes !== null && (
            <Badge className="bg-campus text-campus-foreground mt-3">
              <MapPin className="mr-1 size-3" />
              {formatCampusDistance(property.walkMinutes, property.cycleMinutes)}
              {property.cycleMinutes !== null && ` · ${property.cycleMinutes} min cycle`}
            </Badge>
          )}

          <div className="mt-6 flex flex-wrap gap-6 border-y py-4 text-sm">
            <span className="flex items-center gap-2">
              <BedDouble className="size-4" /> {property.bedrooms} bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath className="size-4" /> {property.bathrooms} bathrooms
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="size-4" />
              Available {new Date(property.availableFrom).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
            <span>{property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}</span>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">About this property</h2>
            <p className="text-muted-foreground mt-2 whitespace-pre-line">{property.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">Bills &amp; furnishing</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{billsLabel}</Badge>
              <Badge variant="secondary">{property.isFurnished ? "Furnished" : "Unfurnished"}</Badge>
              <Badge variant="secondary">
                {property.tenancyType === "ACADEMIC_YEAR" ? "Academic year tenancy" :
                 property.tenancyType === "TWELVE_MONTH" ? "12-month tenancy" :
                 property.tenancyType === "SEMESTER" ? "Semester tenancy" : "Flexible tenancy"}
              </Badge>
              {property.busRoute && <Badge variant="secondary">{property.busRoute}</Badge>}
            </div>
          </div>

          {property.amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.icon] ?? Check;
                  return (
                    <span key={amenity.id} className="flex items-center gap-2 text-sm">
                      <Icon className="text-brick size-4" /> {amenity.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

     <div className="mt-6">
    <h2 className="text-lg font-semibold">Location</h2>
    <div className="mt-3">
     <PropertyMapWrapper
     latitude={property.latitude}
     longitude={property.longitude}
      title={property.title}
      walkMinutes={property.walkMinutes}
      cycleMinutes={property.cycleMinutes}
   />
     </div>
    </div>
    </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-brick text-2xl font-semibold">
                {formatPrice(property.rentPence)}
                <span className="text-muted-foreground text-sm font-normal"> /month</span>
              </p>
              <p className="text-muted-foreground text-sm">
                Deposit: {formatPrice(property.depositPence)}
              </p>
              <Separator className="my-4" />
              <p className="text-sm font-medium">Listed by</p>
              <p className="text-muted-foreground text-sm">
                {property.landlord.companyName ?? property.landlord.name}
                {property.landlord.isVerified && (
                  <Badge variant="outline" className="ml-2">Verified</Badge>
                )}
              </p>
              {session?.user && !isOwnProperty && (
                <>
                <Separator className="my-4" />
                <ReportDialog propertyId={property.id} />
                </>
              )}
            </CardContent>
          </Card>

          <EnquiryForm
            propertyId={property.id}
            isLoggedIn={!!session?.user}
            isOwnProperty={isOwnProperty}
          />
        </div>
      </div>
    </main>
  );
}
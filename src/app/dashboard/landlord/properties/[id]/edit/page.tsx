import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/dashboard/property-form";
import { updateProperty } from "../../actions";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("LANDLORD");
  const { id } = await params;

  const [property, amenities] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, amenities: { select: { slug: true } } },
    }),
    prisma.amenity.findMany({ orderBy: { category: "asc" } }),
  ]);

  // Ownership check belongs here too, not just in the server action —
  // without it a landlord could at least SEE another landlord's property
  // details pre-filled in a form, even if submitting would later fail
  // assertOwnership inside updateProperty.
  if (!property || property.landlordId !== user.id) {
    notFound();
  }

  const defaultValues = {
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    tenancyType: property.tenancyType,
    rentPounds: property.rentPence / 100,
    depositPounds: property.depositPence / 100,
    billsPolicy: property.billsPolicy,
    billsCapPounds: property.billsCapPence ? property.billsCapPence / 100 : undefined,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    isFurnished: property.isFurnished,
    isStudentOnly: property.isStudentOnly,
    totalHousemates: property.totalHousemates ?? undefined,
    addressLine1: property.addressLine1,
    addressLine2: property.addressLine2 ?? "",
    city: property.city,
    postcode: property.postcode,
    busRoute: property.busRoute ?? "",
    availableFrom: property.availableFrom as unknown as Date,
    amenitySlugs: property.amenities.map((a) => a.slug),
  };

const defaultImages = property.images.map((img) => ({
  url: img.url,
  fileKey: img.fileKey ?? undefined,
  altText: img.altText,
}));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit property</h1>
      <PropertyForm
        amenities={amenities}
        defaultValues={defaultValues}
        defaultImages={defaultImages}
        onSubmit={updateProperty.bind(null, id)} 
        submitLabel="Save changes"
      />
    </div>
  );
}
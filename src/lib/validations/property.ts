import { z } from "zod";

/*
  SEARCH QUERY VALIDATION
  -------------------------
  Every value arriving from a URL query string is a STRING, even "true" or
  "3". z.coerce converts them to the right type and rejects anything that
  doesn't convert cleanly — e.g. ?minPrice=banana fails validation instead
  of silently becoming NaN and corrupting the SQL query.
*/
export const propertySearchSchema = z.object({
  city: z.string().trim().optional(),
  postcode: z.string().trim().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  propertyType: z.enum(["HOUSE", "APARTMENT", "FLAT", "STUDIO", "ENSUITE", "ROOM"]).optional(),
  billsIncluded: z.coerce.boolean().optional(),
  furnished: z.coerce.boolean().optional(),
  maxWalkMinutes: z.coerce.number().int().min(0).optional(),
  amenities: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").filter(Boolean) : [])),
  sort: z.enum(["price-asc", "price-desc", "newest", "oldest", "closest"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type PropertySearchInput = z.infer<typeof propertySearchSchema>;

/*
  PROPERTY CREATE/UPDATE VALIDATION
  ------------------------------------
  Shared by the create and edit forms (Phase 9). Money fields arrive from
  a form as POUNDS (a human types "475") and get converted to pence here,
  right at the validation boundary — one place, not scattered across the UI.
*/
export const propertyInputSchema = z.object({
  title: z.string().trim().min(10).max(120),
  description: z.string().trim().min(50).max(3000),
  rentPounds: z.coerce.number().positive(),
  depositPounds: z.coerce.number().positive(),
  bedrooms: z.coerce.number().int().min(1).max(20),
  bathrooms: z.coerce.number().int().min(1).max(10),
  propertyType: z.enum(["HOUSE", "APARTMENT", "FLAT", "STUDIO", "ENSUITE", "ROOM"]),
  tenancyType: z.enum(["ACADEMIC_YEAR", "TWELVE_MONTH", "SEMESTER", "FLEXIBLE"]),
  billsPolicy: z.enum(["INCLUDED", "CAPPED", "EXCLUDED"]),
  billsCapPounds: z.coerce.number().positive().optional(),
  isFurnished: z.boolean(),
  isStudentOnly: z.boolean().default(true),
  totalHousemates: z.coerce.number().int().min(1).max(20).optional(),
  addressLine1: z.string().trim().min(3).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  postcode: z.string().trim().min(5).max(10),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  busRoute: z.string().trim().max(200).optional(),
  availableFrom: z.coerce.date(),
  amenitySlugs: z.array(z.string()).default([]),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;

export const enquirySchema = z.object({
  propertyId: z.string().cuid(),
  message: z.string().trim().min(20).max(1000),
  moveInDate: z.coerce.date().optional(),
  groupSize: z.coerce.number().int().min(1).max(20).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;


// Two separate types, not z.infer<> alone — because .coerce fields mean
// the shape react-hook-form HOLDS while typing (strings) differs from the
// shape zod PRODUCES after validation (numbers/dates). Same fix as the
// property-details enquiry form in Phase 6.
export type PropertyInputForm = z.input<typeof propertyInputSchema>;
export type PropertyInputOutput = z.output<typeof propertyInputSchema>;

// Images aren't covered by propertyInputSchema at all — validated separately.
export const propertyImagesSchema = z
  .array(z.object({ url: z.string().url(), altText: z.string().trim().min(3) }))
  .min(1, "Add at least one image");
export type PropertyImagesInput = z.infer<typeof propertyImagesSchema>;

// The form never collects lat/lng directly — they're resolved from the
// postcode server-side in createProperty(). So the form validates against
// this schema (everything except lat/lng), and the full propertyInputSchema
// (which still requires them) is only ever parsed AFTER geocoding, inside
// the server action.
export const propertyFormClientSchema = propertyInputSchema.omit({
  latitude: true,
  longitude: true,
});

export type PropertyFormClientInput = z.input<typeof propertyFormClientSchema>;
export type PropertyFormClientOutput = z.output<typeof propertyFormClientSchema>;
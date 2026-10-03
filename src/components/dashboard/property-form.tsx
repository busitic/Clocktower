"use client";
console.log("FILE LOADED");
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import {
  propertyFormClientSchema,
  type PropertyFormClientInput,
  type PropertyFormClientOutput,
} from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "House",
  APARTMENT: "Apartment",
  FLAT: "Flat",
  STUDIO: "Studio",
  ENSUITE: "En-suite",
  ROOM: "Room",
};

const TENANCY_TYPE_LABELS: Record<string, string> = {
  ACADEMIC_YEAR: "Academic year",
  TWELVE_MONTH: "12 months",
  SEMESTER: "Semester",
  FLEXIBLE: "Flexible",
};

const BILLS_POLICY_LABELS: Record<string, string> = {
  INCLUDED: "Included",
  CAPPED: "Capped",
  EXCLUDED: "Excluded",
};

interface PropertyImageInput {
  url: string;
  altText: string;
}

interface PropertyFormProps {
  defaultValues?: Partial<PropertyFormClientInput>;
  defaultImages?: PropertyImageInput[];
  amenities: { id: string; slug: string; name: string; category: string }[];
  onSubmit: (data: PropertyFormClientOutput, images: PropertyImageInput[]) => Promise<void>;
  submitLabel?: string;
}

export function PropertyForm({
  defaultValues,
  defaultImages,
  amenities,
  onSubmit,
  submitLabel = "List property",
}: PropertyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<PropertyImageInput[]>(
    defaultImages ?? [{ url: "", altText: "" }],
  );

  // Three generics — same fix as the Phase 6 enquiry form: .coerce fields
  // mean input (string, while typing) and output (number, post-validation)
  // shapes differ, so a single generic here breaks Zod's coercion.
const form = useForm<PropertyFormClientInput, unknown, PropertyFormClientOutput>({
  resolver: zodResolver(propertyFormClientSchema),
  defaultValues: {
    // same defaultValues object as before — just no latitude/longitude in it
    title: "",
    description: "",
    propertyType: "HOUSE",
    tenancyType: "ACADEMIC_YEAR",
    rentPounds: "" as unknown as number,
    depositPounds: "" as unknown as number,
    billsPolicy: "EXCLUDED",
    billsCapPounds: undefined,
    bedrooms: "" as unknown as number,
    bathrooms: "" as unknown as number,
    isFurnished: true,
    isStudentOnly: true,
    totalHousemates: undefined,
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    busRoute: "",
    availableFrom: "" as unknown as Date,
    amenitySlugs: [],
    ...defaultValues,
  },
});

  const billsPolicy = useWatch({ control: form.control, name: "billsPolicy" });

  function handleSubmit(data: PropertyFormClientOutput) {
    console.log("SUBMIT FIRED",data)
    if (images.some((img) => !img.url || !img.altText)) {
      toast.error("Every image needs a URL and a description.");
      return;
    }
    startTransition(async () => {
      try {
        await onSubmit(data, images);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function updateImage(index: number, patch: Partial<PropertyImageInput>) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
        console.log("VALIDATION FAILED:", errors);
              })} className="max-w-2xl space-y-8">
        {/* --- Basics --- */}
        <section className="space-y-4">
          <h2 className="font-medium">Basics</h2>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Bright 2-bed near campus" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property type</FormLabel>
                {/* Base UI: onValueChange gives string | null, needs a fallback */}
                <Select value={field.value} onValueChange={(v) => field.onChange(v ?? "HOUSE")}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type">
                        {(value: string) => PROPERTY_TYPE_LABELS[value] ?? value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["HOUSE", "APARTMENT", "FLAT", "STUDIO", "ENSUITE", "ROOM"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {PROPERTY_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tenancyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenancy type</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? "ACADEMIC_YEAR")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {(value: string) => TENANCY_TYPE_LABELS[value] ?? value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACADEMIC_YEAR">Academic year</SelectItem>
                    <SelectItem value="TWELVE_MONTH">12 months</SelectItem>
                    <SelectItem value="SEMESTER">Semester</SelectItem>
                    <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* --- Pricing --- */}
        <section className="space-y-4">
          <h2 className="font-medium">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rentPounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent (£/month)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={(field.value as string | number | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depositPounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit (£)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={(field.value as string | number | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="billsPolicy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bills</FormLabel>
                <Select value={field.value} onValueChange={(v) => field.onChange(v ?? "EXCLUDED")}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {(value: string) => BILLS_POLICY_LABELS[value] ?? value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INCLUDED">Included</SelectItem>
                    <SelectItem value="CAPPED">Capped</SelectItem>
                    <SelectItem value="EXCLUDED">Excluded</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {billsPolicy === "CAPPED" && (
            <FormField
              control={form.control}
              name="billsCapPounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bills cap (£/month)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={(field.value as string | number | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </section>

        {/* --- Layout --- */}
        <section className="space-y-4">
          <h2 className="font-medium">Layout</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrooms</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as string | number | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathrooms</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as string | number | undefined) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="totalHousemates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total housemates (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={(field.value as string | number | undefined) ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isFurnished"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Furnished</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isStudentOnly"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-normal">Student-only</FormLabel>
              </FormItem>
            )}
          />
        </section>

        {/* --- Location --- */}
        <section className="space-y-4">
          <h2 className="font-medium">Location</h2>
          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 1</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 2 (optional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input placeholder="L39 4QP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="busRoute"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bus route (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="385 stops nearby, every 15 min"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-muted-foreground text-xs">
            Walking/cycling distance to campus is calculated automatically from the postcode.
          </p>
        </section>

        {/* --- Availability --- */}
        <section className="space-y-4">
          <h2 className="font-medium">Availability</h2>
          <FormField
            control={form.control}
            name="availableFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available from</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    onChange={(e) => field.onChange(e.target.value)}
                    value={
                      field.value
                        ? new Date(field.value as unknown as string).toISOString().slice(0, 10)
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* --- Amenities --- */}
        <section className="space-y-4">
          <h2 className="font-medium">Amenities</h2>
          <div className="grid grid-cols-2 gap-2">
            {amenities.map((amenity) => (
              <FormField
                key={amenity.id}
                control={form.control}
                name="amenitySlugs"
                render={({ field }) => {
                  const current = field.value ?? [];
                  const checked = current.includes(amenity.slug);
                  return (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(isChecked) => {
                            const next = isChecked
                              ? [...current, amenity.slug]
                              : current.filter((slug: string) => slug !== amenity.slug);
                            field.onChange(next);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{amenity.name}</FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
        </section>

        {/* --- Images (pasted URLs, per your call) --- */}
        <section className="space-y-4">
          <h2 className="font-medium">Images</h2>
          {images.map((img, index) => (
            <div key={index} className="flex items-start gap-2">
              <Input
                placeholder="https://..."
                value={img.url}
                onChange={(e) => updateImage(index, { url: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Description for screen readers"
                value={img.altText}
                onChange={(e) => updateImage(index, { altText: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                disabled={images.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImages((prev) => [...prev, { url: "", altText: "" }])}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add image
          </Button>
        </section>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
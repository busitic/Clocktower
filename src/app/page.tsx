import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/property/property-card";
import { searchProperties } from "@/server/properties";
import { MapPin, Search, ShieldCheck, Clock, Home as HomeIcon } from "lucide-react";

const POPULAR_CITIES = [
  "Ormskirk", "Burscough", "Skelmersdale", "Aughton",
  "Liverpool", "Southport", "Westhead", "Wigan",
];

export default async function HomePage() {
  // Server Component calling the data layer directly — no fetch, no API
  // round-trip needed for the initial render.
  const { properties: featured } = await searchProperties({
    sort: "closest",
    page: 1,
    pageSize: 6,
    amenities: [],
  });

  async function search(formData: FormData) {
    "use server";
    const params = new URLSearchParams();
    const city = formData.get("city")?.toString();
    const minPrice = formData.get("minPrice")?.toString();
    const maxPrice = formData.get("maxPrice")?.toString();
    const bedrooms = formData.get("bedrooms")?.toString();

    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);

    redirect(`/properties?${params.toString()}`);
  }

  return (
    <main>
      {/* --- HERO --- */}
      <section className="from-primary to-primary/90 relative overflow-hidden bg-gradient-to-br px-4 py-20 text-white sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            Find your next student home
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Every listing in Ormskirk, measured by how far it really is from Edge Hill.
          </p>

          <form
            action={search}
            className="bg-card mt-10 grid gap-3 rounded-2xl p-4 text-left shadow-xl sm:grid-cols-4"
          >
            <Input name="city" placeholder="City, e.g. Ormskirk" className="text-foreground" />
            <Input name="minPrice" type="number" placeholder="Min £/month" className="text-foreground" />
            <Input name="maxPrice" type="number" placeholder="Max £/month" className="text-foreground" />
            <Button type="submit" className="bg-brick hover:bg-brick/90 gap-2">
              <Search className="size-4" /> Search
            </Button>
          </form>
        </div>
      </section>

      {/* --- POPULAR CITIES --- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold">Popular areas</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {POPULAR_CITIES.map((city) => (
            <Link
              key={city}
              href={`/properties?city=${encodeURIComponent(city)}`}
              className="hover:border-brick hover:text-brick flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
            >
              <MapPin className="size-4" /> {city}
            </Link>
          ))}
        </div>
      </section>

      {/* --- FEATURED, closest to campus --- */}
      <section className="bg-secondary/40 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Closest to campus</h2>
            <Link href="/properties?sort=closest" className="text-brick text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <Search className="text-brick size-8" />
            <p className="mt-3 font-medium">Search by distance</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Every property shows a real walk and cycle time to campus, calculated from its exact location.
            </p>
          </div>
          <div>
            <ShieldCheck className="text-brick size-8" />
            <p className="mt-3 font-medium">Verified listings</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Every listing is reviewed before it goes live, so what you see is whats actually available.
            </p>
          </div>
          <div>
            <Clock className="text-brick size-8" />
            <p className="mt-3 font-medium">Academic-year tenancies</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Filter for lets that actually match your term dates, not just standard 12-month contracts.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
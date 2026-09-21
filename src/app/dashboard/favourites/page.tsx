import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { getFavourites } from "@/server/favourites";
import { FavouritesGrid } from "@/components/property/favourites-grid";

export const metadata: Metadata = { title: "Your favourites" };

export default async function FavouritesPage() {
  const user = await requireRole("STUDENT");
  const favourites = await getFavourites(user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Your favourites</h1>
      <p className="text-muted-foreground mt-1">
        {favourites.length} {favourites.length === 1 ? "property" : "properties"} saved
      </p>
      <FavouritesGrid favourites={favourites} />
    </main>
  );
}
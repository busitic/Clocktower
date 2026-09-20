import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { searchProperties } from "@/server/properties";
import { propertySearchSchema } from "@/lib/validations/property";
import { PropertyCard } from "@/components/property/property-card";
import { SearchFilters } from "@/components/search/search-filters";
import { SortDropdown } from "@/components/search/sort-dropdown";
import { PaginationControls } from "@/components/search/pagination-controls";
import { EmptyState } from "@/components/shared/empty-state";
import { HomeIcon } from "lucide-react";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PropertiesPage ({searchParams}: Props){
 const rawParams = await searchParams;

 const params = propertySearchSchema.parse(rawParams);

 const [{ properties, pagination }, session] = await Promise.all([
    searchProperties(params),
    auth(),
 ]);



 let favouritedIds = new Set<string>();
 if(session?.user?.role === "STUDENT") {
    const favourites = await prisma.favourite.findMany({
        where: {
            userId: session.user.id,
            propertyId: {in: properties.map((p) => p.id),}
        },
        select: {propertyId: true},
    });
    favouritedIds = new Set(favourites.map((f) => f.propertyId));
 }

 return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
     <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-72 lg:shrink-0">
         <SearchFilters />
        </aside>
        <div className="flex-1" >
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">
                {pagination.total} {pagination.total === 1 ? "property" : "properties"} found
              </p>
              <SortDropdown />
            </div>

            {properties.length === 0 ? (
                <EmptyState
                icon={HomeIcon}
                title="No properties match your search"
                description="Try widening your filters - a higher max price or a shorter walk-time cutoff often helps" />
            ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                    <PropertyCard 
                    key={property.id}
                    property={property}
                    showFavourite={session?.user?.role === "STUDENT"}
                    isFavourited={favouritedIds.has(property.id)}
                    />
                ))}
                </div>
            )}
            <PaginationControls pagination={pagination} />
        </div>
        </div> 
    </main>
 )
} 
    

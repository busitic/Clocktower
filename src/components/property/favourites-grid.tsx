"use client"


import { useState } from "react";
import { PropertyCard } from "./property-card";
import { EmptyState } from "../shared/empty-state";
import { Heart } from "lucide-react";
import type { Property, PropertyImage, Amenity } from "@prisma/client";

type FavouriteWithProperty = {
    id: string;
    property: Property & {images: PropertyImage[]; amenities: Amenity[] };

};


export function FavouritesGrid({ favourites }: {favourites: FavouriteWithProperty[]}) {
    const [items, setItems] = useState(favourites);

    if (items.length === 0) {
        return (
            <div className="mt-8">
                <EmptyState
                icon={Heart}
                title="No favourites yet"
                description="Tap the heart on any property to save it here for later."
                />
            </div>
        );
    }

    return (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
           {items.map((favourite) => (
            <PropertyCard
            key={favourite.id}
            property={favourite.property}
            showFavourite
            isFavourited
            onRemoved={() => setItems((prev) => prev.filter((f) => f.id !== favourite.id))}  
            />
           ))}
        </div>
    );
}
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { formatCampusDistance } from "@/lib/campus";
import { BedDouble, Bath, MapPin } from "lucide-react";
import { FavouriteButton } from "./favourite-button";
import type { Property, PropertyImage, Amenity } from "@prisma/client";

type PropertyCardData = Property & {
    images: PropertyImage[];
    amenities: Amenity[];
};

export function PropertyCard({
    property,
    isFavourited = false,
    showFavourite = false,
}: {
    property: PropertyCardData;
    isFavourited?: boolean;
    showFavourite?: boolean;
}) {
    const image = property.images[0];

    return(
        <Card className="group relative overflow-hidden py-0 transition-shadow hover:shadow-md">
            <Link href={`/properties/${property.slug}`}>
            <div className="bg-muted relative aspect-4/3 w-full overflow-hidden">
            {image ? (
                <Image src={image.url}
                alt={image.altText}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 120px) 50vw, 25vw" />
            ): (
                <div className="text-muted-foreground flex h-full items-center justify-center text-sm"> No image available</div>
            )}
         
         {property.walkMinutes !== null && (
            <Badge className="bg-campus text-campus-foreground absolute top-3 left-3">
                <MapPin className="mr-1 size-3" />
                {formatCampusDistance(property.walkMinutes, property.cycleMinutes)}
            </Badge>
         )}
            </div>
            </Link>
          
         {showFavourite && (
            <div className="absolute top-3 right-3">
            <FavouriteButton propertyId={property.id} initialFavourited={isFavourited} />
            </div>
         )} 

         <CardContent className="p-4">
         <Link href={`/properties/${property.slug}`}>
           <p className="line-clamp-1 font-medium">{property.title}</p>
         </Link>
         <p className="text-muted-foreground mt-1 text-sm">{property.city}</p>

         <div className="mt-3 flex items-center gap-4 text-sm">
           <span className="flex items-center gap-1">
            <BedDouble className="size-4" /> {property.bathrooms}
           </span>
           <span className="flex item-center gap-1">
              <Bath className="size-4" /> {property.bathrooms}
           </span>
         </div>

         <div className="mt-3 flex items-baseline justify-between">
            <p className="text-brick text-lg font-semibold">
                {formatPrice(property.rentPence)}
                <span className="text-muted-foreground text-sm font-normal">/month</span>
            </p>
         </div>
         </CardContent>

        </Card>
    )
}
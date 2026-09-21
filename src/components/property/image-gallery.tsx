"use client"

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@prisma/client";


export function ImageGallery ({
    images
}: {images: PropertyImage[]}) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return(
            <div className="bg-muted text-muted-foreground flex aspect- 16/10 items-center justify-center rounded-xl">
               No images available
            </div>
        );
    }


const active = images[activeIndex];

return (
    <div>
        <div className="bg-muted relative aspect-16/10 w-full overflow-hidden rounded-xl ">
          <Image
          src={active.url}
          alt={active.altText}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
                <button 
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn (
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex ? " border-brick" : "border-transparent",
                )}
                >
                  <Image src={image.url} alt={image.altText} fill className="object-cover" sizes="80px" />       
                </button>
            ))}
            </div>
        )}
    </div>
 );

}
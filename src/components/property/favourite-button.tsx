"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FavouriteButton({
  propertyId,
  initialFavourited,
}: {
  propertyId: string;
  initialFavourited: boolean;
}) {
  const [isFavourited, setIsFavourited] = useState(initialFavourited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(e: React.MouseEvent) {
    // Stop the click bubbling up to the parent <Link> around the card.
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        if (isFavourited) {
          const res = await fetch(`/api/favourites/${propertyId}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          setIsFavourited(false);
          toast.success("Removed from favourites");
        } else {
          const res = await fetch("/api/favourites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ propertyId }),
          });
          if (res.status === 401) {
            toast.error("Log in to save favourites");
            router.push("/login");
            return;
          }
          if (!res.ok) throw new Error();
          setIsFavourited(true);
          toast.success("Saved to favourites");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  return (
    <Button
      size="icon"
      variant="secondary"
      onClick={toggle}
      disabled={isPending}
      className="rounded-full shadow-sm"
      aria-label={isFavourited ? "Remove from favourites" : "Save to favourites"}
    >
      <Heart className={cn("size-4", isFavourited && "fill-brick text-brick")} />
    </Button>
  );
}
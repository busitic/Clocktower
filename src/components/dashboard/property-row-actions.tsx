"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deleteProperty, toggleAvailability } from "@/app/dashboard/landlord/properties/actions";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PropertyRowActionsProps {
  propertyId: string;
  isAvailable: boolean;
}

export function PropertyRowActions({ propertyId, isAvailable }: PropertyRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle(next: boolean) {
    startTransition(async () => {
      try {
        await toggleAvailability(propertyId, next);
      } catch {
        toast.error("Couldn't update availability.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProperty(propertyId);
        toast.success("Property deleted.");
        router.refresh();
      } catch {
        toast.error("Couldn't delete that property.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <Switch checked={isAvailable} onCheckedChange={handleToggle} disabled={isPending} />
        <span className="text-xs text-muted-foreground w-14">{isAvailable ? "Available" : "Hidden"}</span>
      </div>

      <Button variant="ghost" size="icon" render={<Link href={`/dashboard/landlord/properties/${propertyId}/edit`} />}>
        <Pencil className="h-4 w-4" />
      </Button>

      <AlertDialog>
        {/* render, not asChild — Base UI */}
        <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the listing, its images, and its enquiry history. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
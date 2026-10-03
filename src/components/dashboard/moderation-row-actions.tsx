"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { approveProperty, rejectProperty } from "@/app/dashboard/admin/moderation/actions";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export function ModerationRowActions({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleApprove() {
    startTransition(async () => {
      try {
        await approveProperty(propertyId);
        toast.success("Property approved.");
      } catch {
        toast.error("Couldn't approve — try again.");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      try {
        await rejectProperty(propertyId, rejectNote);
        toast.success("Property rejected.");
        setDialogOpen(false);
        setRejectNote("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't reject — try again.");
      }
    });
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        <Check className="h-4 w-4 mr-1" />
        Approve
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={<Button size="sm" variant="outline" />}>
          <X className="h-4 w-4 mr-1" />
          Reject
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this listing</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Explain what needs fixing — this is shown to the landlord."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending || !rejectNote.trim()}>
              Reject listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
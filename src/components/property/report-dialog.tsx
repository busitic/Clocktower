"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { reportProperty } from "@/app/properties/[slug]/report-actions";
import { Flag } from "lucide-react";
import { toast } from "sonner";

const REASON_LABELS: Record<string, string> = {
  MISLEADING: "Misleading listing",
  UNAVAILABLE: "No longer available",
  INAPPROPRIATE: "Inappropriate content",
  SUSPECTED_SCAM: "Suspected scam",
  DUPLICATE: "Duplicate listing",
  OTHER: "Other",
};

export function ReportDialog({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("MISLEADING");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      try {
        await reportProperty({ propertyId, reason: reason as never, details: details || undefined });
        toast.success("Thanks — we'll review this listing.");
        setOpen(false);
        setDetails("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't submit the report.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Flag className="h-4 w-4 mr-1.5" />
        Report listing
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
        </DialogHeader>

        <Select value={reason} onValueChange={(v) => setReason(v ?? "MISLEADING")}>
          <SelectTrigger>
            <SelectValue>{(value: string) => REASON_LABELS[value] ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REASON_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Any extra detail that helps us review this (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isPending}>
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
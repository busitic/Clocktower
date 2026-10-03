"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resolveReport, dismissReport } from "@/app/dashboard/admin/reports/actions";
import { toast } from "sonner";

export function ReportRowActions({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition();
  const [note] = useState(""); // keep simple for now — expand to a dialog+textarea like moderation if you want a required note

  function handle(action: (id: string, note: string) => Promise<void>, label: string) {
    startTransition(async () => {
      try {
        await action(reportId, note);
        toast.success(label);
      } catch {
        toast.error("Couldn't update the report.");
      }
    });
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Button size="sm" variant="outline" onClick={() => handle(dismissReport, "Dismissed.")} disabled={isPending}>
        Dismiss
      </Button>
      <Button size="sm" onClick={() => handle(resolveReport, "Resolved.")} disabled={isPending}>
        Resolve
      </Button>
    </div>
  );
}
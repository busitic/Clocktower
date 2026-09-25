"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogIn, ShieldAlert } from "lucide-react";

/*
  Server Components can't catch their own thrown errors — Next.js bubbles
  them up to the nearest error.tsx in the route segment tree instead.
  requireUser()/requireRole() throw plain Error objects with a specific
  message ("UNAUTHENTICATED" / "FORBIDDEN") — this component reads that
  message and shows the right thing instead of a scary stack trace.
*/
export function ErrorDisplay({ error, reset }: { error: Error; reset: () => void }) {
  if (error.message === "UNAUTHENTICATED") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <LogIn className="text-muted-foreground size-10" />
        <p className="font-medium">You need to log in to see this page</p>
        <Button render={<Link href="/login" />}>Log in</Button>
      </div>
    );
  }

  if (error.message === "FORBIDDEN") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <ShieldAlert className="text-muted-foreground size-10" />
        <p className="font-medium">You don't have permission to view this page</p>
        <Button variant="outline" render={<Link href="/" />}>Back to home</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <AlertCircle className="text-destructive size-10" />
      <p className="font-medium">Something went wrong</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        This has been an unexpected error. You can try again, or head back to the homepage.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>Try again</Button>
        <Button render={<Link href="/" />}>Go home</Button>
      </div>
    </div>
  );
}
"use client"

import { ErrorDisplay } from "@/components/shared/error.display";

export default function DashboardError({
    error,
    reset,

}:  {
     error: Error;
     reset: () => void;
}) {
    return <ErrorDisplay error={error} reset={reset} />
}
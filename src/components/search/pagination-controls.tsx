"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Pagination = { page: number; totalPages: number; total: number };

export function PaginationControls({ pagination }: { pagination: Pagination }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pagination.totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={pagination.page <= 1}
        onClick={() => goToPage(pagination.page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-muted-foreground px-3 text-sm">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() => goToPage(pagination.page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
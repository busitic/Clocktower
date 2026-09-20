"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
 } from "@/components/ui/select"

 const OPTIONS = [
    {value: "newest", label: "Newest"},
    {value: "closest", label: "Closest to campus"},
    {value: "price-asc", label: "Price: low to high"},
    {value: "price-desc", label: "Price: high to low"},
    {value: "oldest", label: "Oldest"},
 ];

 export function SortDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") ?? "newest";

 function handleChange(value: string | null) {
  if (!value) return; // sort always has a value; ignore the null case
  const params = new URLSearchParams(searchParams.toString());
  params.set("sort", value);
  params.set("page", "1");
  router.push(`${pathname}?${params.toString()}`);
}

    return (
        <Select value={currentSort} onValueChange={handleChange}>
            <SelectTrigger className="w-[200px]">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                    ))}
                    </SelectContent> 
               </Select>
    );
 }
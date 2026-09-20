"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DISTANCE_BANDS } from "@/lib/campus";

const PROPERTY_TYPES = ["HOUSE", "APARTMENT", "FLAT", "STUDIO", "ENSUITE", "ROOM"];

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state mirrors the URL, edited freely, then "Apply" pushes it all
  // at once — this avoids a network request on every single keystroke.
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") ?? "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") ?? "any");
  const [maxWalk, setMaxWalk] = useState(searchParams.get("maxWalkMinutes") ?? "any");
  const [billsIncluded, setBillsIncluded] = useState(searchParams.get("billsIncluded") === "true");
  const [furnished, setFurnished] = useState(searchParams.get("furnished") === "true");

  function apply() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (propertyType !== "any") params.set("propertyType", propertyType);
    if (maxWalk !== "any") params.set("maxWalkMinutes", maxWalk);
    if (billsIncluded) params.set("billsIncluded", "true");
    if (furnished) params.set("furnished", "true");
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    router.push(pathname);
  }

  return (
    <div className="space-y-5 rounded-xl border p-4">
      <div>
        <Label htmlFor="filter-city">City</Label>
        <Input id="filter-city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="filter-min">Min £/month</Label>
          <Input id="filter-min" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="filter-max">Max £/month</Label>
          <Input id="filter-max" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label htmlFor="filter-bedrooms">Min bedrooms</Label>
        <Input id="filter-bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="mt-1.5" />
      </div>

      <div>
        <Label>Property type</Label>
    <Select value={propertyType} onValueChange={(value) => setPropertyType(value ?? "any")}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[220px]">
            <SelectItem value="any">Any type</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Distance to campus</Label>
        <Select value={maxWalk} onValueChange={(value) => setMaxWalk(value ?? "any")}>
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[220px]">
            <SelectItem value="any">Any distance</SelectItem>
            {DISTANCE_BANDS.map((band) => (
              <SelectItem key={band.slug} value={band.maxWalkMinutes.toString()}>
                {band.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-bills"
            checked={billsIncluded}
            onCheckedChange={(v) => setBillsIncluded(!!v)}
          />
          <Label htmlFor="filter-bills" className="font-normal">Bills included</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-furnished"
            checked={furnished}
            onCheckedChange={(v) => setFurnished(!!v)}
          />
          <Label htmlFor="filter-furnished" className="font-normal">Furnished</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={apply} className="flex-1">Apply</Button>
        <Button onClick={clear} variant="outline">Clear</Button>
      </div>
    </div>
  );
}
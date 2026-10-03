"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(
  () => import("@/components/property/property-map").then((mod) => mod.PropertyMap),
  { ssr: false, loading: () => <div className="bg-muted aspect-video w-full animate-pulse rounded-xl" /> },
);

interface PropertyMapWrapperProps {
  latitude: number;
  longitude: number;
  title: string;
}

export function PropertyMapWrapper(props: PropertyMapWrapperProps) {
  return <PropertyMap {...props} />;
}
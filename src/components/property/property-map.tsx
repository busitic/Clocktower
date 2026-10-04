"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CAMPUS_COORDINATES } from "@/lib/campus";
import { formatCampusDistance } from "@/lib/campus";

// Custom circular div-icons instead of Leaflet's default pins — renders as
// actual HTML/CSS, so it inherits the app's design tokens and can animate,
// rather than a static bitmap image.
function createDotIcon(color: string, pulse = false) {
  return L.divIcon({
    className: "", // strip Leaflet's default icon class so only ours applies
    html: `
      <div class="relative flex items-center justify-center">
        ${pulse ? `<span class="absolute inline-flex h-8 w-8 animate-ping rounded-full opacity-40" style="background-color:${color}"></span>` : ""}
        <span class="relative inline-flex h-4 w-4 rounded-full ring-4 ring-white shadow-lg" style="background-color:${color}"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  walkMinutes?: number | null;
  cycleMinutes?: number | null;
}

export function PropertyMap({ latitude, longitude, title, walkMinutes, cycleMinutes }: PropertyMapProps) {
  const center: [number, number] = [latitude, longitude];
  const propertyIcon = createDotIcon("#c2410c", true); // brick-ish, pulsing — this is the point of interest
  const campusIcon = createDotIcon("#1e293b", false);  // slate, static — fixed reference point

  return (
    <div className="animate-in fade-in zoom-in-95 relative w-full overflow-hidden rounded-xl shadow-sm duration-500">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        className="aspect-video w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="saturate-[0.85] contrast-[1.05]" // slightly muted tiles so markers/UI pop more
        />

        <ZoomControl position="bottomright" />

        <Marker position={center} icon={propertyIcon}>
          <Popup className="rounded-lg">
            <span className="font-medium">{title}</span>
          </Popup>
        </Marker>

        <Marker position={[CAMPUS_COORDINATES.latitude, CAMPUS_COORDINATES.longitude]} icon={campusIcon}>
          <Popup>Edge Hill University</Popup>
        </Marker>

        <Circle
          center={[CAMPUS_COORDINATES.latitude, CAMPUS_COORDINATES.longitude]}
          radius={1000}
          pathOptions={{ color: "#1e293b", weight: 1, fillOpacity: 0.04 }}
        />
      </MapContainer>

      {/* Floating distance chip, overlaid top-left — the number that
          actually matters to a student, surfaced without a click */}
      {walkMinutes !== null && walkMinutes !== undefined && (
        <div className="bg-background/90 absolute top-3 left-3 z-[1000] rounded-full px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm">
          {formatCampusDistance(walkMinutes, cycleMinutes ?? null)}
        </div>
      )}
    </div>
  );
}
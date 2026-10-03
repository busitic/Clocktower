"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CAMPUS_COORDINATES } from "@/lib/campus";


const propertyIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

const campusIcon = new L.Icon({
     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" ,
    iconSize: [31, 51],
    iconAnchor: [15, 51],
    className: "hue-rotate-180",
});

 interface PropertyMapProps {
    latitude: number;
    longitude: number;
    title: string;
 }

 export function PropertyMap({ latitude, longitude, title }: PropertyMapProps) {
    const center : [number, number] = [latitude, longitude];

    return (
        <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="aspect-video w-full rounded-xl"
        >

          <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          /> 

          <Marker position={center} icon={propertyIcon}>
             <Popup>{title}</Popup>
          </Marker>
        
           <Marker position={center} icon={propertyIcon}>
            <Popup>{title}</Popup>
           </Marker>
             
           <Marker 
           position={[CAMPUS_COORDINATES.latitude, CAMPUS_COORDINATES.longitude]}
           icon={campusIcon}
           >
           <Popup>Edge Hill University</Popup>
           </Marker>

           <Circle
           center={[CAMPUS_COORDINATES.latitude, CAMPUS_COORDINATES.longitude]}
           radius={1000}
           pathOptions={{color: "var(--campus)", fillOpacity: 0.05}}
           />
            
        </MapContainer>
        
    
    );
 }
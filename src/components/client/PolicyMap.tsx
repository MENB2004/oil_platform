// src/components/client/PolicyMap.tsx
"use client";

import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type DistrictDatum = {
  district: string;
  lat: number;
  lng: number;
  avgOil: number;
};

export default function PolicyMap({ data }: { data: DistrictDatum[] }) {
  return (
    <div className="w-full h-[520px] rounded-xl shadow overflow-hidden">
      <MapContainer
        center={[11.1271, 78.6569]}
        zoom={7}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          // Tile URL and attribution are standard props
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {data.map((d, i) => (
          <CircleMarker
            key={d.district + i}
            center={[d.lat, d.lng]}
            radius={8}
            pathOptions={{ color: d.avgOil > 13 ? "red" : "green" }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{d.district}</strong>
                <div>Avg Oil (kg/year): {d.avgOil}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

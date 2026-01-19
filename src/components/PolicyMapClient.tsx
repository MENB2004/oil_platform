"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DistrictDatum } from "../types/indesx";

type Props = {
  data: DistrictDatum[];
};

export default function PolicyMapClient({ data }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // create map only once
  useEffect(() => {
    if (!containerRef.current) return;

    // If a map already exists (e.g. HMR), remove it first to avoid "already initialized"
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (err) {
        // ignore removal errors but ensure we null it
      }
      mapRef.current = null;
    }

    // Initialize the map
    const map = L.map(containerRef.current, {
      center: [20.5937, 78.9629], // India center by default
      zoom: 5,
      preferCanvas: true,
      attributionControl: false,
    });

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add a layer group for markers so we can clear/update them easily
    const markers = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersRef.current = markers;

    return () => {
      // cleanup on unmount
      markersRef.current?.clearLayers();
      try {
        mapRef.current?.remove();
      } catch {
        // ignore
      }
      mapRef.current = null;
      markersRef.current = null;
    };
    // run only once on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update markers whenever `data` changes, without re-initializing the map
  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map || !markers) return;

    // clear old markers
    markers.clearLayers();

    if (Array.isArray(data) && data.length > 0) {
      // Use LatLngTuple[] for type-safety with fitBounds
      const bounds: L.LatLngTuple[] = [];

      data.forEach((d) => {
        if (typeof d.lat !== "number" || typeof d.lng !== "number") return;

        const tuple: L.LatLngTuple = [d.lat, d.lng];

        const marker = L.circleMarker(tuple, {
          radius: 8,
          fillColor: "#f59e0b",
          color: "#fb923c",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9,
        }).bindPopup(`<strong>${d.district}</strong><br/>Avg oil: ${d.avgOil ?? "—"}`);

        marker.addTo(markers);
        bounds.push(tuple);
      });

      // if we have bounds, fit to them with padding
      if (bounds.length > 0) {
        try {
          map.fitBounds(bounds, { padding: [40, 40] });
        } catch {
          // If fitBounds fails, ignore
        }
      }
    }
    // re-run on changes to data
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden"
      // ensure there's a size so Leaflet can initialize
      style={{ minHeight: 500 }}
    />
  );
}

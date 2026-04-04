"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  lat: number;
  lng: number;
  name: string;
  slug: string;
  cuisineType?: string | null;
  isOpenNow?: boolean;
}

interface RestaurantMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  singleMarker?: boolean;
}

export function RestaurantMap({
  markers,
  center,
  zoom = 13,
  className = "h-[400px] w-full rounded-xl",
  singleMarker = false,
}: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current || markers.length === 0) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = center || [50.0755, 14.4378]; // Praha

    const map = L.map(mapRef.current, {
      scrollWheelZoom: !singleMarker,
    }).setView(defaultCenter, zoom);

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icon
    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: 32px; height: 32px;
        background: oklch(0.55 0.18 30);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 15 5.12-5.12A3 3 0 0 1 10.24 9H13a2 2 0 1 1 0 4h-2.5m4-.68 4.17-4.89a1.5 1.5 0 0 1 2.18-.18"/>
          <path d="m2 12 6.38-6.38a3 3 0 0 1 2.12-.87h.5"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const bounds = L.latLngBounds([]);

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

      const openBadge = m.isOpenNow
        ? '<span style="display:inline-block;background:#22c55e;color:white;font-size:11px;padding:1px 6px;border-radius:8px;margin-left:6px;">Otevřeno</span>'
        : "";

      marker.bindPopup(
        `<div style="min-width:160px;font-family:system-ui,sans-serif;">
          <a href="/restaurace/${m.slug}" style="font-weight:600;font-size:14px;color:inherit;text-decoration:none;">
            ${m.name}
          </a>${openBadge}
          ${m.cuisineType ? `<div style="font-size:12px;color:#888;margin-top:2px;">${m.cuisineType}</div>` : ""}
          <a href="/restaurace/${m.slug}" style="display:inline-block;margin-top:6px;font-size:12px;color:oklch(0.55 0.18 30);text-decoration:none;">
            Zobrazit menu →
          </a>
        </div>`
      );

      bounds.extend([m.lat, m.lng]);
    });

    if (!singleMarker && markers.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 15);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, markers, center, zoom, singleMarker]);

  if (!mounted) {
    return (
      <div className={`${className} animate-pulse bg-muted`} />
    );
  }

  return <div ref={mapRef} className={className} />;
}

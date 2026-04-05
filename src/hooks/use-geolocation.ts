"use client";

import { useState, useCallback } from "react";

interface GeoPosition {
  latitude: number;
  longitude: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  loading: boolean;
  error: string | null;
  requestPosition: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolokace není podporována vaším prohlížečem");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Přístup k poloze byl zamítnut");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Poloha není dostupná");
            break;
          case err.TIMEOUT:
            setError("Požadavek na polohu vypršel");
            break;
          default:
            setError("Nepodařilo se získat polohu");
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 min cache
      }
    );
  }, []);

  return { position, loading, error, requestPosition };
}

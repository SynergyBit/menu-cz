"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface City {
  name: string;
  slug: string;
  count: number;
}

export function CityLinks() {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []))
      .catch(() => {});
  }, []);

  if (cities.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {cities.slice(0, 10).map((city) => (
        <Link key={city.slug} href={`/restaurace/mesto/${city.slug}`}>
          <Badge
            variant="outline"
            className="cursor-pointer gap-1.5 px-3 py-1.5 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <MapPin className="h-3 w-3" />
            {city.name}
            <span className="ml-0.5 text-[10px] opacity-60">({city.count})</span>
          </Badge>
        </Link>
      ))}
    </div>
  );
}

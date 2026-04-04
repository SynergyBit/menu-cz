"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingBadge } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";
import {
  UtensilsCrossed,
  MapPin,
  Star,
  CalendarDays,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  cuisineType: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  avgRating: number;
  reviewCount: number;
  hasDailyMenu: boolean;
}

function RestaurantMiniCard({ r }: { r: Restaurant }) {
  return (
    <Link href={`/restaurace/${r.slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg">
        <div className="relative h-32 bg-gradient-to-br from-primary/10 to-warm/10">
          {r.coverUrl ? (
            <img src={r.coverUrl} alt={r.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UtensilsCrossed className="h-10 w-10 text-primary/20" />
            </div>
          )}
          <div className="absolute left-2 top-2">
            <FavoriteButton restaurantId={r.id} size="sm" />
          </div>
        </div>
        <CardContent className="pt-3 pb-4">
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
            {r.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            {r.reviewCount > 0 && (
              <RatingBadge rating={r.avgRating} count={r.reviewCount} />
            )}
            {r.city && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {r.city}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function FeaturedRestaurants() {
  const [data, setData] = useState<{
    topRated: Restaurant[];
    withDailyMenu: Restaurant[];
    newest: Restaurant[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/restaurants/featured")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  const sections = [
    { title: "Nejlépe hodnocené", icon: Star, data: data.topRated, color: "text-yellow-500" },
    { title: "Dnes denní menu", icon: CalendarDays, data: data.withDailyMenu, color: "text-green-600" },
    { title: "Nově přidané", icon: Sparkles, data: data.newest, color: "text-primary" },
  ].filter((s) => s.data.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <section.icon className={`h-5 w-5 ${section.color}`} />
              {section.title}
            </h3>
            <Link href="/restaurace">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Zobrazit vše
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {section.data.map((r) => (
              <RestaurantMiniCard key={r.id} r={r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

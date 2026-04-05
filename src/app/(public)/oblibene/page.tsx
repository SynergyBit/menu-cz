"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/favorite-button";
import { RatingBadge } from "@/components/star-rating";
import {
  Heart,
  UtensilsCrossed,
  MapPin,
  Crown,
  Clock,
  ArrowRight,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  cuisineType: string | null;
  priceRange: number | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isPremium: boolean;
  isOpenNow: boolean;
  avgRating: number;
  reviewCount: number;
}

export default function OblibenePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try server-side favorites first (logged in), fallback to localStorage
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data.favorites && data.favorites.length > 0) {
          // Server-side: already have restaurant data
          setRestaurants(data.favorites.map((f: { restaurant: Restaurant }) => f.restaurant));
          setLoading(false);
        } else if (data.favoriteIds && data.favoriteIds.length > 0) {
          // Server returned empty favorites for logged-in user
          setLoading(false);
        } else {
          // Fallback to localStorage
          const favIds = getFavorites();
          if (favIds.length === 0) {
            setLoading(false);
            return;
          }
          fetch("/api/restaurants")
            .then((r) => r.json())
            .then((rData) => {
              const all = rData.restaurants || [];
              setRestaurants(all.filter((r: Restaurant) => favIds.includes(r.id)));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {
        // Not logged in — use localStorage
        const favIds = getFavorites();
        if (favIds.length === 0) {
          setLoading(false);
          return;
        }
        fetch("/api/restaurants")
          .then((r) => r.json())
          .then((data) => {
            const all = data.restaurants || [];
            setRestaurants(all.filter((r: Restaurant) => favIds.includes(r.id)));
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Heart className="h-7 w-7 text-red-500 fill-red-500" />
          Oblíbené restaurace
        </h1>
        <p className="mt-2 text-muted-foreground">
          Vaše uložené restaurace
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardContent className="pt-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Zatím žádné oblíbené</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Klikněte na srdíčko u restaurace pro přidání do oblíbených
            </p>
            <Link href="/restaurace">
              <Button className="mt-4 gap-2">
                Prohlédnout restaurace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Link key={r.id} href={`/restaurace/${r.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg">
                <div className="relative h-40 bg-gradient-to-br from-primary/10 to-warm/10">
                  {r.coverUrl ? (
                    <img src={r.coverUrl} alt={r.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <UtensilsCrossed className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <FavoriteButton restaurantId={r.id} size="sm" />
                  </div>
                  <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
                    {r.isOpenNow && (
                      <Badge className="gap-1 bg-green-500/90 text-white">
                        <Clock className="h-3 w-3" />
                        Otevřeno
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {r.name}
                      </h3>
                      {r.reviewCount > 0 && (
                        <div className="mt-1">
                          <RatingBadge rating={r.avgRating} count={r.reviewCount} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.city && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {r.city}
                      </Badge>
                    )}
                    {r.cuisineType && (
                      <Badge variant="outline" className="text-xs">{r.cuisineType}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

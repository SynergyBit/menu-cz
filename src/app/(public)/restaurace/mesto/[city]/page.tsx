"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingBadge } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";
import {
  MapPin,
  UtensilsCrossed,
  Crown,
  Clock,
  CalendarDays,
  FileText,
  ArrowLeft,
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
  hasDailyMenu: boolean;
  menuItemCount: number;
  avgRating: number;
  reviewCount: number;
}

const priceLabels: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

export default function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = use(params);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<{ name: string; slug: string; count: number }[]>([]);

  const cityName = decodeURIComponent(citySlug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    // Fetch restaurants for this city
    fetch(`/api/restaurants?q=${encodeURIComponent(cityName)}`)
      .then((r) => r.json())
      .then((data) => {
        // Filter to exact city match
        const filtered = (data.restaurants || []).filter(
          (r: Restaurant) => r.city?.toLowerCase() === cityName.toLowerCase()
        );
        setRestaurants(filtered);
      })
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));

    // Fetch other cities for sidebar
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []))
      .catch(() => {});
  }, [cityName]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/restaurace">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Všechny restaurace
        </Button>
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
        {/* Main content */}
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Restaurace v {cityName}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {!loading && (
                <>
                  {restaurants.length}{" "}
                  {restaurants.length === 1
                    ? "restaurace"
                    : restaurants.length < 5
                    ? "restaurace"
                    : "restaurací"}{" "}
                  v {cityName}
                </>
              )}
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-36 w-full rounded-t-lg" />
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
                <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold">
                  Žádné restaurace v {cityName}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Zatím nemáme registrované restaurace v tomto městě
                </p>
                <Link href="/restaurace">
                  <Button variant="outline" className="mt-4 gap-2">
                    Prohlédnout všechny restaurace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {restaurants.map((r) => (
                <Link key={r.id} href={`/restaurace/${r.slug}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg">
                    <div className="relative h-36 bg-gradient-to-br from-primary/10 to-warm/10">
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
                      <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                        {r.isPremium && (
                          <Badge className="gap-1 bg-yellow-500/90 text-yellow-950 text-xs">
                            <Crown className="h-3 w-3" />
                            Premium
                          </Badge>
                        )}
                        {r.isOpenNow && (
                          <Badge className="gap-1 bg-green-500/90 text-white text-xs">
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
                        {r.priceRange && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {priceLabels[r.priceRange]}
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {r.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {r.cuisineType && (
                          <Badge variant="outline" className="text-xs">{r.cuisineType}</Badge>
                        )}
                        {r.hasDailyMenu && (
                          <Badge variant="outline" className="gap-1 text-xs border-green-500/30 text-green-700 dark:text-green-400">
                            <CalendarDays className="h-3 w-3" />
                            Denní menu
                          </Badge>
                        )}
                        {r.menuItemCount > 0 && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <FileText className="h-3 w-3" />
                            {r.menuItemCount} položek
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — other cities */}
        <aside className="hidden lg:block">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 text-sm font-semibold">Další města</h3>
              <div className="space-y-1">
                {cities
                  .filter((c) => c.slug !== citySlug)
                  .slice(0, 15)
                  .map((c) => (
                    <Link key={c.slug} href={`/restaurace/mesto/${c.slug}`}>
                      <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {c.name}
                        </span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {c.count}
                        </Badge>
                      </div>
                    </Link>
                  ))}
              </div>
              <Link href="/restaurace">
                <Button variant="ghost" size="sm" className="mt-3 w-full text-xs gap-1">
                  Všechny restaurace
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

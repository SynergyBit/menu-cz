"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  UtensilsCrossed,
  Star,
  Crown,
  Clock,
  CalendarDays,
  FileText,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  cuisineType: string | null;
  priceRange: number | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isPremium: boolean;
  menuItemCount: number;
  hasDailyMenu: boolean;
  isOpenNow: boolean;
}

const priceLabels: Record<number, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

export default function RestauracePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-5 w-72" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-40 w-full rounded-t-lg" />
                <CardContent className="pt-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <RestauraceContent />
    </Suspense>
  );
}

function RestauraceContent() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cuisine = searchParams.get("cuisine") || "";
    setQuery(q);

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cuisine) params.set("cuisine", cuisine);

    fetch(`/api/restaurants?${params}`)
      .then((r) => r.json())
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    window.history.pushState({}, "", `/restaurace?${params}`);
    setLoading(true);
    fetch(`/api/restaurants?${params}`)
      .then((r) => r.json())
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Restaurace</h1>
        <p className="mt-2 text-muted-foreground">
          Najděte restauraci a prohlédněte si její menu
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat restauraci..."
            className="h-11 pl-10"
          />
        </div>
        <Button type="submit" className="h-11">
          Hledat
        </Button>
      </form>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
            <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">
              Žádné restaurace nenalezeny
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Zkuste změnit vyhledávací dotaz
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Link key={r.id} href={`/restaurace/${r.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg">
                <div className="relative h-40 bg-gradient-to-br from-primary/10 to-warm/10">
                  {r.coverUrl ? (
                    <img
                      src={r.coverUrl}
                      alt={r.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <UtensilsCrossed className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
                    {r.isPremium && (
                      <Badge className="gap-1 bg-yellow-500/90 text-yellow-950 hover:bg-yellow-500">
                        <Crown className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                    {r.isOpenNow && (
                      <Badge className="gap-1 bg-green-500/90 text-white hover:bg-green-500">
                        <Clock className="h-3 w-3" />
                        Otevřeno
                      </Badge>
                    )}
                  </div>
                  {r.logoUrl && (
                    <div className="absolute -bottom-5 left-4 h-12 w-12 overflow-hidden rounded-xl border-2 border-card bg-card shadow-md">
                      <img src={r.logoUrl} alt="" className="h-full w-full object-contain p-1" />
                    </div>
                  )}
                </div>
                <CardContent className={r.logoUrl ? "pt-8" : "pt-4"}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {r.name}
                    </h3>
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.city && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {r.city}
                      </Badge>
                    )}
                    {r.cuisineType && (
                      <Badge variant="outline" className="text-xs">
                        {r.cuisineType}
                      </Badge>
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
  );
}


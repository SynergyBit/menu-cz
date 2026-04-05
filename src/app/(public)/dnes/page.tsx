"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  MapPin,
  UtensilsCrossed,
  Soup,
  ChefHat,
  CakeSlice,
  Crown,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";

interface DailyMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  type: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
  logoUrl: string | null;
  cuisineType: string | null;
  isPremium: boolean;
}

interface DailyResult {
  restaurant: Restaurant;
  items: DailyMenuItem[];
}

const typeIcons: Record<string, typeof Soup> = {
  soup: Soup,
  main: ChefHat,
  dessert: CakeSlice,
};

const typeLabels: Record<string, string> = {
  soup: "Polévka",
  main: "Hlavní",
  dessert: "Dezert",
};

export default function DnesPage() {
  const [results, setResults] = useState<DailyResult[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  function loadData(city?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set("city", city);

    fetch(`/api/daily-today?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results || []);
        if (!city) setCities(data.cities || []);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  function filterByCity(city: string) {
    setSelectedCity(city);
    loadData(city || undefined);
  }

  const todayStr = new Date().toLocaleDateString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Denní menu dnes</h1>
            <p className="text-muted-foreground capitalize">{todayStr}</p>
          </div>
        </div>
      </div>

      {/* City filter */}
      {cities.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant={selectedCity === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => filterByCity("")}
          >
            Všechna města
          </Badge>
          {cities.sort().map((city) => (
            <Badge
              key={city}
              variant={selectedCity === city ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => filterByCity(city)}
            >
              <MapPin className="mr-1 h-3 w-3" />
              {city}
            </Badge>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="mb-4 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "restaurace" : results.length < 5 ? "restaurace" : "restaurací"} s denním menu
          {selectedCity ? ` v městě ${selectedCity}` : ""}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Žádné denní menu</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedCity
                ? `Dnes zatím žádná restaurace v ${selectedCity} nepřidala denní menu`
                : "Dnes zatím žádná restaurace nepřidala denní menu"}
            </p>
            <Link href="/restaurace">
              <Button variant="outline" className="mt-4 gap-2">
                Prohlédnout restaurace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map(({ restaurant: r, items }) => (
            <Card
              key={r.id}
              className="overflow-hidden transition-all hover:border-primary/20 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/restaurace/${r.slug}`}
                    className="flex items-center gap-3 min-w-0 group"
                  >
                    {r.logoUrl ? (
                      <img
                        src={r.logoUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-contain border p-0.5 shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <UtensilsCrossed className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
                        {r.name}
                        {r.isPremium && (
                          <Crown className="ml-1.5 inline h-3.5 w-3.5 text-yellow-500" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {r.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {r.address ? `${r.address}, ${r.city}` : r.city}
                          </span>
                        )}
                        {r.cuisineType && <span>{r.cuisineType}</span>}
                      </div>
                    </div>
                  </Link>
                  <Link href={`/restaurace/${r.slug}`}>
                    <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs">
                      Menu
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5">
                  {items.map((item, idx) => {
                    const Icon = typeIcons[item.type] || ChefHat;
                    return (
                      <div key={item.id}>
                        {idx > 0 && item.type !== items[idx - 1]?.type && (
                          <Separator className="my-1.5" />
                        )}
                        <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="h-4 w-4 shrink-0 text-primary/60" />
                            <div className="min-w-0">
                              <span className="text-sm font-medium">{item.name}</span>
                              {item.description && (
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                  — {item.description}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-primary">
                            {item.price} Kč
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

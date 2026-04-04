"use client";

import { useState, useEffect, use, lazy, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const RestaurantMap = lazy(() =>
  import("@/components/restaurant-map").then((m) => ({
    default: m.RestaurantMap,
  }))
);
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  UtensilsCrossed,
  Soup,
  ChefHat,
  CakeSlice,
  ArrowLeft,
  Crown,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  cuisineType: string | null;
  priceRange: number | null;
  coverUrl: string | null;
  logoUrl: string | null;
  isPremium: boolean;
  latitude: number | null;
  longitude: number | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  allergens: string | null;
  isAvailable: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface DailyMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  type: string;
}

interface OpeningHour {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}

const dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

const typeIcons: Record<string, typeof Soup> = {
  soup: Soup,
  main: ChefHat,
  dessert: CakeSlice,
};

const typeLabels: Record<string, string> = {
  soup: "Polévka",
  main: "Hlavní jídlo",
  dessert: "Dezert",
};

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<{
    restaurant: Restaurant;
    menu: MenuCategory[];
    dailyMenu: { items: DailyMenuItem[] } | null;
    openingHours: OpeningHour[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/restaurants/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-56 w-full rounded-xl" />
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Restaurace nenalezena</h2>
        <Link href="/restaurace">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na seznam
          </Button>
        </Link>
      </div>
    );
  }

  const { restaurant: r, menu, dailyMenu, openingHours: hours } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/restaurace">
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zpět
        </Button>
      </Link>

      {/* Cover */}
      <div className="relative mb-6 h-48 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-warm/10 sm:h-64">
        {r.coverUrl ? (
          <img
            src={r.coverUrl}
            alt={r.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UtensilsCrossed className="h-16 w-16 text-primary/20" />
          </div>
        )}
        {r.isPremium && (
          <Badge className="absolute right-3 top-3 gap-1 bg-yellow-500/90 text-yellow-950">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{r.name}</h1>
        {r.description && (
          <p className="mt-2 text-muted-foreground">{r.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {r.city && (
            <Badge variant="outline" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {r.address ? `${r.address}, ${r.city}` : r.city}
            </Badge>
          )}
          {r.cuisineType && (
            <Badge variant="outline">{r.cuisineType}</Badge>
          )}
          {r.phone && (
            <Badge variant="outline" className="gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {r.phone}
            </Badge>
          )}
          {r.email && (
            <Badge variant="outline" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {r.email}
            </Badge>
          )}
          {r.website && (
            <a href={r.website} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-accent">
                <Globe className="h-3.5 w-3.5" />
                Web
              </Badge>
            </a>
          )}
        </div>
      </div>

      {/* Map */}
      {r.latitude && r.longitude && (
        <div className="mb-8">
          <Suspense fallback={<Skeleton className="h-[250px] w-full rounded-xl" />}>
            <RestaurantMap
              className="h-[250px] w-full rounded-xl border"
              markers={[
                {
                  lat: r.latitude,
                  lng: r.longitude,
                  name: r.name,
                  slug: r.slug,
                },
              ]}
              singleMarker
              zoom={15}
            />
          </Suspense>
        </div>
      )}

      <Tabs defaultValue={dailyMenu ? "daily" : "menu"}>
        <TabsList>
          {dailyMenu && <TabsTrigger value="daily">Denní menu</TabsTrigger>}
          <TabsTrigger value="menu">Jídelní lístek</TabsTrigger>
          <TabsTrigger value="hours">Otevírací doba</TabsTrigger>
        </TabsList>

        {/* Daily menu */}
        {dailyMenu && (
          <TabsContent value="daily" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Denní menu — {new Date().toLocaleDateString("cs-CZ")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyMenu.items.map((item) => {
                  const Icon = typeIcons[item.type] || ChefHat;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {typeLabels[item.type] || item.type}
                          </span>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 font-semibold text-primary">
                        {item.price} Kč
                      </span>
                    </div>
                  );
                })}
                {dailyMenu.items.length === 0 && (
                  <p className="py-4 text-center text-muted-foreground">
                    Denní menu zatím nebylo přidáno
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Full menu */}
        <TabsContent value="menu" className="mt-6 space-y-6">
          {menu.length === 0 ? (
            <Card className="py-8 text-center">
              <CardContent>
                <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Jídelní lístek zatím nebyl přidán
                </p>
              </CardContent>
            </Card>
          ) : (
            menu.map((cat) => (
              <Card key={cat.id}>
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {cat.items.map((item, idx) => (
                    <div key={item.id}>
                      {idx > 0 && <Separator className="my-2" />}
                      <div className="flex items-start justify-between gap-4 py-2">
                        <div>
                          <p className="font-medium">
                            {item.name}
                            {!item.isAvailable && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Nedostupné
                              </Badge>
                            )}
                          </p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          {item.allergens && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Alergeny: {item.allergens}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 font-semibold text-primary">
                          {item.price} Kč
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Opening hours */}
        <TabsContent value="hours" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Otevírací doba
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hours.length === 0 ? (
                <p className="text-muted-foreground">
                  Otevírací doba nebyla zadána
                </p>
              ) : (
                <div className="space-y-2">
                  {hours.map((h) => (
                    <div
                      key={h.dayOfWeek}
                      className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <span className="font-medium">
                        {dayNames[h.dayOfWeek]}
                      </span>
                      {h.isClosed ? (
                        <span className="text-sm text-muted-foreground">
                          Zavřeno
                        </span>
                      ) : (
                        <span className="text-sm">
                          {h.openTime} — {h.closeTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

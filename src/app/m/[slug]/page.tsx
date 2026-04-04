"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UtensilsCrossed,
  Phone,
  MapPin,
  Clock,
  ChefHat,
  Soup,
  CakeSlice,
  ExternalLink,
  Navigation,
} from "lucide-react";

interface Restaurant {
  name: string;
  slug: string;
  tagline: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  cuisineType: string | null;
  logoUrl: string | null;
  googleMaps: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
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

const dayNamesShort = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

export default function MobilePage({
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

    // Track QR scan
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, viewType: "qr" }),
    }).catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold">Restaurace nenalezena</p>
        </div>
      </div>
    );
  }

  const { restaurant: r, menu, dailyMenu, openingHours: hours } = data;

  // Is open now?
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const isOpen =
    todayHours &&
    !todayHours.isClosed &&
    todayHours.openTime &&
    todayHours.closeTime &&
    currentTime >= todayHours.openTime &&
    currentTime <= todayHours.closeTime;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center gap-3">
          {r.logoUrl ? (
            <img src={r.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain border p-0.5" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{r.name}</h1>
            {r.tagline && (
              <p className="text-xs text-muted-foreground truncate">{r.tagline}</p>
            )}
          </div>
          {isOpen ? (
            <Badge className="bg-green-500 text-white shrink-0 text-xs">Otevřeno</Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0 text-xs">Zavřeno</Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick actions */}
        <div className="flex gap-2">
          {r.phone && (
            <a href={`tel:${r.phone}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Zavolat
              </Button>
            </a>
          )}
          {(r.googleMaps || (r.latitude && r.longitude)) && (
            <a
              href={r.googleMaps || `https://maps.google.com/?q=${r.latitude},${r.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Navigation className="h-3.5 w-3.5" />
                Navigovat
              </Button>
            </a>
          )}
          <Link href={`/restaurace/${r.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Detail
            </Button>
          </Link>
        </div>

        {/* Today's hours */}
        {todayHours && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              Dnes: {todayHours.isClosed ? "Zavřeno" : `${todayHours.openTime} — ${todayHours.closeTime}`}
            </span>
          </div>
        )}

        {/* Daily menu */}
        {dailyMenu && dailyMenu.items.length > 0 && (
          <div>
            <h2 className="mb-3 font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Denní menu
            </h2>
            <div className="space-y-2">
              {dailyMenu.items.map((item) => {
                const Icon = typeIcons[item.type] || ChefHat;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-card border p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 ml-2 font-semibold text-primary text-sm">
                      {item.price} Kč
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full menu */}
        {menu.length > 0 && (
          <div>
            <h2 className="mb-3 font-semibold flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Jídelní lístek
            </h2>
            <div className="space-y-4">
              {menu.map((cat) => (
                <div key={cat.id}>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {cat.name}
                  </h3>
                  <div className="space-y-1">
                    {cat.items.filter((i) => i.isAvailable).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between py-2"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-primary">
                          {item.price} Kč
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info footer */}
        <div className="rounded-lg bg-muted/30 p-4 text-center space-y-2">
          {r.address && r.city && (
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {r.address}, {r.city}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="font-semibold text-primary hover:underline">
              MenuCZ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

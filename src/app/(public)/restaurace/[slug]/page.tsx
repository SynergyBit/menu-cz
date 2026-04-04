"use client";

import { useState, useEffect, use, lazy, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  Camera,
  Link2,
  Music,
  Wifi,
  Car,
  TreePine,
  CalendarCheck,
  ShoppingBag,
  Truck,
  Star,
  Share2,
  ExternalLink,
} from "lucide-react";

const RestaurantMap = lazy(() =>
  import("@/components/restaurant-map").then((m) => ({
    default: m.RestaurantMap,
  }))
);

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
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
  plan: string;
  latitude: number | null;
  longitude: number | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  googleMaps: string | null;
  specialties: string | null;
  acceptsReservations: boolean;
  hasDelivery: boolean;
  hasTakeaway: boolean;
  hasParking: boolean;
  hasWifi: boolean;
  hasOutdoorSeating: boolean;
  hasLiveMusic: boolean;
  themeColor: string | null;
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

const amenityIcons = [
  { key: "acceptsReservations", icon: CalendarCheck, label: "Rezervace" },
  { key: "hasDelivery", icon: Truck, label: "Rozvoz" },
  { key: "hasTakeaway", icon: ShoppingBag, label: "S sebou" },
  { key: "hasParking", icon: Car, label: "Parkování" },
  { key: "hasWifi", icon: Wifi, label: "WiFi" },
  { key: "hasOutdoorSeating", icon: TreePine, label: "Zahrádka" },
  { key: "hasLiveMusic", icon: Music, label: "Živá hudba" },
];

const priceLabels: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

function isOpenNow(hours: OpeningHour[]): boolean {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
  if (!todayHours || todayHours.isClosed || !todayHours.openTime || !todayHours.closeTime) return false;
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
}

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
  const open = isOpenNow(hours);
  const specialties: string[] = r.specialties ? JSON.parse(r.specialties) : [];
  const activeAmenities = amenityIcons.filter(
    (a) => r[a.key as keyof Restaurant]
  );
  const hasPaidPlan = r.plan === "standard" || r.plan === "premium";
  const hasSocial = r.facebook || r.instagram || r.tiktok;

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: r.name,
        text: r.tagline || `${r.name} — jídelní lístek a menu`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/restaurace">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Sdílet
        </Button>
      </div>

      {/* ===== VIZITKA HEADER ===== */}
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        {/* Cover */}
        <div className="relative h-52 sm:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-warm/20">
          {r.coverUrl ? (
            <img src={r.coverUrl} alt={r.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <UtensilsCrossed className="h-20 w-20 text-primary/15" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute right-4 top-4 flex gap-2">
            {r.isPremium && (
              <Badge className="gap-1 bg-yellow-500/90 text-yellow-950 shadow-lg">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
            {open && (
              <Badge className="gap-1 bg-green-500 text-white shadow-lg">
                <Clock className="h-3 w-3" />
                Otevřeno
              </Badge>
            )}
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-4">
              {r.logoUrl && (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white shadow-lg sm:h-20 sm:w-20">
                  <img src={r.logoUrl} alt="" className="h-full w-full object-contain p-1.5" />
                </div>
              )}
              <div className="text-white">
                <h1 className="text-2xl font-bold drop-shadow-lg sm:text-3xl">{r.name}</h1>
                {r.tagline && (
                  <p className="mt-1 text-sm text-white/80 drop-shadow">{r.tagline}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== INFO BAR ===== */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {r.cuisineType && <Badge variant="outline">{r.cuisineType}</Badge>}
        {r.priceRange && (
          <Badge variant="outline" className="font-mono">
            {priceLabels[r.priceRange]}
          </Badge>
        )}
        {r.city && (
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3 w-3" />
            {r.address ? `${r.address}, ${r.city}` : r.city}
          </Badge>
        )}
      </div>

      {/* Description */}
      {r.description && hasPaidPlan && (
        <p className="mb-6 text-muted-foreground leading-relaxed">{r.description}</p>
      )}

      {/* ===== CONTACT + SOCIAL + AMENITIES ===== */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {/* Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {r.phone && (
              <a href={`tel:${r.phone}`} className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {r.phone}
              </a>
            )}
            {r.email && (
              <a href={`mailto:${r.email}`} className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {r.email}
              </a>
            )}
            {r.website && (
              <a href={r.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Webové stránky
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {r.googleMaps && hasPaidPlan && (
              <a href={r.googleMaps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {/* Social links */}
            {hasSocial && hasPaidPlan && (
              <>
                <Separator className="my-2" />
                <div className="flex gap-2">
                  {r.facebook && (
                    <a href={r.facebook} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {r.instagram && (
                    <a href={r.instagram} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {r.tiktok && (
                    <a href={r.tiktok} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Music className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Amenities + Specialties */}
        <div className="space-y-4">
          {activeAmenities.length > 0 && hasPaidPlan && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Služby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {activeAmenities.map((a) => (
                    <Badge key={a.key} variant="secondary" className="gap-1.5 px-3 py-1.5">
                      <a.icon className="h-3.5 w-3.5" />
                      {a.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {specialties.length > 0 && hasPaidPlan && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Speciality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((s: string) => (
                    <Badge key={s} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ===== MAP ===== */}
      {r.latitude && r.longitude && hasPaidPlan && (
        <div className="mb-8">
          <Suspense fallback={<Skeleton className="h-[220px] w-full rounded-xl" />}>
            <RestaurantMap
              className="h-[220px] w-full rounded-xl border"
              markers={[{ lat: r.latitude, lng: r.longitude, name: r.name, slug: r.slug }]}
              singleMarker
              zoom={15}
            />
          </Suspense>
        </div>
      )}

      {/* ===== TABS: MENU / DAILY / HOURS ===== */}
      <Tabs defaultValue={dailyMenu ? "daily" : "menu"}>
        <TabsList>
          {dailyMenu && hasPaidPlan && (
            <TabsTrigger value="daily">Denní menu</TabsTrigger>
          )}
          <TabsTrigger value="menu">Jídelní lístek</TabsTrigger>
          <TabsTrigger value="hours">Otevírací doba</TabsTrigger>
        </TabsList>

        {/* Daily menu */}
        {dailyMenu && hasPaidPlan && (
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
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 font-semibold text-primary">{item.price} Kč</span>
                    </div>
                  );
                })}
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
                <p className="text-muted-foreground">Jídelní lístek zatím nebyl přidán</p>
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
                              <Badge variant="secondary" className="ml-2 text-xs">Nedostupné</Badge>
                            )}
                          </p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          {item.allergens && hasPaidPlan && (
                            <p className="mt-1 text-xs text-muted-foreground">Alergeny: {item.allergens}</p>
                          )}
                        </div>
                        <span className="shrink-0 font-semibold text-primary">{item.price} Kč</span>
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
                <p className="text-muted-foreground">Otevírací doba nebyla zadána</p>
              ) : (
                <div className="space-y-2">
                  {hours.map((h) => {
                    const isToday = (new Date().getDay() + 6) % 7 === h.dayOfWeek;
                    return (
                      <div
                        key={h.dayOfWeek}
                        className={`flex items-center justify-between rounded-lg p-2.5 transition-colors ${
                          isToday ? "bg-primary/5 font-medium" : "hover:bg-muted/50"
                        }`}
                      >
                        <span className={isToday ? "text-primary" : ""}>
                          {dayNames[h.dayOfWeek]}
                          {isToday && <span className="ml-2 text-xs">(dnes)</span>}
                        </span>
                        {h.isClosed ? (
                          <span className="text-sm text-muted-foreground">Zavřeno</span>
                        ) : (
                          <span className="text-sm">{h.openTime} — {h.closeTime}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

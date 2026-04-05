"use client";

import { useState, useEffect, Suspense, lazy } from "react";
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
  List,
  Map,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// Select removed — using visual chip filters instead
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RatingBadge } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";

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
  latitude: number | null;
  longitude: number | null;
  avgRating: number;
  reviewCount: number;
  acceptsReservations: boolean;
  hasDelivery: boolean;
  hasTakeaway: boolean;
  hasParking: boolean;
  hasWifi: boolean;
  hasOutdoorSeating: boolean;
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

const cuisineOptions = [
  { label: "Česká", emoji: "🇨🇿" },
  { label: "Italská", emoji: "🇮🇹" },
  { label: "Asijská", emoji: "🥢" },
  { label: "Mexická", emoji: "🇲🇽" },
  { label: "Indická", emoji: "🇮🇳" },
  { label: "Francouzská", emoji: "🇫🇷" },
  { label: "Ukrajinská", emoji: "🇺🇦" },
  { label: "Řecká", emoji: "🇬🇷" },
  { label: "Turecká", emoji: "🇹🇷" },
  { label: "Thajská", emoji: "🇹🇭" },
  { label: "Japonská", emoji: "🇯🇵" },
  { label: "Korejská", emoji: "🇰🇷" },
  { label: "Vietnamská", emoji: "🇻🇳" },
  { label: "Americká", emoji: "🇺🇸" },
  { label: "Mezinárodní", emoji: "🌍" },
  { label: "Fast food", emoji: "🍔" },
  { label: "Kavárna", emoji: "☕" },
  { label: "Cukrárna", emoji: "🍰" },
];

const dietaryOptions = [
  { label: "Vegetariánská", emoji: "🥬" },
  { label: "Veganská", emoji: "🌱" },
  { label: "Bezlepková", emoji: "🌾" },
  { label: "Bezlaktózová", emoji: "🥛" },
  { label: "Keto", emoji: "🥑" },
  { label: "Pescatariánská", emoji: "🐟" },
];

const amenityFilters = [
  { key: "hasDelivery", label: "Rozvoz", emoji: "🚗" },
  { key: "hasTakeaway", label: "S sebou", emoji: "📦" },
  { key: "acceptsReservations", label: "Rezervace", emoji: "📞" },
  { key: "hasOutdoorSeating", label: "Zahrádka", emoji: "☀️" },
  { key: "hasWifi", label: "WiFi", emoji: "📶" },
  { key: "hasParking", label: "Parkování", emoji: "🅿️" },
];

function RestauraceContent() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [view, setView] = useState<"list" | "map">("list");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filters
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");
  const [dietary, setDietary] = useState("");
  const [city, setCity] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyDailyMenu, setOnlyDailyMenu] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  function toggleAmenity(key: string) {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function buildParams() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (cuisine) params.set("cuisine", cuisine);
    if (dietary) params.set("cuisine", dietary); // dietary uses same field
    if (city) params.set("city", city);
    if (priceRange) params.set("price", priceRange);
    if (onlyOpen) params.set("open", "1");
    if (onlyDailyMenu) params.set("daily", "1");
    return params;
  }

  function fetchRestaurants(params: URLSearchParams) {
    setLoading(true);
    fetch(`/api/restaurants?${params}`)
      .then((r) => r.json())
      .then((data) => setRestaurants(data.restaurants || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const c = searchParams.get("cuisine") || "";
    setQuery(q);
    setCuisine(c);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (c) params.set("cuisine", c);
    fetchRestaurants(params);
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = buildParams();
    window.history.pushState({}, "", `/restaurace?${params}`);
    fetchRestaurants(params);
  }

  function applyFilters() {
    const params = buildParams();
    window.history.pushState({}, "", `/restaurace?${params}`);
    fetchRestaurants(params);
    setFilterOpen(false);
  }

  function clearFilters() {
    setCuisine("");
    setDietary("");
    setCity("");
    setPriceRange("");
    setOnlyOpen(false);
    setOnlyDailyMenu(false);
    setSelectedAmenities([]);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    window.history.pushState({}, "", `/restaurace?${params}`);
    fetchRestaurants(params);
    setFilterOpen(false);
  }

  const activeFilterCount = [cuisine, dietary, city, priceRange, onlyOpen, onlyDailyMenu, ...selectedAmenities].filter(Boolean).length;

  // Client-side filtering
  let filtered = restaurants;
  if (onlyOpen) filtered = filtered.filter((r) => r.isOpenNow);
  if (onlyDailyMenu) filtered = filtered.filter((r) => r.hasDailyMenu);
  if (priceRange) filtered = filtered.filter((r) => r.priceRange === Number(priceRange));
  // Amenity filtering (client-side since we have the data)
  for (const amenity of selectedAmenities) {
    filtered = filtered.filter((r) => (r as unknown as Record<string, unknown>)[amenity]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Restaurace</h1>
        <p className="mt-2 text-muted-foreground">
          {!loading && filtered.length > 0
            ? `${filtered.length} ${filtered.length === 1 ? "restaurace" : filtered.length < 5 ? "restaurace" : "restaurací"}`
            : "Najděte restauraci a prohlédněte si její menu"}
        </p>
      </div>

      {/* Search + View toggle + Filter */}
      <div className="mb-6 flex gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
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
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger render={<Button variant="outline" className="h-11 gap-2 shrink-0" />}>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtry</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-[340px] sm:w-[380px] overflow-y-auto">
            <div className="flex flex-col h-full pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filtry</h3>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-xs text-destructive hover:text-destructive">
                    <X className="h-3 w-3" />
                    Vymazat vše ({activeFilterCount})
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pb-4">
                {/* Quick toggles */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOnlyOpen(!onlyOpen)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                      onlyOpen
                        ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                        : "border-border hover:border-green-500/50"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Otevřeno teď
                  </button>
                  <button
                    onClick={() => setOnlyDailyMenu(!onlyDailyMenu)}
                    className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                      onlyDailyMenu
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <CalendarDays className="h-4 w-4" />
                    Denní menu
                  </button>
                </div>

                <Separator />

                {/* Cuisine type */}
                <div>
                  <Label className="mb-2.5 block text-sm font-semibold">Typ kuchyně</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {cuisineOptions.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setCuisine(cuisine === c.label.toLowerCase() ? "" : c.label.toLowerCase())}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          cuisine === c.label.toLowerCase()
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        <span>{c.emoji}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Dietary */}
                <div>
                  <Label className="mb-2.5 block text-sm font-semibold">Stravování</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {dietaryOptions.map((d) => (
                      <button
                        key={d.label}
                        onClick={() => setDietary(dietary === d.label.toLowerCase() ? "" : d.label.toLowerCase())}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          dietary === d.label.toLowerCase()
                            ? "bg-green-600 text-white shadow-sm"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        <span>{d.emoji}</span>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price range */}
                <div>
                  <Label className="mb-2.5 block text-sm font-semibold">Cenová úroveň</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "1", label: "$", desc: "Levné" },
                      { value: "2", label: "$$", desc: "Střední" },
                      { value: "3", label: "$$$", desc: "Dražší" },
                      { value: "4", label: "$$$$", desc: "Luxus" },
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPriceRange(priceRange === p.value ? "" : p.value)}
                        className={`flex flex-col items-center rounded-xl border-2 py-2.5 text-sm transition-all ${
                          priceRange === p.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="font-bold">{p.label}</span>
                        <span className="text-[10px] text-muted-foreground">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <Label className="mb-2.5 block text-sm font-semibold">Služby</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenityFilters.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => toggleAmenity(a.key)}
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-medium transition-all ${
                          selectedAmenities.includes(a.key)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-sm">{a.emoji}</span>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* City */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Město</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Např. Praha, Brno..."
                    className="h-10"
                  />
                </div>
              </div>

              {/* Bottom action */}
              <div className="pt-4 border-t space-y-2">
                <Button onClick={applyFilters} className="w-full h-11 text-sm font-semibold">
                  Zobrazit výsledky
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden sm:flex rounded-lg border">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-11 w-11 rounded-r-none"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "map" ? "secondary" : "ghost"}
            size="icon"
            className="h-11 w-11 rounded-l-none"
            onClick={() => setView("map")}
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtry:</span>
          {cuisine && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              {cuisineOptions.find((c) => c.label.toLowerCase() === cuisine)?.emoji} {cuisine}
              <button onClick={() => { setCuisine(""); applyFilters(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dietary && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5 bg-green-500/10 text-green-700 dark:text-green-400">
              {dietaryOptions.find((d) => d.label.toLowerCase() === dietary)?.emoji} {dietary}
              <button onClick={() => { setDietary(""); applyFilters(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priceRange && (
            <Badge variant="secondary" className="gap-1 pr-1.5">
              {"$".repeat(Number(priceRange))}
              <button onClick={() => { setPriceRange(""); applyFilters(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {city && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              <MapPin className="h-3 w-3" />{city}
              <button onClick={() => { setCity(""); applyFilters(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {onlyOpen && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5 bg-green-500/10 text-green-700 dark:text-green-400">
              <Clock className="h-3 w-3" />Otevřeno
              <button onClick={() => { setOnlyOpen(false); applyFilters(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {onlyDailyMenu && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              <CalendarDays className="h-3 w-3" />Denní menu
              <button onClick={() => { setOnlyDailyMenu(false); applyFilters(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedAmenities.map((key) => {
            const amenity = amenityFilters.find((a) => a.key === key);
            return amenity ? (
              <Badge key={key} variant="secondary" className="gap-1.5 pr-1.5">
                {amenity.emoji} {amenity.label}
                <button onClick={() => { toggleAmenity(key); applyFilters(); }} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Map view */}
      {view === "map" && !loading && filtered.length > 0 && (
        <div className="mb-6">
          <Suspense fallback={<Skeleton className="h-[450px] w-full rounded-xl" />}>
            <RestaurantMap
              className="h-[450px] w-full rounded-xl border"
              markers={filtered
                .filter((r) => r.latitude && r.longitude)
                .map((r) => ({
                  lat: r.latitude!,
                  lng: r.longitude!,
                  name: r.name,
                  slug: r.slug,
                  cuisineType: r.cuisineType,
                  isOpenNow: r.isOpenNow,
                }))}
            />
          </Suspense>
          {filtered.filter((r) => !r.latitude || !r.longitude).length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {filtered.filter((r) => !r.latitude || !r.longitude).length} restaurací bez zadané adresy se nezobrazuje na mapě
            </p>
          )}
        </div>
      )}

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
      ) : filtered.length === 0 ? (
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
          {filtered.map((r) => (
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
                  <div className="absolute left-3 top-3">
                    <FavoriteButton restaurantId={r.id} size="sm" />
                  </div>
                  {r.logoUrl && (
                    <div className="absolute -bottom-5 left-4 h-12 w-12 overflow-hidden rounded-xl border-2 border-card bg-card shadow-md">
                      <img src={r.logoUrl} alt="" className="h-full w-full object-contain p-1" />
                    </div>
                  )}
                </div>
                <CardContent className={r.logoUrl ? "pt-8" : "pt-4"}>
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


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

const cuisineOptions = ["Česká", "Italská", "Asijská", "Mexická", "Indická", "Francouzská", "Vegetariánská", "Veganská", "Mezinárodní", "Fast food", "Kavárna"];

function RestauraceContent() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [view, setView] = useState<"list" | "map">("list");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filters
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");
  const [city, setCity] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyDailyMenu, setOnlyDailyMenu] = useState(false);

  function buildParams() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (cuisine) params.set("cuisine", cuisine);
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
    setCity("");
    setPriceRange("");
    setOnlyOpen(false);
    setOnlyDailyMenu(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    window.history.pushState({}, "", `/restaurace?${params}`);
    fetchRestaurants(params);
    setFilterOpen(false);
  }

  const activeFilterCount = [cuisine, city, priceRange, onlyOpen, onlyDailyMenu].filter(Boolean).length;

  // Client-side filtering for open/daily (API already returns the data)
  let filtered = restaurants;
  if (onlyOpen) filtered = filtered.filter((r) => r.isOpenNow);
  if (onlyDailyMenu) filtered = filtered.filter((r) => r.hasDailyMenu);
  if (priceRange) filtered = filtered.filter((r) => r.priceRange === Number(priceRange));

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
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filtry</h3>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-xs">
                    <X className="h-3 w-3" />
                    Vymazat
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label>Typ kuchyně</Label>
                  <Select value={cuisine} onValueChange={(v) => setCuisine(v || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Všechny kuchyně" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisineOptions.map((c) => (
                        <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Město</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Např. Praha"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cenová úroveň</Label>
                  <Select value={priceRange} onValueChange={(v) => setPriceRange(v || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Jakákoliv" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">$ — Levné</SelectItem>
                      <SelectItem value="2">$$ — Střední</SelectItem>
                      <SelectItem value="3">$$$ — Dražší</SelectItem>
                      <SelectItem value="4">$$$$ — Luxusní</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="onlyOpen" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    Otevřeno teď
                  </Label>
                  <Switch id="onlyOpen" checked={onlyOpen} onCheckedChange={setOnlyOpen} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="onlyDaily" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Má denní menu
                  </Label>
                  <Switch id="onlyDaily" checked={onlyDailyMenu} onCheckedChange={setOnlyDailyMenu} />
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button onClick={applyFilters} className="w-full">
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
        <div className="mb-4 flex flex-wrap gap-2">
          {cuisine && (
            <Badge variant="secondary" className="gap-1.5">
              {cuisine}
              <button onClick={() => { setCuisine(""); applyFilters(); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {city && (
            <Badge variant="secondary" className="gap-1.5">
              <MapPin className="h-3 w-3" />{city}
              <button onClick={() => { setCity(""); applyFilters(); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {onlyOpen && (
            <Badge variant="secondary" className="gap-1.5">
              <Clock className="h-3 w-3" />Otevřeno
              <button onClick={() => { setOnlyOpen(false); applyFilters(); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {onlyDailyMenu && (
            <Badge variant="secondary" className="gap-1.5">
              <CalendarDays className="h-3 w-3" />Denní menu
              <button onClick={() => { setOnlyDailyMenu(false); applyFilters(); }}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
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


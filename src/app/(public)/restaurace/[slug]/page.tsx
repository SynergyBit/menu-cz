"use client";

import { useState, useEffect, use, lazy, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating, RatingBadge } from "@/components/star-rating";
import { AllergenBadges, DietaryFilterChips } from "@/components/allergen-badge";
import { addRecentRestaurant } from "@/lib/recent-restaurants";
import { parseAllergens, dietaryFilters } from "@/lib/allergens";
import { getEventType } from "@/lib/event-types";
import { FavoriteButton } from "@/components/favorite-button";
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
  Loader2,
  CalendarDays,
  Sparkles,
  Beer,
} from "lucide-react";
import { toast } from "sonner";

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
    photos: { id: string; url: string; caption: string | null }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [reviewsData, setReviewsData] = useState<{
    reviews: { id: string; authorName: string; rating: number; comment: string | null; createdAt: string }[];
    avgRating: number;
    totalReviews: number;
  }>({ reviews: [], avgRating: 0, totalReviews: 0 });
  const [reviewForm, setReviewForm] = useState({ authorName: "", rating: 0, comment: "" });
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<string[]>([]);
  const [reservationSettings, setReservationSettings] = useState<{
    available: boolean; minHoursAhead: number; maxDaysAhead: number;
    maxPartySize: number; slotMinutes: number; notes: string | null;
  } | null>(null);
  const [activeHappyHour, setActiveHappyHour] = useState<{ title: string; discount: string | null; startTime: string; endTime: string; isActiveNow: boolean; minutesRemaining: number | null } | null>(null);
  const [restaurantEvents, setRestaurantEvents] = useState<{ id: string; title: string; eventDate: string; eventTime: string | null; eventType: string }[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<{ date: string; dayName: string; items: { id: string; name: string; description: string | null; price: string; type: string }[] }[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d);
        if (d?.restaurant) {
          addRecentRestaurant({
            id: d.restaurant.id,
            name: d.restaurant.name,
            slug: d.restaurant.slug,
            city: d.restaurant.city,
            cuisineType: d.restaurant.cuisineType,
            logoUrl: d.restaurant.logoUrl,
          });
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, viewType: "page" }),
    }).catch(() => {});

    fetch(`/api/restaurants/${slug}/reviews`)
      .then((res) => res.json())
      .then(setReviewsData)
      .catch(() => {});

    fetch(`/api/restaurants/${slug}/reserve`)
      .then((res) => res.json())
      .then((data) => { if (data.available) setReservationSettings(data); })
      .catch(() => {});

    fetch(`/api/happy-hours`)
      .then((res) => res.json())
      .then((data) => {
        const mine = (data.happyHours || []).find(
          (hh: { restaurant: { slug: string } | null }) => hh.restaurant?.slug === slug
        );
        if (mine) setActiveHappyHour(mine);
      })
      .catch(() => {});

    fetch(`/api/events?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const restaurantEvts = (data.events || []).filter(
          (e: { restaurant: { slug: string } | null }) => e.restaurant?.slug === slug
        );
        setRestaurantEvents(restaurantEvts);
      })
      .catch(() => {});

    fetch(`/api/restaurants/${slug}/weekly`)
      .then((res) => res.json())
      .then((wData) => setWeeklyMenu(wData.week || []))
      .catch(() => {});

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((meData) => {
        if (meData?.user) {
          setIsLoggedIn(true);
          setReviewForm((f) => ({ ...f, authorName: meData.user.name }));
        }
      })
      .catch(() => {});
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

  const { restaurant: r, menu, dailyMenu, openingHours: hours, photos: photoList } = data;
  const open = isOpenNow(hours);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.authorName || reviewForm.rating === 0) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/restaurants/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setReviewForm({ authorName: "", rating: 0, comment: "" });
        // Reload reviews
        const data = await fetch(`/api/restaurants/${slug}/reviews`).then((r) => r.json());
        setReviewsData(data);
      }
    } catch {} finally {
      setSubmittingReview(false);
    }
  }
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
        <div className="flex items-center gap-2">
          <FavoriteButton restaurantId={r.id} />
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Sdílet
          </Button>
        </div>
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
        <RatingBadge rating={reviewsData.avgRating} count={reviewsData.totalReviews} />
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

      {/* ===== HAPPY HOUR BANNER ===== */}
      {activeHappyHour && activeHappyHour.isActiveNow && (
        <Card className="mb-6 border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-yellow-500/10 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
          <CardContent className="flex items-center gap-4 pt-4 pb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-yellow-950">
              <Beer className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-yellow-700 dark:text-yellow-400">{activeHappyHour.title}</h3>
                {activeHappyHour.discount && (
                  <Badge className="bg-yellow-500 text-yellow-950 text-xs">{activeHappyHour.discount}</Badge>
                )}
                <Badge className="bg-green-500 text-white text-xs animate-pulse">Právě probíhá</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeHappyHour.startTime} — {activeHappyHour.endTime}
                {activeHappyHour.minutesRemaining && (
                  <span className="ml-1 font-medium text-yellow-600">
                    (zbývá {activeHappyHour.minutesRemaining} min)
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
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

      {/* ===== RESERVATION WIDGET ===== */}
      {reservationSettings && reservationSettings.available && (
        <ReservationWidget slug={r.slug} settings={reservationSettings} />
      )}

      {/* ===== CONTACT FORM ===== */}
      {hasPaidPlan && r.acceptsReservations && (
        <ContactForm slug={r.slug} />
      )}

      {/* ===== EVENTS ===== */}
      {restaurantEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Nadcházející akce
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {restaurantEvents.slice(0, 4).map((event) => {
              const type = getEventType(event.eventType);
              const date = new Date(event.eventDate);
              return (
                <Card key={event.id} className="transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-3 pt-3 pb-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10">
                      <span className="text-[9px] font-medium text-muted-foreground uppercase">
                        {date.toLocaleDateString("cs-CZ", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold text-primary">{date.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5 py-0">
                          {type.emoji} {type.label}
                        </Badge>
                        {event.eventTime && (
                          <span className="text-[10px] text-muted-foreground">{event.eventTime}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== PHOTO GALLERY ===== */}
      {photoList && photoList.length > 0 && hasPaidPlan && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Fotogalerie</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photoList.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightboxPhoto(photo.url)}
                className="group relative aspect-square overflow-hidden rounded-xl"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Fotka"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Fotka"
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===== TABS: MENU / DAILY / HOURS ===== */}
      <Tabs defaultValue={dailyMenu ? "daily" : "menu"}>
        <TabsList>
          {dailyMenu && hasPaidPlan && (
            <TabsTrigger value="daily">Denní menu</TabsTrigger>
          )}
          <TabsTrigger value="menu">Jídelní lístek</TabsTrigger>
          <TabsTrigger value="weekly">Týdenní menu</TabsTrigger>
          <TabsTrigger value="hours">Otevírací doba</TabsTrigger>
          <TabsTrigger value="reviews">
            Recenze{reviewsData.totalReviews > 0 ? ` (${reviewsData.totalReviews})` : ""}
          </TabsTrigger>
        </TabsList>

        {/* Daily menu */}
        {dailyMenu && hasPaidPlan && (
          <TabsContent value="daily" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Denní menu — {new Date().toLocaleDateString("cs-CZ")}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    const items = dailyMenu!.items
                      .map((i) => `${i.name} — ${i.price} Kč`)
                      .join("\n");
                    const text = `🍽️ ${r.name} — Denní menu ${new Date().toLocaleDateString("cs-CZ")}\n\n${items}\n\n${window.location.href}`;
                    if (navigator.share) {
                      navigator.share({ title: `${r.name} — Denní menu`, text });
                    } else {
                      navigator.clipboard.writeText(text);
                      toast.success("Denní menu zkopírováno");
                    }
                  }}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Sdílet
                </Button>
              </div>
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
          {/* Dietary filter */}
          {menu.length > 0 && hasPaidPlan && (
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground shrink-0">Filtrovat alergeny:</span>
                  <DietaryFilterChips
                    activeFilters={activeDietaryFilters}
                    onToggle={(key) =>
                      setActiveDietaryFilters((prev) =>
                        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                      )
                    }
                  />
                  {activeDietaryFilters.length > 0 && (
                    <button
                      onClick={() => setActiveDietaryFilters([])}
                      className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                    >
                      Zrušit
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {menu.length === 0 ? (
            <Card className="py-8 text-center">
              <CardContent>
                <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-muted-foreground">Jídelní lístek zatím nebyl přidán</p>
              </CardContent>
            </Card>
          ) : (
            menu.map((cat) => {
              // Filter items by dietary preferences
              const excludeAllergens = activeDietaryFilters.flatMap(
                (key) => dietaryFilters[key]?.excludeAllergens || []
              );
              const filteredItems = excludeAllergens.length > 0
                ? cat.items.filter((item) => {
                    const itemAllergens = parseAllergens(item.allergens);
                    return !excludeAllergens.some((a) => itemAllergens.includes(a));
                  })
                : cat.items;

              if (filteredItems.length === 0 && excludeAllergens.length > 0) return null;

              return (
              <Card key={cat.id}>
                <CardHeader>
                  <CardTitle>
                    {cat.name}
                    {excludeAllergens.length > 0 && filteredItems.length !== cat.items.length && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({filteredItems.length} z {cat.items.length})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {filteredItems.map((item, idx) => (
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
                            <AllergenBadges allergenStr={item.allergens} />
                          )}
                        </div>
                        <span className="shrink-0 font-semibold text-primary">{item.price} Kč</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              );
            })
          )}
        </TabsContent>

        {/* Opening hours */}
        {/* Weekly menu */}
        <TabsContent value="weekly" className="mt-6">
          {weeklyMenu.length === 0 ? (
            <Card className="py-8 text-center">
              <CardContent>
                <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground">Týdenní menu nebylo naplánováno</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {weeklyMenu.map((day) => {
                const isToday = day.date === new Date().toISOString().split("T")[0];
                return (
                  <Card key={day.date} className={isToday ? "border-primary/30 bg-primary/[0.02]" : ""}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
                          {day.dayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}
                        </span>
                        {isToday && <Badge className="text-[10px] px-1.5 py-0">dnes</Badge>}
                      </div>
                      <div className="space-y-1">
                        {day.items.map((item) => {
                          const Icon = typeIcons[item.type] || ChefHat;
                          return (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-primary/50" />
                                <span>{item.name}</span>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground">— {item.description}</span>
                                )}
                              </div>
                              <span className="font-semibold text-primary shrink-0 ml-2">{item.price} Kč</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

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
        {/* Reviews */}
        <TabsContent value="reviews" className="mt-6 space-y-6">
          {/* Write review */}
          {!reviewSubmitted ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Napsat recenzi</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hodnocení</Label>
                    <StarRating
                      rating={reviewForm.rating}
                      interactive
                      onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-name">Vaše jméno</Label>
                    <Input
                      id="review-name"
                      value={reviewForm.authorName}
                      onChange={(e) => setReviewForm((f) => ({ ...f, authorName: e.target.value }))}
                      placeholder="Jan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-comment">Komentář (volitelné)</Label>
                    <Textarea
                      id="review-comment"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                      placeholder="Jak se vám líbilo?"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingReview || reviewForm.rating === 0 || !reviewForm.authorName}
                  >
                    Odeslat recenzi
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="py-6 text-center">
                <p className="font-semibold text-green-700 dark:text-green-400">
                  Děkujeme za vaši recenzi!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reviews list */}
          {reviewsData.reviews.length === 0 ? (
            <Card className="py-8 text-center">
              <CardContent>
                <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground">Zatím žádné recenze. Buďte první!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviewsData.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{review.authorName}</span>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("cs-CZ")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReservationWidget({ slug, settings }: {
  slug: string;
  settings: { maxPartySize: number; slotMinutes: number; maxDaysAhead: number; minHoursAhead: number; notes: string | null };
}) {
  const [form, setForm] = useState({ guestName: "", guestPhone: "", guestEmail: "", date: "", time: "", partySize: "2", note: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Generate time slots
  const slots: string[] = [];
  for (let h = 10; h < 23; h++) {
    for (let m = 0; m < 60; m += (settings.slotMinutes || 30)) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  // Date limits
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + (settings.minHoursAhead || 2));
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (settings.maxDaysAhead || 30));
  const minDateStr = minDate.toISOString().split("T")[0];
  const maxDateStr = maxDate.toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.guestName || !form.guestPhone || !form.date || !form.time) {
      setError("Vyplňte jméno, telefon, datum a čas");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/restaurants/${slug}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSent(true); }
      else { const d = await res.json(); setError(d.error || "Chyba"); }
    } catch { setError("Chyba připojení"); }
    finally { setSending(false); }
  }

  if (sent) {
    return (
      <Card className="mb-8 border-green-500/20 bg-green-500/5">
        <CardContent className="py-8 text-center">
          <CalendarCheck className="mx-auto mb-3 h-8 w-8 text-green-600" />
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Rezervace odeslána!</h3>
          <p className="mt-2 text-sm text-muted-foreground">Restaurace vám brzy potvrdí vaši rezervaci.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-primary/20 bg-primary/[0.02]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Rezervovat stůl
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {settings.notes && <p className="text-xs text-muted-foreground italic">{settings.notes}</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Datum *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={minDateStr} max={maxDateStr} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Čas *</Label>
              <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm" required>
                <option value="">Vyberte čas</option>
                {slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Počet osob *</Label>
              <select value={form.partySize} onChange={(e) => setForm({ ...form, partySize: e.target.value })} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm">
                {Array.from({ length: settings.maxPartySize || 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "osoba" : n < 5 ? "osoby" : "osob"}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Jméno *</Label>
              <Input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="Jan Novák" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefon *</Label>
              <Input value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} placeholder="+420..." required />
            </div>
          </div>

          <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Poznámka (volitelné)" />

          <Button type="submit" className="w-full gap-2" disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
            Rezervovat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ContactForm({ slug }: { slug: string }) {
  const [form, setForm] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    subject: "reservation",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`/api/restaurants/${slug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      }
    } catch {} finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <Card className="mb-8 border-green-500/20 bg-green-500/5">
        <CardContent className="py-6 text-center">
          <CalendarCheck className="mx-auto mb-2 h-6 w-6 text-green-600" />
          <p className="font-semibold text-green-700 dark:text-green-400">
            Zpráva odeslána!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Restaurace vám brzy odpoví.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Napište nám
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Vaše jméno *"
              value={form.senderName}
              onChange={(e) => setForm((f) => ({ ...f, senderName: e.target.value }))}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.senderEmail}
              onChange={(e) => setForm((f) => ({ ...f, senderEmail: e.target.value }))}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Telefon"
              value={form.senderPhone}
              onChange={(e) => setForm((f) => ({ ...f, senderPhone: e.target.value }))}
            />
            <select
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="reservation">Rezervace</option>
              <option value="question">Dotaz</option>
              <option value="feedback">Zpětná vazba</option>
            </select>
          </div>
          <Textarea
            placeholder="Vaše zpráva *"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            rows={3}
            required
          />
          <Button type="submit" disabled={sending} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Odeslat zprávu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

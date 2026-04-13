"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventType } from "@/lib/event-types";
import {
  Newspaper,
  UtensilsCrossed,
  Sparkles,
  Beer,
  Star,
  CalendarDays,
  MapPin,
  Filter,
  Clock,
  ArrowRight,
  MessageSquare,
  ChefHat,
  Soup,
  CakeSlice,
} from "lucide-react";

interface FeedItem {
  id: string;
  type: "new_restaurant" | "event" | "happy_hour" | "review" | "daily_menu";
  timestamp: string;
  restaurant: {
    name: string;
    slug: string;
    city: string | null;
    logoUrl: string | null;
    cuisineType: string | null;
  };
  data: Record<string, unknown>;
}

const typeConfig: Record<string, { label: string; icon: typeof Star; color: string; bgColor: string }> = {
  new_restaurant: { label: "Nová restaurace", icon: UtensilsCrossed, color: "text-primary", bgColor: "bg-primary/10" },
  event: { label: "Akce", icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-500/10" },
  happy_hour: { label: "Happy Hour", icon: Beer, color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  review: { label: "Recenze", icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-500/10" },
  daily_menu: { label: "Denní menu", icon: CalendarDays, color: "text-green-600", bgColor: "bg-green-500/10" },
};

const filterTypes = [
  { value: "", label: "Vše" },
  { value: "new_restaurant", label: "Nové restaurace", emoji: "🍽️" },
  { value: "event", label: "Akce", emoji: "✨" },
  { value: "happy_hour", label: "Happy Hours", emoji: "🍻" },
  { value: "review", label: "Recenze", emoji: "⭐" },
  { value: "daily_menu", label: "Denní menu", emoji: "📅" },
];

const typeIcons: Record<string, typeof Soup> = { soup: Soup, main: ChefHat, dessert: CakeSlice };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "právě teď";
  if (mins < 60) return `před ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `před ${days} dny`;
  return new Date(dateStr).toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
}

export default function NovinkyPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    params.set("limit", "40");

    fetch(`/api/feed?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setFeed(data.feed || []);
        if (!selectedCity) setCities(data.cities || []);
      })
      .catch(() => setFeed([]))
      .finally(() => setLoading(false));
  }, [selectedCity]);

  const filtered = selectedType ? feed.filter((f) => f.type === selectedType) : feed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Newspaper className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Novinky</h1>
            <p className="text-muted-foreground">Co je nového v restauracích</p>
          </div>
        </div>
      </div>

      {/* Type filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {filterTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => setSelectedType(selectedType === t.value ? "" : t.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              selectedType === t.value || (!selectedType && !t.value)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {t.emoji ? `${t.emoji} ` : ""}{t.label}
          </button>
        ))}
      </div>

      {/* City filter */}
      {cities.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <button
            onClick={() => setSelectedCity("")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              !selectedCity ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            Vše
          </button>
          {cities.sort().map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(selectedCity === city ? "" : city)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                selectedCity === city ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Žádné novinky</h3>
            <p className="mt-2 text-sm text-muted-foreground">Zkuste změnit filtry</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border hidden sm:block" />

          <div className="space-y-4">
            {filtered.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;

              return (
                <div key={item.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  {/* Card */}
                  <Card className="flex-1 transition-all hover:shadow-md">
                    <CardContent className="pt-3 pb-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{config.label}</Badge>
                            <span className="text-[11px] text-muted-foreground">{timeAgo(item.timestamp)}</span>
                          </div>

                          {/* Content by type */}
                          <div className="mt-1.5">
                            {item.type === "new_restaurant" && (
                              <p className="text-sm">
                                <span className="font-semibold">{item.restaurant.name}</span> se přidala na Gastroo
                                {item.data.cuisineType ? ` — ${item.data.cuisineType} kuchyně` : ""}
                              </p>
                            )}

                            {item.type === "event" && (
                              <div>
                                <p className="text-sm font-semibold">{item.data.title as string}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {getEventType(item.data.eventType as string).emoji}{" "}
                                  {new Date(item.data.eventDate as string).toLocaleDateString("cs-CZ", { weekday: "short", day: "numeric", month: "short" })}
                                  {item.data.eventTime ? ` v ${item.data.eventTime}` : ""}
                                </p>
                                {item.data.description ? (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.data.description as string}</p>
                                ) : null}
                              </div>
                            )}

                            {item.type === "happy_hour" && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold">{item.data.title as string}</p>
                                {item.data.discount ? (
                                  <Badge className="bg-yellow-500/90 text-yellow-950 text-[10px]">{item.data.discount as string}</Badge>
                                ) : null}
                                <span className="text-xs text-muted-foreground">
                                  {item.data.startTime as string} — {item.data.endTime as string}
                                </span>
                              </div>
                            )}

                            {item.type === "review" && (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold">{item.data.authorName as string}</span>
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < (item.data.rating as number) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {item.data.comment ? (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 italic">
                                    &ldquo;{item.data.comment as string}&rdquo;
                                  </p>
                                ) : null}
                              </div>
                            )}

                            {item.type === "daily_menu" && (
                              <div>
                                <p className="text-sm font-semibold">Dnešní denní menu ({item.data.itemCount as number} položek)</p>
                                <div className="mt-1 space-y-0.5">
                                  {(item.data.items as { name: string; price: string; type: string }[])?.map((mi, idx) => {
                                    const MIcon = typeIcons[mi.type] || ChefHat;
                                    return (
                                      <div key={idx} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                          <MIcon className="h-3 w-3" />
                                          {mi.name}
                                        </span>
                                        <span className="font-medium text-primary">{mi.price} Kč</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Restaurant link */}
                      <Link
                        href={`/restaurace/${item.restaurant.slug}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        {item.restaurant.logoUrl ? (
                          <img src={item.restaurant.logoUrl} alt="" className="h-4 w-4 rounded object-contain" />
                        ) : (
                          <UtensilsCrossed className="h-3 w-3" />
                        )}
                        {item.restaurant.name}
                        {item.restaurant.city && (
                          <span className="text-muted-foreground">· {item.restaurant.city}</span>
                        )}
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

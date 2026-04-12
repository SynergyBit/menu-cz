"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Beer,
  Clock,
  MapPin,
  UtensilsCrossed,
  Percent,
  Timer,
  Filter,
  X,
  Zap,
} from "lucide-react";

const dayLabels = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

interface HappyHour {
  id: string;
  title: string;
  description: string | null;
  discount: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: string;
  isActiveToday: boolean;
  isActiveNow: boolean;
  minutesRemaining: number | null;
  minutesUntilStart: number | null;
  restaurant: {
    name: string;
    slug: string;
    city: string | null;
    logoUrl: string | null;
    address: string | null;
  } | null;
}

export default function HappyHoursPage() {
  const [items, setItems] = useState<HappyHour[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);

    fetch(`/api/happy-hours?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.happyHours || []);
        if (!selectedCity) setCities(data.cities || []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedCity]);

  // Auto-refresh every minute for live countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      const params = new URLSearchParams();
      if (selectedCity) params.set("city", selectedCity);
      fetch(`/api/happy-hours?${params}`)
        .then((r) => r.json())
        .then((data) => setItems(data.happyHours || []))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  const activeNow = items.filter((i) => i.isActiveNow);
  const upcomingToday = items.filter((i) => i.isActiveToday && !i.isActiveNow && i.minutesUntilStart !== null);
  const rest = items.filter((i) => !i.isActiveNow && !(i.isActiveToday && i.minutesUntilStart !== null));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
            <Beer className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Happy Hours</h1>
            <p className="text-muted-foreground">Akční nabídky a slevy v restauracích</p>
          </div>
        </div>
      </div>

      {/* City filter */}
      {cities.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setSelectedCity("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              !selectedCity ? "bg-yellow-500 text-yellow-950" : "bg-muted hover:bg-muted/80"
            }`}
          >
            Všechna města
          </button>
          {cities.sort().map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(selectedCity === city ? "" : city)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedCity === city ? "bg-yellow-500 text-yellow-950" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Beer className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Žádné happy hours</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Zatím žádná restaurace nemá aktivní happy hour
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active NOW */}
          {activeNow.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-yellow-600">Právě probíhá</h2>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="space-y-3">
                {activeNow.map((hh) => (
                  <HappyHourCard key={hh.id} hh={hh} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming today */}
          {upcomingToday.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dnes brzy</h2>
              <div className="space-y-3">
                {upcomingToday.map((hh) => (
                  <HappyHourCard key={hh.id} hh={hh} />
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Všechny nabídky</h2>
              <div className="space-y-3">
                {rest.map((hh) => (
                  <HappyHourCard key={hh.id} hh={hh} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HappyHourCard({ hh }: { hh: HappyHour }) {
  const days = hh.daysOfWeek.split(",").map(Number);

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${
      hh.isActiveNow ? "border-yellow-500/40 bg-yellow-500/[0.03]" : ""
    }`}>
      {hh.isActiveNow && (
        <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
      )}
      <CardContent className="flex items-start gap-4 pt-4 pb-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
          hh.isActiveNow ? "bg-yellow-500 text-yellow-950" : "bg-yellow-500/10"
        }`}>
          <Beer className={`h-7 w-7 ${hh.isActiveNow ? "" : "text-yellow-600"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{hh.title}</h3>
            {hh.discount && (
              <Badge className="bg-yellow-500/90 text-yellow-950 text-xs gap-1">
                <Percent className="h-3 w-3" />
                {hh.discount}
              </Badge>
            )}
            {hh.isActiveNow && (
              <Badge className="bg-green-500 text-white text-xs gap-1 animate-pulse">
                <Zap className="h-3 w-3" />
                Právě teď
              </Badge>
            )}
            {hh.minutesUntilStart !== null && (
              <Badge variant="outline" className="text-xs gap-1">
                <Timer className="h-3 w-3" />
                Za {hh.minutesUntilStart} min
              </Badge>
            )}
          </div>

          {hh.description && (
            <p className="mt-1 text-sm text-muted-foreground">{hh.description}</p>
          )}

          <div className="mt-2 flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {hh.startTime} — {hh.endTime}
              {hh.minutesRemaining !== null && (
                <span className="ml-1 font-medium text-yellow-600">
                  (zbývá {hh.minutesRemaining} min)
                </span>
              )}
            </span>
            <div className="flex gap-0.5">
              {dayLabels.map((d, i) => (
                <span
                  key={i}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-medium ${
                    days.includes(i)
                      ? "bg-yellow-500/20 text-yellow-700"
                      : "bg-muted/50 text-muted-foreground/30"
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {hh.restaurant && (
            <Link
              href={`/restaurace/${hh.restaurant.slug}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              {hh.restaurant.logoUrl ? (
                <img src={hh.restaurant.logoUrl} alt="" className="h-4 w-4 rounded object-contain" />
              ) : (
                <UtensilsCrossed className="h-3 w-3" />
              )}
              {hh.restaurant.name}
              {hh.restaurant.city && (
                <span className="text-muted-foreground">· {hh.restaurant.city}</span>
              )}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

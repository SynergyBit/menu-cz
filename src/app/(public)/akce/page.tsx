"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { eventTypes, getEventType } from "@/lib/event-types";
import {
  Calendar,
  Clock,
  MapPin,
  UtensilsCrossed,
  Sparkles,
  Filter,
  X,
  ArrowRight,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  endTime: string | null;
  eventType: string;
  restaurant: {
    name: string;
    slug: string;
    city: string | null;
    logoUrl: string | null;
  } | null;
}

export default function AkcePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (selectedType) params.set("type", selectedType);

    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events || []);
        if (!selectedCity && !selectedType) setCities(data.cities || []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [selectedCity, selectedType]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Akce a události</h1>
            <p className="text-muted-foreground">Nadcházející akce v restauracích</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Type filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setSelectedType("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              !selectedType ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            Vše
          </button>
          {eventTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(selectedType === t.value ? "" : t.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                selectedType === t.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* City filter */}
        {cities.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setSelectedCity("")}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                !selectedCity ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              Všechna města
            </button>
            {cities.sort().map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(selectedCity === city ? "" : city)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCity === city ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active filters */}
      {(selectedCity || selectedType) && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtry:</span>
          {selectedType && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              {getEventType(selectedType).emoji} {getEventType(selectedType).label}
              <button onClick={() => setSelectedType("")} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCity && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              <MapPin className="h-3 w-3" />{selectedCity}
              <button onClick={() => setSelectedCity("")} className="ml-0.5 rounded-full p-0.5 hover:bg-destructive/20">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      <p className="mb-4 text-sm text-muted-foreground">
        {loading ? "Načítání..." : `${events.length} ${events.length === 1 ? "akce" : events.length < 5 ? "akce" : "akcí"}`}
      </p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Žádné nadcházející akce</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Zkuste změnit filtry nebo se podívejte později
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const type = getEventType(event.eventType);
            const date = new Date(event.eventDate);
            const isToday = date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];

            return (
              <Card key={event.id} className="overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
                <CardContent className="flex items-start gap-4 pt-5 pb-5">
                  {/* Date box */}
                  <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl ${
                    isToday ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  }`}>
                    <span className={`text-[10px] font-medium uppercase ${isToday ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {date.toLocaleDateString("cs-CZ", { month: "short" })}
                    </span>
                    <span className={`text-2xl font-bold ${isToday ? "" : "text-primary"}`}>
                      {date.getDate()}
                    </span>
                    <span className={`text-[10px] ${isToday ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {date.toLocaleDateString("cs-CZ", { weekday: "short" })}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <Badge variant="outline" className="text-xs gap-1">
                        {type.emoji} {type.label}
                      </Badge>
                      {isToday && <Badge className="bg-green-500 text-white text-xs">Dnes</Badge>}
                    </div>

                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    )}

                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                      {event.eventTime && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {event.eventTime}{event.endTime ? ` — ${event.endTime}` : ""}
                        </span>
                      )}
                      {event.restaurant && (
                        <Link
                          href={`/restaurace/${event.restaurant.slug}`}
                          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          {event.restaurant.logoUrl ? (
                            <img src={event.restaurant.logoUrl} alt="" className="h-4 w-4 rounded object-contain" />
                          ) : (
                            <UtensilsCrossed className="h-3 w-3" />
                          )}
                          {event.restaurant.name}
                          {event.restaurant.city && (
                            <span className="text-muted-foreground">· {event.restaurant.city}</span>
                          )}
                        </Link>
                      )}
                    </div>
                  </div>

                  {event.restaurant && (
                    <Link href={`/restaurace/${event.restaurant.slug}`} className="shrink-0 hidden sm:block">
                      <Button variant="ghost" size="sm" className="gap-1 text-xs">
                        Detail
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

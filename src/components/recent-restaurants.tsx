"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentRestaurants, type RecentRestaurant } from "@/lib/recent-restaurants";
import { UtensilsCrossed, MapPin, Clock, History } from "lucide-react";

function timeAgo(timestamp: number): string {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return "Právě teď";
  if (mins < 60) return `Před ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Před ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Před ${days}d`;
}

export function RecentRestaurants() {
  const [items, setItems] = useState<RecentRestaurant[]>([]);

  useEffect(() => {
    setItems(getRecentRestaurants());
  }, []);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Naposledy zobrazené</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {items.map((r) => (
          <Link key={r.id} href={`/restaurace/${r.slug}`} className="shrink-0">
            <Card className="w-44 group transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2.5 mb-2">
                  {r.logoUrl ? (
                    <img src={r.logoUrl} alt="" className="h-8 w-8 rounded-lg object-contain border p-0.5 shrink-0" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UtensilsCrossed className="h-4 w-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{r.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {r.city && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" />
                      {r.city}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgo(r.visitedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

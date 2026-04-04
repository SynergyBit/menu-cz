"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UtensilsCrossed,
  FileText,
  CalendarDays,
  Clock,
  Eye,
  ExternalLink,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isPremium: boolean;
  city: string | null;
  cuisineType: string | null;
}

export default function DashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.restaurant) setRestaurant(data.restaurant);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {restaurant?.name || "Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Správa vaší restaurace
          </p>
        </div>
        {restaurant && (
          <div className="flex items-center gap-2">
            <Badge variant={restaurant.isActive ? "default" : "secondary"}>
              {restaurant.isActive ? "Aktivní" : "Neaktivní"}
            </Badge>
            {restaurant.isActive && (
              <Link href={`/restaurace/${restaurant.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Zobrazit
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/profil">
          <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Profil restaurace</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Upravte název, popis, adresu a kontakt
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/menu">
          <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Jídelní lístek</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Spravujte kategorie a položky menu
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/denni-menu">
          <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <CalendarDays className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Denní menu</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Přidejte dnešní polední nabídku
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/hodiny">
          <Card className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Clock className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-base">Otevírací doba</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Nastavte otevírací hodiny
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

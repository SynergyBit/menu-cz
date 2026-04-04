"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  UtensilsCrossed,
  FileText,
  CalendarDays,
  Clock,
  QrCode,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  MapPin,
  Phone,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isPremium: boolean;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  cuisineType: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
}

interface Stats {
  menuCategories: number;
  menuItems: number;
  hasDailyMenu: boolean;
  hasHours: boolean;
}

function completeness(restaurant: Restaurant): { percent: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [!!restaurant.name, "Název"],
    [!!restaurant.description, "Popis"],
    [!!restaurant.address, "Adresa"],
    [!!restaurant.city, "Město"],
    [!!restaurant.phone, "Telefon"],
    [!!restaurant.email, "Email"],
    [!!restaurant.cuisineType, "Typ kuchyně"],
    [!!restaurant.logoUrl, "Logo"],
    [!!restaurant.coverUrl, "Úvodní fotka"],
  ];
  const done = checks.filter(([v]) => v).length;
  const missing = checks.filter(([v]) => !v).map(([, label]) => label);
  return { percent: Math.round((done / checks.length) * 100), missing };
}

export default function DashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/restaurants/me/menu").then((r) => r.json()),
      fetch("/api/restaurants/me/daily-menu").then((r) => r.json()),
      fetch("/api/restaurants/me/hours").then((r) => r.json()),
    ])
      .then(([meData, menuData, dailyData, hoursData]) => {
        if (meData?.restaurant) setRestaurant(meData.restaurant);
        const categories = menuData?.categories || [];
        setStats({
          menuCategories: categories.length,
          menuItems: categories.reduce(
            (sum: number, c: { items: unknown[] }) => sum + c.items.length,
            0
          ),
          hasDailyMenu: !!dailyData?.dailyMenu,
          hasHours: (hoursData?.hours || []).length > 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/restaurants/me/qr?format=png")
      .then((r) => r.blob())
      .then((blob) => setQrUrl(URL.createObjectURL(blob)))
      .catch(() => {});
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

  const profile = restaurant ? completeness(restaurant) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats row */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.menuItems}</p>
                <p className="text-xs text-muted-foreground">
                  Položek v menu ({stats.menuCategories} kategorií)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  stats.hasDailyMenu
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {stats.hasDailyMenu ? "Dnešní menu zadáno" : "Chybí denní menu"}
                </p>
                <p className="text-xs text-muted-foreground">Denní menu</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  stats.hasHours
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {stats.hasHours ? "Nastaveno" : "Nenastaveno"}
                </p>
                <p className="text-xs text-muted-foreground">Otevírací doba</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  (profile?.percent || 0) >= 80
                    ? "bg-green-500/10 text-green-600"
                    : "bg-yellow-500/10 text-yellow-600"
                }`}
              >
                {(profile?.percent || 0) >= 80 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.percent}%</p>
                <p className="text-xs text-muted-foreground">Profil kompletní</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile completeness warning */}
      {profile && profile.missing.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Doplňte profil restaurace</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Chybí: {profile.missing.join(", ")}
              </p>
              <Link href="/dashboard/profil">
                <Button variant="outline" size="sm" className="mt-3">
                  Doplnit profil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions + QR */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/dashboard/profil">
            <Card className="group h-full cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Profil restaurace</p>
                  <p className="text-sm text-muted-foreground">
                    Název, popis, adresa, fotky
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/menu">
            <Card className="group h-full cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Jídelní lístek</p>
                  <p className="text-sm text-muted-foreground">
                    Kategorie a položky menu
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/denni-menu">
            <Card className="group h-full cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Denní menu</p>
                  <p className="text-sm text-muted-foreground">
                    Dnešní polední nabídka
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/hodiny">
            <Card className="group h-full cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Otevírací doba</p>
                  <p className="text-sm text-muted-foreground">
                    Hodiny pro každý den
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* QR mini card */}
        <Card className="w-full lg:w-56">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4 text-primary" />
              QR kód
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            {qrUrl ? (
              <div className="rounded-xl border bg-white p-3">
                <img
                  src={qrUrl}
                  alt="QR kód"
                  className="h-36 w-36"
                />
              </div>
            ) : (
              <Skeleton className="h-36 w-36" />
            )}
            <Link href="/dashboard/qr-kod" className="w-full">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <QrCode className="h-3.5 w-3.5" />
                Stáhnout QR kód
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

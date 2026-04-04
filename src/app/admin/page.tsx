"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UtensilsCrossed,
  FileText,
  CalendarDays,
  CheckCircle2,
  Crown,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface Stats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  totalMenuItems: number;
  recentRegistrations: number;
  todayMenus: number;
  planBreakdown: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/restaurace">
          <Button variant="outline" size="sm" className="gap-1.5">
            Správa restaurací
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalRestaurants}</p>
              <p className="text-xs text-muted-foreground">Celkem restaurací</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeRestaurants}</p>
              <p className="text-xs text-muted-foreground">Aktivních</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Uživatelů</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalMenuItems}</p>
              <p className="text-xs text-muted-foreground">Položek v menu</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.recentRegistrations}</p>
              <p className="text-xs text-muted-foreground">Nových za 7 dní</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.todayMenus}</p>
              <p className="text-xs text-muted-foreground">Dnešních denních menu</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Plány
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-lg font-bold">{stats.planBreakdown.free || 0}</p>
                <p className="text-xs text-muted-foreground">Free</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{stats.planBreakdown.standard || 0}</p>
                <p className="text-xs text-muted-foreground">Standard</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-500">{stats.planBreakdown.premium || 0}</p>
                <p className="text-xs text-muted-foreground">Premium</p>
              </div>
            </div>
            {/* Simple bar */}
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
              {stats.totalRestaurants > 0 && (
                <>
                  <div
                    className="bg-muted-foreground/30"
                    style={{ width: `${((stats.planBreakdown.free || 0) / stats.totalRestaurants) * 100}%` }}
                  />
                  <div
                    className="bg-primary"
                    style={{ width: `${((stats.planBreakdown.standard || 0) / stats.totalRestaurants) * 100}%` }}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${((stats.planBreakdown.premium || 0) / stats.totalRestaurants) * 100}%` }}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

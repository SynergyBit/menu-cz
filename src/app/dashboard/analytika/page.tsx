"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import {
  Eye,
  QrCode,
  FileText,
  CalendarDays,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface Analytics {
  totalViews: number;
  weekViews: number;
  monthViews: number;
  byType: Record<string, number>;
  daily: { date: string; count: number }[];
}

export default function AnalytikaPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/restaurants/me/analytics").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([analytics, me]) => {
        setData(analytics);
        setPlan(me.restaurant?.plan || "free");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytika</h1>
          <p className="text-sm text-muted-foreground">
            Statistiky návštěvnosti vaší restaurace
          </p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Statistiky návštěvnosti" requiredPlan="premium" currentPlan={plan}>
        {data && (
          <>
            {/* Main stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.totalViews}</p>
                    <p className="text-xs text-muted-foreground">Celkem zobrazení</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.weekViews}</p>
                    <p className="text-xs text-muted-foreground">Za 7 dní</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.monthViews}</p>
                    <p className="text-xs text-muted-foreground">Za 30 dní</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.byType.qr || 0}</p>
                    <p className="text-xs text-muted-foreground">QR skenů</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* By type breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Typ zobrazení</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { key: "page", label: "Profil", icon: Eye },
                    { key: "qr", label: "QR sken", icon: QrCode },
                    { key: "menu", label: "Jídelní lístek", icon: FileText },
                    { key: "daily_menu", label: "Denní menu", icon: CalendarDays },
                  ].map((t) => (
                    <div
                      key={t.key}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <t.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-bold">{data.byType[t.key] || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily chart (simple bar) */}
            {data.daily.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Posledních 7 dní</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-40">
                    {data.daily.map((d) => {
                      const max = Math.max(...data.daily.map((x) => x.count), 1);
                      const height = (d.count / max) * 100;
                      return (
                        <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-xs font-medium">{d.count}</span>
                          <div
                            className="w-full rounded-t-md bg-primary transition-all"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(d.date).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </PremiumGate>
    </div>
  );
}

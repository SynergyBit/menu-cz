"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2, Check, Clock } from "lucide-react";

const dayNames = [
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
  "Neděle",
];

interface HourEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export default function HoursPage() {
  const [hours, setHours] = useState<HourEntry[]>(
    dayNames.map((_, i) => ({
      dayOfWeek: i,
      openTime: "11:00",
      closeTime: "22:00",
      isClosed: false,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/restaurants/me/hours")
      .then((r) => r.json())
      .then((data) => {
        if (data.hours && data.hours.length > 0) {
          setHours(
            dayNames.map((_, i) => {
              const existing = data.hours.find(
                (h: HourEntry) => h.dayOfWeek === i
              );
              return (
                existing || {
                  dayOfWeek: i,
                  openTime: "11:00",
                  closeTime: "22:00",
                  isClosed: false,
                }
              );
            })
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/restaurants/me/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateHour(day: number, field: keyof HourEntry, value: string | boolean) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === day ? { ...h, [field]: value } : h))
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Otevírací doba</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Nastavení otevírací doby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hours.map((h) => (
            <div
              key={h.dayOfWeek}
              className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <span className="w-20 shrink-0 font-medium text-sm">
                {dayNames[h.dayOfWeek]}
              </span>
              <div className="flex items-center gap-2">
                <Label htmlFor={`closed-${h.dayOfWeek}`} className="text-xs text-muted-foreground">
                  Otevřeno
                </Label>
                <Switch
                  id={`closed-${h.dayOfWeek}`}
                  checked={!h.isClosed}
                  onCheckedChange={(v) =>
                    updateHour(h.dayOfWeek, "isClosed", !v)
                  }
                />
              </div>
              {!h.isClosed ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={h.openTime}
                    onChange={(e) =>
                      updateHour(h.dayOfWeek, "openTime", e.target.value)
                    }
                    className="w-28"
                  />
                  <span className="text-muted-foreground">—</span>
                  <Input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) =>
                      updateHour(h.dayOfWeek, "closeTime", e.target.value)
                    }
                    className="w-28"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Zavřeno</span>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Uloženo" : "Uložit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

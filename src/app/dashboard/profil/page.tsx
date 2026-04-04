"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2, Check } from "lucide-react";

const cuisineOptions = [
  "Česká",
  "Italská",
  "Asijská",
  "Mexická",
  "Indická",
  "Francouzská",
  "Vegetariánská",
  "Veganská",
  "Mezinárodní",
  "Fast food",
  "Kavárna",
  "Cukrárna",
];

export default function ProfilPage() {
  const [restaurant, setRestaurant] = useState<Record<string, string | number | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.restaurant) setRestaurant(data.restaurant);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/restaurants/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurant),
      });
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data.restaurant);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profil restaurace</h1>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Základní informace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Název restaurace</Label>
              <Input
                id="name"
                value={(restaurant.name as string) || ""}
                onChange={(e) =>
                  setRestaurant((r) => ({ ...r, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Popis</Label>
              <Textarea
                id="description"
                value={(restaurant.description as string) || ""}
                onChange={(e) =>
                  setRestaurant((r) => ({ ...r, description: e.target.value }))
                }
                rows={3}
                placeholder="Pár slov o vaší restauraci..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Adresa</Label>
                <Input
                  id="address"
                  value={(restaurant.address as string) || ""}
                  onChange={(e) =>
                    setRestaurant((r) => ({ ...r, address: e.target.value }))
                  }
                  placeholder="Hlavní 123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Město</Label>
                <Input
                  id="city"
                  value={(restaurant.city as string) || ""}
                  onChange={(e) =>
                    setRestaurant((r) => ({ ...r, city: e.target.value }))
                  }
                  placeholder="Praha"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={(restaurant.phone as string) || ""}
                  onChange={(e) =>
                    setRestaurant((r) => ({ ...r, phone: e.target.value }))
                  }
                  placeholder="+420 123 456 789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={(restaurant.email as string) || ""}
                  onChange={(e) =>
                    setRestaurant((r) => ({ ...r, email: e.target.value }))
                  }
                  placeholder="info@restaurace.cz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Web</Label>
              <Input
                id="website"
                value={(restaurant.website as string) || ""}
                onChange={(e) =>
                  setRestaurant((r) => ({ ...r, website: e.target.value }))
                }
                placeholder="https://www.restaurace.cz"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Typ kuchyně</Label>
                <Select
                  value={(restaurant.cuisineType as string) || ""}
                  onValueChange={(v) =>
                    setRestaurant((r) => ({ ...r, cuisineType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cenová úroveň</Label>
                <Select
                  value={String(restaurant.priceRange || 2)}
                  onValueChange={(v) =>
                    setRestaurant((r) => ({ ...r, priceRange: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">$ — Levné</SelectItem>
                    <SelectItem value="2">$$ — Střední</SelectItem>
                    <SelectItem value="3">$$$ — Dražší</SelectItem>
                    <SelectItem value="4">$$$$ — Luxusní</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saved ? "Uloženo" : "Uložit změny"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

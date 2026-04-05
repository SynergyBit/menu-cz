"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import {
  Save,
  Loader2,
  Check,
  Palette,
  Camera,
  Link2,
  Music,
  MapPin,
  CalendarCheck,
  Truck,
  ShoppingBag,
  Car,
  Wifi,
  TreePine,
  Star,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";

const amenities = [
  { key: "acceptsReservations", icon: CalendarCheck, label: "Rezervace" },
  { key: "hasDelivery", icon: Truck, label: "Rozvoz" },
  { key: "hasTakeaway", icon: ShoppingBag, label: "S sebou" },
  { key: "hasParking", icon: Car, label: "Parkování" },
  { key: "hasWifi", icon: Wifi, label: "WiFi" },
  { key: "hasOutdoorSeating", icon: TreePine, label: "Zahrádka" },
  { key: "hasLiveMusic", icon: Music, label: "Živá hudba" },
];

export default function VizitkaPage() {
  const [restaurant, setRestaurant] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          if (data.restaurant.specialties) {
            try {
              setSpecialties(JSON.parse(data.restaurant.specialties));
            } catch { setSpecialties([]); }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!restaurant) return;
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/restaurants/me/vizitka", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagline: restaurant.tagline,
          facebook: restaurant.facebook,
          instagram: restaurant.instagram,
          tiktok: restaurant.tiktok,
          googleMaps: restaurant.googleMaps,
          specialties,
          acceptsReservations: restaurant.acceptsReservations,
          hasDelivery: restaurant.hasDelivery,
          hasTakeaway: restaurant.hasTakeaway,
          hasParking: restaurant.hasParking,
          hasWifi: restaurant.hasWifi,
          hasOutdoorSeating: restaurant.hasOutdoorSeating,
          hasLiveMusic: restaurant.hasLiveMusic,
          themeColor: restaurant.themeColor,
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("Vizitka uložena");
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error("Chyba při ukládání");
      }
    } catch {
      toast.error("Chyba připojení");
    } finally {
      setSaving(false);
    }
  }

  function addSpecialty() {
    const s = newSpecialty.trim();
    if (s && !specialties.includes(s)) {
      setSpecialties([...specialties, s]);
      setNewSpecialty("");
    }
  }

  function removeSpecialty(s: string) {
    setSpecialties(specialties.filter((x) => x !== s));
  }

  function update(key: string, value: unknown) {
    setRestaurant((r) => (r ? { ...r, [key]: value } : r));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const plan = (restaurant?.plan as string) || "free";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vizitka restaurace</h1>
          <p className="text-sm text-muted-foreground">
            Nastavte, jak se vaše restaurace zobrazí veřejnosti
          </p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      {restaurant?.isActive ? (
        <a
          href={`/restaurace/${restaurant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Náhled vizitky
          </Button>
        </a>
      ) : null}

      <PremiumGate feature="Rozšířená vizitka" requiredPlan="standard" currentPlan={plan}>
        {/* Tagline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Slogan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagline">Krátký slogan restaurace</Label>
              <Input
                id="tagline"
                value={(restaurant?.tagline as string) || ""}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Tradiční česká kuchyně od roku 1995"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">Zobrazí se pod názvem na vizitce</p>
            </div>
          </CardContent>
        </Card>

        {/* Social links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Sociální sítě
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link2 className="h-4 w-4" /> Facebook
              </Label>
              <Input
                value={(restaurant?.facebook as string) || ""}
                onChange={(e) => update("facebook", e.target.value)}
                placeholder="https://facebook.com/vaserestaurace"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" /> Instagram
              </Label>
              <Input
                value={(restaurant?.instagram as string) || ""}
                onChange={(e) => update("instagram", e.target.value)}
                placeholder="https://instagram.com/vaserestaurace"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Music className="h-4 w-4" /> TikTok
              </Label>
              <Input
                value={(restaurant?.tiktok as string) || ""}
                onChange={(e) => update("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@vaserestaurace"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Google Maps odkaz
              </Label>
              <Input
                value={(restaurant?.googleMaps as string) || ""}
                onChange={(e) => update("googleMaps", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Speciality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Např. Domácí těstoviny"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
              />
              <Button variant="outline" onClick={addSpecialty} className="shrink-0 gap-1.5">
                <Plus className="h-4 w-4" />
                Přidat
              </Button>
            </div>
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1.5 pr-1.5">
                    {s}
                    <button
                      onClick={() => removeSpecialty(s)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Služby a vybavení</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {amenities.map((a) => (
                <div key={a.key} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2.5">
                    <a.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{a.label}</span>
                  </div>
                  <Switch
                    checked={!!(restaurant?.[a.key])}
                    onCheckedChange={(v) => update(a.key, v)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? "Uloženo" : "Uložit vizitku"}
          </Button>
        </div>
      </PremiumGate>
    </div>
  );
}

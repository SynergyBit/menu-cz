"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/star-rating";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/favorite-button";
import {
  User,
  Heart,
  Star,
  Settings,
  MapPin,
  UtensilsCrossed,
  LogOut,
  Save,
  Loader2,
  Check,
  Clock,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FavoriteRestaurant {
  id: string;
  restaurantId: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    cuisineType: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
  };
}

interface UserReview {
  id: string;
  restaurantId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Preferences {
  dietaryPreferences: string[];
  favoritesCuisines: string[];
  defaultCity: string;
}

const dietaryOptions = [
  "Vegetarián",
  "Vegan",
  "Bezlepkové",
  "Bezlaktózové",
  "Pescatarián",
  "Keto",
  "Low-carb",
];

const cuisineOptions = [
  "Česká",
  "Italská",
  "Asijská",
  "Mexická",
  "Indická",
  "Francouzská",
  "Vegetariánská",
  "Mezinárodní",
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({
    dietaryPreferences: [],
    favoritesCuisines: [],
    defaultCity: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/favorites").then((r) => r.json()),
      fetch("/api/user/preferences").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([meData, favsData, prefsData]) => {
        if (!meData?.user) {
          router.push("/prihlaseni");
          return;
        }
        setUser(meData.user);
        setFavorites(favsData.favorites || []);
        if (prefsData?.preferences) {
          setPrefs({
            dietaryPreferences: prefsData.preferences.dietaryPreferences || [],
            favoritesCuisines: prefsData.preferences.favoritesCuisines || [],
            defaultCity: prefsData.preferences.defaultCity || "",
          });
        }
      })
      .catch(() => router.push("/prihlaseni"))
      .finally(() => setLoading(false));
  }, [router]);

  async function savePreferences() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/user/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/");
  }

  function toggleDiet(diet: string) {
    setPrefs((p) => ({
      ...p,
      dietaryPreferences: p.dietaryPreferences.includes(diet)
        ? p.dietaryPreferences.filter((d) => d !== diet)
        : [...p.dietaryPreferences, diet],
    }));
  }

  function toggleCuisine(cuisine: string) {
    setPrefs((p) => ({
      ...p,
      favoritesCuisines: p.favoritesCuisines.includes(cuisine)
        ? p.favoritesCuisines.filter((c) => c !== cuisine)
        : [...p.favoritesCuisines, cuisine],
    }));
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Odhlásit
        </Button>
      </div>

      <Tabs defaultValue="favorites">
        <TabsList>
          <TabsTrigger value="favorites" className="gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Oblíbené ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Preference
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Nastavení
          </TabsTrigger>
        </TabsList>

        {/* Favorites */}
        <TabsContent value="favorites" className="mt-6">
          {favorites.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-semibold">Zatím žádné oblíbené</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Klikněte na srdíčko u restaurace pro přidání
                </p>
                <Link href="/restaurace">
                  <Button variant="outline" className="mt-4">
                    Prohlédnout restaurace
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {favorites.map((fav) => (
                <Link key={fav.id} href={`/restaurace/${fav.restaurant.slug}`}>
                  <Card className="group overflow-hidden transition-all hover:border-primary/30 hover:shadow-md">
                    <CardContent className="flex items-center gap-4 pt-4 pb-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-warm/10">
                        {fav.restaurant.logoUrl ? (
                          <img
                            src={fav.restaurant.logoUrl}
                            alt=""
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <UtensilsCrossed className="h-6 w-6 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                          {fav.restaurant.name}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          {fav.restaurant.city && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {fav.restaurant.city}
                            </span>
                          )}
                          {fav.restaurant.cuisineType && (
                            <span className="text-xs text-muted-foreground">
                              {fav.restaurant.cuisineType}
                            </span>
                          )}
                        </div>
                      </div>
                      <FavoriteButton restaurantId={fav.restaurant.id} size="sm" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stravovací preference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((diet) => (
                  <Badge
                    key={diet}
                    variant={prefs.dietaryPreferences.includes(diet) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleDiet(diet)}
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Oblíbené kuchyně</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map((cuisine) => (
                  <Badge
                    key={cuisine}
                    variant={prefs.favoritesCuisines.includes(cuisine) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Výchozí město</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={prefs.defaultCity}
                onChange={(e) => setPrefs((p) => ({ ...p, defaultCity: e.target.value }))}
                placeholder="Např. Praha"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Restaurace z tohoto města se zobrazí přednostně
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Uloženo" : "Uložit preference"}
            </Button>
          </div>
        </TabsContent>

        {/* Settings - account */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <AccountSettings user={user} onNameChange={(name) => setUser((u) => u ? { ...u, name } : u)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AccountSettings({
  user,
  onNameChange,
}: {
  user: { id: string; name: string; email: string };
  onNameChange: (name: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function handleNameSave() {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/auth/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        toast.success("Jméno změněno");
        onNameChange(name.trim());
      } else {
        const data = await res.json();
        toast.error(data.error || "Chyba");
      }
    } catch {
      toast.error("Chyba připojení");
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        toast.success("Heslo změněno");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Chyba");
      }
    } catch {
      toast.error("Chyba připojení");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Osobní údaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acc-name">Jméno</Label>
            <div className="flex gap-2">
              <Input
                id="acc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                onClick={handleNameSave}
                disabled={savingName || name.trim() === user.name}
                className="shrink-0 gap-2"
              >
                {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Uložit
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email nelze změnit</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Změna hesla</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Aktuální heslo</Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">Nové heslo</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Alespoň 6 znaků"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" disabled={savingPw} className="gap-2">
              {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Změnit heslo
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

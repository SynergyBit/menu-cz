"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  MapPin,
  FileText,
  Clock,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  ImageIcon,
  Plus,
  Trash2,
  Download,
  PartyPopper,
  Sparkles,
  CalendarCheck,
  Truck,
  ShoppingBag,
  Car,
  Wifi,
  TreePine,
  Music,
} from "lucide-react";

const STEPS = [
  { id: "profile", title: "Profil restaurace", icon: UtensilsCrossed, desc: "Základní informace" },
  { id: "photos", title: "Logo a fotka", icon: ImageIcon, desc: "Vizuální identita" },
  { id: "menu", title: "Jídelní lístek", icon: FileText, desc: "Vaše nabídka" },
  { id: "hours", title: "Otevírací doba", icon: Clock, desc: "Kdy máte otevřeno" },
  { id: "finish", title: "Hotovo!", icon: PartyPopper, desc: "QR kód a spuštění" },
];

const cuisineOptions = [
  "Česká", "Italská", "Asijská", "Mexická", "Indická", "Francouzská",
  "Ukrajinská", "Řecká", "Japonská", "Vietnamská", "Americká",
  "Mezinárodní", "Fast food", "Kavárna", "Cukrárna",
];

const amenities = [
  { key: "acceptsReservations", icon: CalendarCheck, label: "Rezervace" },
  { key: "hasDelivery", icon: Truck, label: "Rozvoz" },
  { key: "hasTakeaway", icon: ShoppingBag, label: "S sebou" },
  { key: "hasParking", icon: Car, label: "Parkování" },
  { key: "hasWifi", icon: Wifi, label: "WiFi" },
  { key: "hasOutdoorSeating", icon: TreePine, label: "Zahrádka" },
  { key: "hasLiveMusic", icon: Music, label: "Živá hudba" },
];

const dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];

interface MenuItemDraft {
  name: string;
  price: string;
  description: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<Record<string, unknown>>({});
  const [slug, setSlug] = useState("");

  // Menu draft
  const [menuItems, setMenuItems] = useState<MenuItemDraft[]>([
    { name: "", price: "", description: "" },
  ]);
  const [categoryName, setCategoryName] = useState("Hlavní jídla");

  // Hours
  const [hours, setHours] = useState(
    dayNames.map((_, i) => ({
      dayOfWeek: i,
      openTime: i < 5 ? "11:00" : "12:00",
      closeTime: i < 5 ? "22:00" : "23:00",
      isClosed: false,
    }))
  );

  // Photo upload
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // QR
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          setSlug(data.restaurant.slug || "");
          if (data.restaurant.logoUrl) setLogoPreview(data.restaurant.logoUrl);
          if (data.restaurant.coverUrl) setCoverPreview(data.restaurant.coverUrl);
        }
      })
      .catch(() => {});
  }, []);

  function updateField(key: string, value: unknown) {
    setRestaurant((r) => ({ ...r, [key]: value }));
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/restaurants/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurant),
      });
      if (res.ok) {
        toast.success("Profil uložen");
        return true;
      }
      toast.error("Chyba při ukládání");
      return false;
    } catch {
      toast.error("Chyba připojení");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(file: File, type: "logo" | "cover") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      if (type === "logo") setLogoPreview(data.url);
      else setCoverPreview(data.url);
      toast.success(`${type === "logo" ? "Logo" : "Fotka"} nahrána`);
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při nahrávání");
    }
  }

  async function saveMenu() {
    setSaving(true);
    try {
      // Create category
      const catRes = await fetch("/api/restaurants/me/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addCategory", name: categoryName }),
      });
      const catData = await catRes.json();
      const catId = catData.category?.id;
      if (!catId) { toast.error("Chyba"); setSaving(false); return false; }

      // Add items
      for (const item of menuItems) {
        if (!item.name.trim() || !item.price.trim()) continue;
        await fetch("/api/restaurants/me/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "addItem",
            categoryId: catId,
            name: item.name.trim(),
            description: item.description.trim(),
            price: item.price.trim(),
          }),
        });
      }
      toast.success("Menu uloženo");
      return true;
    } catch {
      toast.error("Chyba");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveHours() {
    setSaving(true);
    try {
      await fetch("/api/restaurants/me/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      toast.success("Otevírací doba uložena");
      return true;
    } catch {
      toast.error("Chyba");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function nextStep() {
    if (step === 0) {
      const ok = await saveProfile();
      if (ok) setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const validItems = menuItems.filter((i) => i.name.trim());
      if (validItems.length > 0) {
        const ok = await saveMenu();
        if (ok) setStep(3);
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      const ok = await saveHours();
      if (ok) {
        // Load QR
        fetch("/api/restaurants/me/qr?format=png")
          .then((r) => r.blob())
          .then((blob) => setQrUrl(URL.createObjectURL(blob)))
          .catch(() => {});
        setStep(4);
      }
    }
  }

  function addMenuItem() {
    setMenuItems([...menuItems, { name: "", price: "", description: "" }]);
  }

  function removeMenuItem(idx: number) {
    setMenuItems(menuItems.filter((_, i) => i !== idx));
  }

  function updateMenuItem(idx: number, field: keyof MenuItemDraft, value: string) {
    setMenuItems(menuItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Nastavení restaurace</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Krok {step + 1} z {STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="mt-3 flex justify-between">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center gap-1 ${i <= step ? "text-primary" : "text-muted-foreground/40"} ${i < step ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-primary/10 text-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="hidden sm:block text-[10px]">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Step 0: Profile */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Základní informace</h2>
              <p className="text-muted-foreground">Řekněte nám o vaší restauraci</p>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Adresa</Label>
                    <Input
                      value={(restaurant.address as string) || ""}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="Hlavní 123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Město</Label>
                    <Input
                      value={(restaurant.city as string) || ""}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Praha"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                      value={(restaurant.phone as string) || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+420 123 456 789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Typ kuchyně</Label>
                    <Select
                      value={(restaurant.cuisineType as string) || ""}
                      onValueChange={(v) => updateField("cuisineType", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Vyberte..." /></SelectTrigger>
                      <SelectContent>
                        {cuisineOptions.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Popis restaurace</Label>
                  <Textarea
                    value={(restaurant.description as string) || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Pár vět o vaší restauraci..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="mb-3 block">Služby</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {amenities.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => updateField(a.key, !restaurant[a.key])}
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-medium transition-all ${
                          restaurant[a.key]
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <a.icon className="h-3.5 w-3.5" />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1: Photos */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Logo a úvodní fotka</h2>
              <p className="text-muted-foreground">Přidejte vizuální identitu (lze přeskočit)</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Logo</CardTitle></CardHeader>
                <CardContent>
                  <div
                    className="flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors mx-auto"
                    onClick={() => logoRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-8 w-8 mb-1" />
                        <p className="text-xs">Klikněte</p>
                      </div>
                    )}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "logo")} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Úvodní fotka</CardTitle></CardHeader>
                <CardContent>
                  <div
                    className="flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                    onClick={() => coverRef.current?.click()}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-8 w-8 mb-1" />
                        <p className="text-xs">Klikněte pro nahrání</p>
                      </div>
                    )}
                  </div>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "cover")} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Menu */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Přidejte první jídla</h2>
              <p className="text-muted-foreground">Stačí pár položek — zbytek doplníte později</p>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Název kategorie</Label>
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Hlavní jídla"
                  />
                </div>
                <Separator />
                {menuItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateMenuItem(idx, "name", e.target.value)}
                        placeholder="Název jídla"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateMenuItem(idx, "description", e.target.value)}
                          placeholder="Popis (volitelné)"
                          className="flex-1"
                        />
                        <Input
                          value={item.price}
                          onChange={(e) => updateMenuItem(idx, "price", e.target.value)}
                          placeholder="Cena"
                          className="w-24"
                          type="number"
                        />
                      </div>
                    </div>
                    {menuItems.length > 1 && (
                      <Button variant="ghost" size="icon" className="mt-1 text-destructive" onClick={() => removeMenuItem(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addMenuItem} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat další jídlo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Hours */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Otevírací doba</h2>
              <p className="text-muted-foreground">Nastavte kdy máte otevřeno</p>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-3">
                {hours.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                    <span className="w-16 shrink-0 text-sm font-medium">{dayNames[i]}</span>
                    <Switch
                      checked={!h.isClosed}
                      onCheckedChange={(v) => {
                        const newHours = [...hours];
                        newHours[i] = { ...h, isClosed: !v };
                        setHours(newHours);
                      }}
                    />
                    {!h.isClosed ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={h.openTime}
                          onChange={(e) => {
                            const newHours = [...hours];
                            newHours[i] = { ...h, openTime: e.target.value };
                            setHours(newHours);
                          }}
                          className="w-28 h-8"
                        />
                        <span className="text-muted-foreground text-sm">—</span>
                        <Input
                          type="time"
                          value={h.closeTime}
                          onChange={(e) => {
                            const newHours = [...hours];
                            newHours[i] = { ...h, closeTime: e.target.value };
                            setHours(newHours);
                          }}
                          className="w-28 h-8"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Zavřeno</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Finish */}
        {step === 4 && (
          <div className="space-y-8 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                <PartyPopper className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold">Gratulujeme!</h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Vaše restaurace je připravená. Tady je váš QR kód.
              </p>
            </div>

            {/* QR Code */}
            <Card className="mx-auto max-w-xs">
              <CardContent className="flex flex-col items-center gap-4 pt-6">
                <div className="rounded-2xl border-2 border-dashed p-4 bg-white">
                  {qrUrl ? (
                    <img src={qrUrl} alt="QR kód" className="h-48 w-48" />
                  ) : (
                    <div className="h-48 w-48 animate-pulse bg-muted rounded-lg" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vytiskněte a umístěte na stoly
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    if (qrUrl) {
                      const a = document.createElement("a");
                      a.href = qrUrl;
                      a.download = `qr-${slug}.png`;
                      a.click();
                    }
                  }}
                >
                  <Download className="h-4 w-4" />
                  Stáhnout QR kód
                </Button>
              </CardContent>
            </Card>

            {/* Next steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Co dál?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Doplnit jídelní lístek", href: "/dashboard/menu", icon: FileText },
                  { label: "Přidat denní menu", href: "/dashboard/denni-menu", icon: UtensilsCrossed },
                  { label: "Nastavit vizitku", href: "/dashboard/vizitka", icon: Sparkles },
                  { label: "Zobrazit QR kód", href: "/dashboard/qr-kod", icon: QrCode },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="gap-2"
              onClick={() => router.push("/dashboard")}
            >
              Přejít na dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="mt-8 flex items-center justify-between">
            <div>
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zpět
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step > 0 && step < 4 && (
                <Button variant="ghost" onClick={() => setStep(step + 1)} className="text-muted-foreground">
                  Přeskočit
                </Button>
              )}
              <Button onClick={nextStep} disabled={saving} className="gap-2 min-w-[140px]">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step === 3 ? (
                  <>
                    Dokončit
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Pokračovat
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

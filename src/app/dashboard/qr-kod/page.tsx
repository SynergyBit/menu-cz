"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanBadge } from "@/components/premium-gate";
import { toast } from "sonner";
import { QrCode, Download, Copy, Check, ExternalLink, Palette, Crown } from "lucide-react";

const presetColors = [
  { name: "Černá", dark: "#1a1a1a", bg: "#ffffff" },
  { name: "Tmavě modrá", dark: "#1e3a5f", bg: "#ffffff" },
  { name: "Zelená", dark: "#166534", bg: "#ffffff" },
  { name: "Červená", dark: "#991b1b", bg: "#ffffff" },
  { name: "Fialová", dark: "#6b21a8", bg: "#ffffff" },
  { name: "Oranžová", dark: "#c2410c", bg: "#ffffff" },
  { name: "Tmavá", dark: "#fafafa", bg: "#1a1a1a" },
  { name: "Modrá tmavá", dark: "#93c5fd", bg: "#1e293b" },
];

const frameStyles = [
  { id: "none", label: "Bez rámečku" },
  { id: "scan-menu", label: "Naskenujte menu" },
  { id: "scan-order", label: "Objednejte si" },
  { id: "daily-menu", label: "Denní menu" },
  { id: "custom", label: "Vlastní text" },
];

const sizes = [
  { value: "256", label: "Malý (256px)" },
  { value: "512", label: "Střední (512px)" },
  { value: "768", label: "Velký (768px)" },
  { value: "1024", label: "Extra (1024px)" },
];

export default function QRKodPage() {
  const [restaurant, setRestaurant] = useState<{
    slug: string; name: string; isActive: boolean; plan: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Design state
  const [darkColor, setDarkColor] = useState("#1a1a1a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState("512");
  const [frameStyle, setFrameStyle] = useState("none");
  const [customFrameText, setCustomFrameText] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isPremium = restaurant?.plan === "premium";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reload QR when design changes
  useEffect(() => {
    if (!restaurant) return;
    const params = new URLSearchParams({
      format: "png",
      color: isPremium ? darkColor : "#1a1a1a",
      bg: isPremium ? bgColor : "#ffffff",
      size,
    });
    fetch(`/api/restaurants/me/qr?${params}`)
      .then((r) => r.blob())
      .then((blob) => setQrDataUrl(URL.createObjectURL(blob)))
      .catch(() => {});
  }, [restaurant, darkColor, bgColor, size, isPremium]);

  function getFrameText(): string {
    switch (frameStyle) {
      case "scan-menu": return "📱 Naskenujte pro menu";
      case "scan-order": return "📱 Objednejte si zde";
      case "daily-menu": return "📅 Denní menu";
      case "custom": return customFrameText || "Naskenujte QR kód";
      default: return "";
    }
  }

  async function downloadWithFrame() {
    if (!qrDataUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = qrDataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const frameText = getFrameText();
    const hasFrame = frameStyle !== "none" && frameText;
    const padding = 40;
    const headerH = hasFrame ? 60 : 0;
    const footerH = 30;
    const totalW = parseInt(size) + padding * 2;
    const totalH = parseInt(size) + padding * 2 + headerH + footerH;

    const canvas = document.createElement("canvas");
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.roundRect(0, 0, totalW, totalH, 20);
    ctx.fill();

    // Border
    ctx.strokeStyle = darkColor + "20";
    ctx.lineWidth = 2;
    ctx.roundRect(0, 0, totalW, totalH, 20);
    ctx.stroke();

    // Frame text
    if (hasFrame) {
      ctx.fillStyle = darkColor;
      ctx.font = `bold ${Math.max(16, parseInt(size) / 20)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(frameText, totalW / 2, padding + headerH / 2 + 5);
    }

    // QR code
    ctx.drawImage(img, padding, padding + headerH, parseInt(size), parseInt(size));

    // Restaurant name footer
    ctx.fillStyle = darkColor + "60";
    ctx.font = `${Math.max(10, parseInt(size) / 40)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(restaurant?.name || "Gastroo", totalW / 2, totalH - footerH / 2 + 2);

    // Download
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${restaurant?.slug || "menu"}${frameStyle !== "none" ? `-${frameStyle}` : ""}.png`;
    a.click();
    toast.success("QR kód stažen");
  }

  async function downloadSVG() {
    const params = new URLSearchParams({
      format: "svg",
      color: isPremium ? darkColor : "#1a1a1a",
      bg: isPremium ? bgColor : "#ffffff",
    });
    const res = await fetch(`/api/restaurants/me/qr?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${restaurant?.slug || "menu"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyLink() {
    const url = `${window.location.origin}/m/${restaurant?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 max-w-md" /></div>;
  }

  const menuUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/m/${restaurant?.slug}`;
  const frameText = getFrameText();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">QR kód</h1>
          <p className="text-sm text-muted-foreground">Zákazníci naskenují a uvidí vaše menu</p>
        </div>
        <PlanBadge plan={restaurant?.plan || "free"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5 text-primary" />
              Náhled
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* Frame preview */}
            <div
              className="rounded-2xl border-2 border-dashed p-6 transition-all"
              style={{ backgroundColor: bgColor, borderColor: darkColor + "20" }}
            >
              {frameStyle !== "none" && frameText && (
                <p
                  className="mb-3 text-center text-sm font-bold"
                  style={{ color: darkColor }}
                >
                  {frameText}
                </p>
              )}
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR kód" className="h-56 w-56" />
              ) : (
                <Skeleton className="h-56 w-56" />
              )}
              <p className="mt-2 text-center text-[10px] opacity-40" style={{ color: darkColor }}>
                {restaurant?.name}
              </p>
            </div>

            {/* URL */}
            <div className="w-full flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <code className="flex-1 truncate text-xs text-muted-foreground">{menuUrl}</code>
              <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" onClick={copyLink}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Zkopírováno" : "Kopírovat"}
              </Button>
            </div>

            {/* Download buttons */}
            <div className="w-full grid gap-2 sm:grid-cols-2">
              <Button onClick={downloadWithFrame} className="gap-2">
                <Download className="h-4 w-4" />
                PNG s rámečkem
              </Button>
              <Button variant="outline" onClick={downloadSVG} className="gap-2">
                <Download className="h-4 w-4" />
                SVG (vektorový)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Designer sidebar */}
        <div className="space-y-4">
          {/* Color */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Barva QR kódu
                {!isPremium && <Badge variant="outline" className="text-[9px] gap-0.5"><Crown className="h-2.5 w-2.5" />Premium</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {presetColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => { setDarkColor(c.dark); setBgColor(c.bg); }}
                        className={`relative h-10 rounded-lg border-2 transition-all overflow-hidden ${
                          darkColor === c.dark && bgColor === c.bg ? "border-primary ring-2 ring-primary/30" : "border-border"
                        }`}
                        title={c.name}
                      >
                        <div className="absolute inset-0" style={{ backgroundColor: c.bg }} />
                        <div className="absolute inset-2 rounded" style={{ backgroundColor: c.dark }} />
                      </button>
                    ))}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">QR barva</Label>
                      <div className="flex gap-2">
                        <input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer" />
                        <Input value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="h-8 font-mono text-xs" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Pozadí</Label>
                      <div className="flex gap-2">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer" />
                        <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 font-mono text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Vlastní barvy jsou dostupné v plánu Premium</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Frame */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Rámeček</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-1.5">
                {frameStyles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrameStyle(f.id)}
                    className={`rounded-lg border-2 px-3 py-2 text-left text-xs font-medium transition-all ${
                      frameStyle === f.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {frameStyle === "custom" && (
                <Input
                  value={customFrameText}
                  onChange={(e) => setCustomFrameText(e.target.value)}
                  placeholder="Váš text..."
                  className="h-8"
                  maxLength={30}
                />
              )}
            </CardContent>
          </Card>

          {/* Size */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Velikost</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={size} onValueChange={(v) => v && setSize(v)}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sizes.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tipy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>Vytiskněte QR kód a umístěte na stoly, menu nebo vstup.</p>
              <p>PNG s rámečkem je ideální pro tisk. SVG pro velké formáty.</p>
              <p>Tmavé QR kódy na světlém pozadí se skenují nejlépe.</p>
            </CardContent>
          </Card>

          {restaurant?.isActive && (
            <a href={`/m/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Zobrazit stránku
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

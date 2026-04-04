"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCode, Download, Copy, Check, ExternalLink } from "lucide-react";

export default function QRKodPage() {
  const [restaurant, setRestaurant] = useState<{
    slug: string;
    name: string;
    isActive: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

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

  useEffect(() => {
    if (restaurant) {
      fetch("/api/restaurants/me/qr?format=png")
        .then((r) => r.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setQrDataUrl(url);
        })
        .catch(() => {});
    }
  }, [restaurant]);

  async function downloadPNG() {
    const res = await fetch("/api/restaurants/me/qr?format=png");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${restaurant?.slug || "menu"}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadSVG() {
    const res = await fetch("/api/restaurants/me/qr?format=svg");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${restaurant?.slug || "menu"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyLink() {
    const url = `${window.location.origin}/restaurace/${restaurant?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 max-w-md" />
      </div>
    );
  }

  const menuUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/restaurace/${restaurant?.slug}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QR kód</h1>
        <p className="text-sm text-muted-foreground">
          Zákazníci naskenují QR kód a uvidí vaše menu
        </p>
      </div>

      {!restaurant?.isActive && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <Badge variant="secondary">Neaktivní</Badge>
            <p className="text-sm text-muted-foreground">
              Vaše restaurace není aktivní. Kontaktujte admina pro aktivaci.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
        {/* QR Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Náhled QR kódu
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="rounded-2xl border-2 border-dashed border-border bg-white p-6">
              {qrDataUrl ? (
                <img
                  ref={imgRef}
                  src={qrDataUrl}
                  alt="QR kód restaurace"
                  className="h-64 w-64"
                />
              ) : (
                <Skeleton className="h-64 w-64" />
              )}
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <code className="flex-1 truncate text-xs text-muted-foreground">
                  {menuUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={copyLink}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Zkopírováno" : "Kopírovat"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stáhnout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={downloadPNG} className="w-full gap-2">
                <Download className="h-4 w-4" />
                PNG (512×512)
              </Button>
              <Button
                onClick={downloadSVG}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                SVG (vektorový)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Vytiskněte QR kód a umístěte ho na stoly, menu nebo
                vstupní dveře.
              </p>
              <p>
                Zákazníci naskenují kód mobilem a okamžitě uvidí váš
                jídelní lístek a denní menu.
              </p>
              <p>SVG formát je ideální pro tisk ve velké velikosti.</p>
            </CardContent>
          </Card>

          {restaurant?.isActive && (
            <a
              href={`/restaurace/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
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

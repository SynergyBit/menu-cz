"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumGate, PlanBadge } from "@/components/premium-gate";
import { toast } from "sonner";
import {
  ImagePlus,
  Trash2,
  Loader2,
  ImageIcon,
} from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

export default function FotkyPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadPhotos() {
    const [photosRes, meRes] = await Promise.all([
      fetch("/api/restaurants/me/photos").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setPhotos(photosRes.photos || []);
    setPlan(meRes.restaurant?.plan || "free");
    setLoading(false);
  }

  useEffect(() => { loadPhotos(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/restaurants/me/photos", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        loadPhotos();
      } else {
        const data = await res.json();
        toast.error(data.error || "Chyba");
      }
    } catch {
      toast.error("Chyba při nahrávání");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function deletePhoto(id: string) {
    await fetch(`/api/restaurants/me/photos?id=${id}`, { method: "DELETE" });
    loadPhotos();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const photoLimit = plan === "free" ? 0 : plan === "standard" ? 5 : Infinity;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fotogalerie</h1>
          <p className="text-sm text-muted-foreground">
            {photoLimit === Infinity
              ? `${photos.length} fotek`
              : `${photos.length} / ${photoLimit} fotek`}
          </p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <PremiumGate feature="Fotogalerie" requiredPlan="standard" currentPlan={plan}>
        {/* Upload */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Button
              onClick={() => inputRef.current?.click()}
              disabled={uploading || photos.length >= photoLimit}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Nahrát fotku
            </Button>
            <p className="text-sm text-muted-foreground">
              JPEG, PNG nebo WebP, max 2 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Gallery */}
        {photos.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground">Zatím žádné fotky</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <Card key={photo.id} className="group overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <img
                    src={photo.url}
                    alt={photo.caption || "Fotka restaurace"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-destructive opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {photo.caption && (
                  <CardContent className="p-3">
                    <p className="text-sm text-muted-foreground">{photo.caption}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </PremiumGate>
    </div>
  );
}

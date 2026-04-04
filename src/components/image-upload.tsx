"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  type: "logo" | "cover";
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}

export function ImageUpload({ type, currentUrl, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Chyba při nahrávání");
        return;
      }

      setPreview(data.url);
      onUploaded(data.url);
    } catch {
      setError("Chyba připojení");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isLogo = type === "logo";

  return (
    <div className="space-y-2">
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary/30 ${
          isLogo ? "h-32 w-32" : "h-40 w-full"
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={type}
              className={`h-full w-full ${isLogo ? "object-contain p-2" : "object-cover"}`}
            />
            <button
              onClick={() => {
                setPreview(null);
                onUploaded("");
              }}
              className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-6 w-6" />
                <span className="text-xs">
                  {isLogo ? "Logo" : "Úvodní fotka"}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {preview && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Změnit
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

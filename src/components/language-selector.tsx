"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { languages, type Language } from "@/lib/languages";
import { Globe, Loader2, Check } from "lucide-react";

interface LanguageSelectorProps {
  currentLang: string;
  onSelectLanguage: (lang: string) => void;
  translating: boolean;
  compact?: boolean;
}

export function LanguageSelector({ currentLang, onSelectLanguage, translating, compact }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === currentLang);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          variant={currentLang === "cs" ? "outline" : "default"}
          size={compact ? "sm" : "default"}
          className={`gap-2 ${compact ? "h-8" : ""} ${currentLang !== "cs" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          disabled={translating}
        />
      }>
        {translating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        {current ? (
          <span className="flex items-center gap-1.5">
            <span>{current.flag}</span>
            {!compact && <span className="hidden sm:inline">{current.nativeName}</span>}
          </span>
        ) : (
          !compact && <span className="hidden sm:inline">Jazyk</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">Přeložit menu</p>
        <div className="max-h-72 overflow-y-auto space-y-0.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                currentLang === lang.code
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.nativeName}</span>
              {currentLang === lang.code && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

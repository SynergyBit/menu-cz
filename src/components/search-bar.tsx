"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, UtensilsCrossed } from "lucide-react";

interface Suggestion {
  name: string;
  slug: string;
  city: string | null;
  cuisineType: string | null;
  logoUrl: string | null;
}

interface SearchBarProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  showButton?: boolean;
}

export function SearchBar({
  className = "",
  inputClassName = "h-12 pl-10 text-base",
  placeholder = "Název restaurace, město, typ kuchyně...",
  showButton = true,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
          setSelectedIdx(-1);
        })
        .catch(() => setSuggestions([]));
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    if (selectedIdx >= 0 && suggestions[selectedIdx]) {
      router.push(`/restaurace/${suggestions[selectedIdx].slug}`);
    } else if (query.trim()) {
      router.push(`/restaurace?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/restaurace");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={inputClassName}
          />
        </div>
        {showButton && (
          <Button type="submit" size="lg" className="h-12 px-6">
            Hledat
          </Button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border bg-popover shadow-xl">
          {suggestions.map((s, idx) => (
            <Link
              key={s.slug}
              href={`/restaurace/${s.slug}`}
              onClick={() => setShowSuggestions(false)}
            >
              <div
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  idx === selectedIdx ? "bg-accent" : "hover:bg-muted/50"
                }`}
              >
                {s.logoUrl ? (
                  <img
                    src={s.logoUrl}
                    alt=""
                    className="h-8 w-8 rounded-lg object-contain border p-0.5"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UtensilsCrossed className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {s.city && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {s.city}
                      </span>
                    )}
                    {s.cuisineType && <span>{s.cuisineType}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <Link
            href={`/restaurace?q=${encodeURIComponent(query)}`}
            onClick={() => setShowSuggestions(false)}
          >
            <div className="border-t px-4 py-2.5 text-center text-sm text-muted-foreground hover:bg-muted/50">
              Zobrazit všechny výsledky pro &quot;{query}&quot;
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

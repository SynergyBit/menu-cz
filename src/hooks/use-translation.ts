"use client";

import { useState, useCallback, useRef } from "react";

// Client-side cache
const translationCache = new Map<string, string>();

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState("cs");
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const pendingRef = useRef(false);

  const translateTexts = useCallback(async (texts: string[], targetLang: string) => {
    if (targetLang === "cs") {
      setTranslations(new Map());
      setCurrentLang("cs");
      return;
    }

    // Check cache first
    const uncached: string[] = [];
    const uncachedIndices: number[] = [];
    const result = new Map<string, string>();

    texts.forEach((text, i) => {
      const cacheKey = `${targetLang}:${text}`;
      const cached = translationCache.get(cacheKey);
      if (cached) {
        result.set(text, cached);
      } else if (text && text.trim()) {
        uncached.push(text);
        uncachedIndices.push(i);
      }
    });

    if (uncached.length === 0) {
      setTranslations(result);
      setCurrentLang(targetLang);
      return;
    }

    if (pendingRef.current) return;
    pendingRef.current = true;
    setTranslating(true);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: uncached, targetLang }),
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.translations || [];
        uncached.forEach((text, i) => {
          const translatedText = translated[i] || text;
          result.set(text, translatedText);
          translationCache.set(`${targetLang}:${text}`, translatedText);
        });
      }
    } catch {
      // Fallback — return original texts
    }

    setTranslations(result);
    setCurrentLang(targetLang);
    setTranslating(false);
    pendingRef.current = false;
  }, []);

  const t = useCallback((text: string | null | undefined): string => {
    if (!text) return "";
    if (currentLang === "cs") return text;
    return translations.get(text) || text;
  }, [currentLang, translations]);

  return { currentLang, translating, translateTexts, t, setCurrentLang };
}

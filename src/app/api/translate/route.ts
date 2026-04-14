import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/validation";

// In-memory translation cache (per process)
const cache = new Map<string, { result: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function translateText(text: string, targetLang: string, sourceLang: string = "cs"): Promise<string> {
  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();

    // Google returns [[["translated text","original text",...],...],...]
    let translated = "";
    if (data && data[0]) {
      for (const segment of data[0]) {
        if (segment[0]) translated += segment[0];
      }
    }

    if (translated) {
      cache.set(cacheKey, { result: translated, timestamp: Date.now() });
      // Cleanup old cache entries
      if (cache.size > 5000) {
        const now = Date.now();
        for (const [key, val] of cache) {
          if (now - val.timestamp > CACHE_TTL) cache.delete(key);
        }
      }
    }

    return translated || text;
  } catch {
    return text;
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!(await checkRateLimit(`translate:${ip}`, 30, 60000))) { // 30 per minute
    return NextResponse.json({ error: "Příliš mnoho požadavků" }, { status: 429 });
  }

  try {
    const { texts, targetLang, sourceLang } = await request.json();

    if (!texts || !Array.isArray(texts) || !targetLang) {
      return NextResponse.json({ error: "texts (array) a targetLang jsou povinné" }, { status: 400 });
    }

    if (texts.length > 100) {
      return NextResponse.json({ error: "Max 100 textů najednou" }, { status: 400 });
    }

    if (targetLang === (sourceLang || "cs")) {
      return NextResponse.json({ translations: texts });
    }

    // Batch translate — join with separator, translate, split back
    const separator = " ||| ";
    const joined = texts.join(separator);

    // Split into chunks if too long (max ~5000 chars per request)
    const maxChunkSize = 4500;
    const translations: string[] = [];

    if (joined.length <= maxChunkSize) {
      const translated = await translateText(joined, targetLang, sourceLang || "cs");
      const parts = translated.split(/\s*\|\|\|\s*/);
      for (let i = 0; i < texts.length; i++) {
        translations.push(parts[i]?.trim() || texts[i]);
      }
    } else {
      // Translate individually for large batches
      for (const text of texts) {
        if (!text || !text.trim()) {
          translations.push(text || "");
          continue;
        }
        const translated = await translateText(text, targetLang, sourceLang || "cs");
        translations.push(translated);
      }
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json({ error: "Chyba překladu" }, { status: 500 });
  }
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { recipeCategories, difficulties, getCategory, getDifficulty } from "@/lib/recipe-types";
import { ChefHat, Clock, Users, Calendar } from "lucide-react";

interface Recipe {
  id: string; title: string; slug: string; description: string | null; coverImage: string | null;
  category: string; cuisine: string | null; difficulty: string; prepTime: number | null;
  cookTime: number | null; servings: number | null; tags: string | null; publishedAt: string;
}

export default function KucharkaPage() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [diff, setDiff] = useState("");

  useEffect(() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (diff) p.set("difficulty", diff);
    setLoading(true);
    fetch(`/api/recipes?${p}`).then((r) => r.json()).then((d) => setItems(d.recipes || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, [category, diff]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ChefHat className="h-6 w-6" /></div>
          <div><h1 className="text-3xl font-bold">Kuchařka</h1><p className="text-muted-foreground">Recepty krok za krokem</p></div>
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button onClick={() => setCategory("")} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${!category ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>Vše</button>
        {recipeCategories.map((c) => (
          <button key={c.value} onClick={() => setCategory(category === c.value ? "" : c.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${category === c.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>{c.emoji} {c.label}</button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="mb-8 flex flex-wrap gap-1.5">
        {difficulties.map((d) => (
          <button key={d.value} onClick={() => setDiff(diff === d.value ? "" : d.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${diff === d.value ? d.color + " ring-1 ring-current" : "bg-muted hover:bg-muted/80"}`}>{d.emoji} {d.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <Card className="py-16 text-center"><CardContent><ChefHat className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" /><h3 className="text-lg font-semibold">Žádné recepty</h3></CardContent></Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => {
            const cat = getCategory(r.category);
            const d = getDifficulty(r.difficulty);
            const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
            return (
              <Link key={r.id} href={`/kucharka/${r.slug}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
                  <div className="relative h-44 bg-gradient-to-br from-primary/10 to-warm/10 overflow-hidden">
                    {r.coverImage ? <img src={r.coverImage} alt={r.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><ChefHat className="h-12 w-12 text-primary/15" /></div>}
                    <Badge className={`absolute left-3 top-3 text-xs ${d.color} border-0`}>{d.emoji} {d.label}</Badge>
                    <Badge variant="outline" className="absolute right-3 top-3 text-xs bg-card/80 backdrop-blur-sm">{cat.emoji} {cat.label}</Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h2 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{r.title}</h2>
                    {r.description && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{r.description}</p>}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      {totalTime > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{totalTime} min</span>}
                      {r.servings && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.servings} porcí</span>}
                      {r.cuisine && <span>{r.cuisine}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

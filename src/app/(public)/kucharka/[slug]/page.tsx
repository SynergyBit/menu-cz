"use client";
// Admin-authored content only — trusted source for HTML rendering

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getCategory, getDifficulty } from "@/lib/recipe-types";
import { ArrowLeft, Clock, Users, ChefHat, Share2, Tag, Printer, Calendar, User } from "lucide-react";

interface Ingredient { amount: string; unit: string; name: string; }
interface Recipe { title: string; slug: string; description: string | null; ingredients: string; instructions: string; coverImage: string | null; category: string; cuisine: string | null; difficulty: string; prepTime: number | null; cookTime: number | null; servings: number | null; tags: string | null; authorName: string; publishedAt: string; }

export default function ReceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(`/api/recipes?slug=${slug}`).then((r) => r.json()).then((d) => setRecipe(d.recipe || null)).catch(() => setRecipe(null)).finally(() => setLoading(false)); }, [slug]);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><Skeleton className="h-64 rounded-xl mb-6" /><Skeleton className="h-10 w-3/4 mb-4" /><Skeleton className="h-96" /></div>;
  if (!recipe) return <div className="mx-auto max-w-3xl px-4 py-20 text-center"><ChefHat className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" /><h2 className="text-xl font-semibold">Recept nenalezen</h2><Link href="/kucharka"><Button variant="ghost" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" />Zpět</Button></Link></div>;

  const cat = getCategory(recipe.category);
  const diff = getDifficulty(recipe.difficulty);
  const ingredients: Ingredient[] = JSON.parse(recipe.ingredients || "[]");
  const recipeTags: string[] = recipe.tags ? JSON.parse(recipe.tags) : [];
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/kucharka"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Kuchařka</Button></Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.print()}><Printer className="h-4 w-4" />Tisk</Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => { if (navigator.share) navigator.share({ title: recipe.title, url: window.location.href }); else navigator.clipboard.writeText(window.location.href); }}><Share2 className="h-4 w-4" />Sdílet</Button>
        </div>
      </div>

      {recipe.coverImage && <div className="mb-8 overflow-hidden rounded-2xl"><img src={recipe.coverImage} alt={recipe.title} className="w-full h-64 sm:h-80 object-cover" /></div>}

      <div className="mb-6">
        <div className="flex gap-2 mb-3"><Badge className={`${diff.color} border-0`}>{diff.emoji} {diff.label}</Badge><Badge variant="outline">{cat.emoji} {cat.label}</Badge>{recipe.cuisine ? <Badge variant="outline">{recipe.cuisine}</Badge> : null}</div>
        <h1 className="text-3xl font-bold sm:text-4xl leading-tight">{recipe.title}</h1>
        {recipe.description ? <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{recipe.description}</p> : null}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {recipe.prepTime ? <Card><CardContent className="flex flex-col items-center py-3"><Clock className="h-5 w-5 text-primary mb-1" /><span className="text-lg font-bold">{recipe.prepTime}</span><span className="text-xs text-muted-foreground">min příprava</span></CardContent></Card> : null}
        {recipe.cookTime ? <Card><CardContent className="flex flex-col items-center py-3"><Clock className="h-5 w-5 text-primary mb-1" /><span className="text-lg font-bold">{recipe.cookTime}</span><span className="text-xs text-muted-foreground">min vaření</span></CardContent></Card> : null}
        {totalTime > 0 ? <Card><CardContent className="flex flex-col items-center py-3"><Clock className="h-5 w-5 text-primary mb-1" /><span className="text-lg font-bold">{totalTime}</span><span className="text-xs text-muted-foreground">min celkem</span></CardContent></Card> : null}
        {recipe.servings ? <Card><CardContent className="flex flex-col items-center py-3"><Users className="h-5 w-5 text-primary mb-1" /><span className="text-lg font-bold">{recipe.servings}</span><span className="text-xs text-muted-foreground">porcí</span></CardContent></Card> : null}
      </div>

      {ingredients.length > 0 && (
        <Card className="mb-8"><CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ChefHat className="h-5 w-5 text-primary" />Ingredience</h2>
          <ul className="space-y-2">{ingredients.map((ing, i) => <li key={i} className="flex items-center gap-3 py-1.5 border-b border-dashed border-border/50 last:border-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span><span className="text-sm"><strong>{ing.amount} {ing.unit}</strong> {ing.name}</span></li>)}</ul>
        </CardContent></Card>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Postup přípravy</h2>
        <article className="[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_img]:rounded-xl [&_img]:my-6 [&_strong]:font-semibold [&_em]:italic [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1.5">
          {recipe.instructions.split(/(<[^>]+>)/).map((seg, i) => seg.startsWith("<") ? <span key={i} dangerouslySetInnerHTML={{ __html: seg }} /> : seg ? <span key={i}>{seg}</span> : null)}
        </article>
      </div>

      <Separator className="mb-6" />
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4"><span className="flex items-center gap-1.5"><User className="h-4 w-4" />{recipe.authorName}</span><span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(recipe.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}</span></div>
      {recipeTags.length > 0 && <div className="flex items-center gap-2 flex-wrap mb-8"><Tag className="h-4 w-4 text-muted-foreground" />{recipeTags.map((t) => <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>)}</div>}
      <div className="text-center"><Link href="/kucharka"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" />Všechny recepty</Button></Link></div>
    </div>
  );
}

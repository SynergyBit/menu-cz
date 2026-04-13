"use client";
import { useState, useEffect, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeEditor } from "@/components/recipe-editor";

export default function EditReceptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Parameters<typeof RecipeEditor>[0]["initialData"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/recipes").then((r) => r.json()).then((res) => {
      const recipe = (res.recipes || []).find((r: { id: string }) => r.id === id);
      if (recipe) setData({ ...recipe, description: recipe.description || "", ingredients: JSON.parse(recipe.ingredients || "[]"), tags: recipe.tags ? JSON.parse(recipe.tags) : [], cuisine: recipe.cuisine || "" });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>;
  if (!data) return <p className="text-center py-12 text-muted-foreground">Recept nenalezen</p>;
  return <RecipeEditor initialData={data} />;
}

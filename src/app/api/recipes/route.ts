import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");
    const difficulty = searchParams.get("difficulty");

    if (slug) {
      const [recipe] = await db.select().from(recipes).where(and(eq(recipes.slug, slug), eq(recipes.isPublished, true))).limit(1);
      return NextResponse.json({ recipe: recipe || null });
    }

    const conditions = [eq(recipes.isPublished, true)];
    if (category) conditions.push(eq(recipes.category, category));
    if (difficulty) conditions.push(eq(recipes.difficulty, difficulty));

    const result = await db.select({
      id: recipes.id, title: recipes.title, slug: recipes.slug, description: recipes.description,
      coverImage: recipes.coverImage, category: recipes.category, cuisine: recipes.cuisine,
      difficulty: recipes.difficulty, prepTime: recipes.prepTime, cookTime: recipes.cookTime,
      servings: recipes.servings, tags: recipes.tags, authorName: recipes.authorName, publishedAt: recipes.publishedAt,
    }).from(recipes).where(and(...conditions)).orderBy(desc(recipes.publishedAt)).limit(50);

    return NextResponse.json({ recipes: result });
  } catch (error) {
    console.error("Recipes API error:", error);
    return NextResponse.json({ recipes: [] });
  }
}

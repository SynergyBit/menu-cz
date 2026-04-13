import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

function generateSlug(title: string): string {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });

  const result = await db.select().from(recipes).orderBy(desc(recipes.createdAt));
  return NextResponse.json({ recipes: result });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });

  try {
    const body = await request.json();
    let slug = generateSlug(body.title);
    const existing = await db.select().from(recipes).where(eq(recipes.slug, slug)).limit(1);
    if (existing.length > 0) slug = `${slug}-${Date.now().toString(36)}`;

    const [recipe] = await db.insert(recipes).values({
      title: body.title,
      slug,
      description: body.description || null,
      ingredients: JSON.stringify(body.ingredients || []),
      instructions: body.instructions || "",
      coverImage: body.coverImage || null,
      category: body.category || "hlavni-jidla",
      cuisine: body.cuisine || null,
      difficulty: body.difficulty || "stredni",
      prepTime: body.prepTime ? Number(body.prepTime) : null,
      cookTime: body.cookTime ? Number(body.cookTime) : null,
      servings: body.servings ? Number(body.servings) : 4,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      authorName: body.authorName || "Gastroo",
      isPublished: !!body.isPublished,
      publishedAt: body.isPublished ? new Date() : null,
    }).returning();

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Recipe create error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.ingredients !== undefined) updates.ingredients = JSON.stringify(body.ingredients);
    if (body.instructions !== undefined) updates.instructions = body.instructions;
    if (body.coverImage !== undefined) updates.coverImage = body.coverImage;
    if (body.category !== undefined) updates.category = body.category;
    if (body.cuisine !== undefined) updates.cuisine = body.cuisine;
    if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
    if (body.prepTime !== undefined) updates.prepTime = body.prepTime ? Number(body.prepTime) : null;
    if (body.cookTime !== undefined) updates.cookTime = body.cookTime ? Number(body.cookTime) : null;
    if (body.servings !== undefined) updates.servings = body.servings ? Number(body.servings) : null;
    if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags);
    if (body.authorName !== undefined) updates.authorName = body.authorName;
    if (body.isPublished !== undefined) {
      updates.isPublished = body.isPublished;
      if (body.isPublished) updates.publishedAt = new Date();
    }

    const [recipe] = await db.update(recipes).set(updates).where(eq(recipes.id, body.id)).returning();
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Recipe update error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) await db.delete(recipes).where(eq(recipes.id, id));
  return NextResponse.json({ success: true });
}

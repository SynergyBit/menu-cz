import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menuCategories, menuItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, session.restaurantId))
    .orderBy(menuCategories.sortOrder);

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, session.restaurantId))
    .orderBy(menuItems.sortOrder);

  const result = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.categoryId === cat.id),
  }));

  return NextResponse.json({ categories: result });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const { action, ...data } = await request.json();

    if (action === "addCategory") {
      const [cat] = await db
        .insert(menuCategories)
        .values({
          restaurantId: session.restaurantId,
          name: data.name,
          sortOrder: data.sortOrder || 0,
        })
        .returning();
      return NextResponse.json({ category: cat });
    }

    if (action === "addItem") {
      const [item] = await db
        .insert(menuItems)
        .values({
          categoryId: data.categoryId,
          restaurantId: session.restaurantId,
          name: data.name,
          description: data.description || null,
          price: data.price,
          allergens: data.allergens || null,
          sortOrder: data.sortOrder || 0,
        })
        .returning();
      return NextResponse.json({ item });
    }

    if (action === "updateItem") {
      const [item] = await db
        .update(menuItems)
        .set({
          name: data.name,
          description: data.description,
          price: data.price,
          allergens: data.allergens,
          isAvailable: data.isAvailable,
        })
        .where(and(eq(menuItems.id, data.id), eq(menuItems.restaurantId, session.restaurantId)))
        .returning();
      return NextResponse.json({ item });
    }

    if (action === "deleteItem") {
      await db.delete(menuItems).where(and(eq(menuItems.id, data.id), eq(menuItems.restaurantId, session.restaurantId)));
      return NextResponse.json({ success: true });
    }

    if (action === "deleteCategory") {
      await db.delete(menuCategories).where(and(eq(menuCategories.id, data.id), eq(menuCategories.restaurantId, session.restaurantId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Neznámá akce" }, { status: 400 });
  } catch (error) {
    console.error("Menu API error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

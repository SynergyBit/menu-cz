import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { favorites, restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ favorites: [] });
  }

  const result = await db
    .select({
      id: favorites.id,
      restaurantId: favorites.restaurantId,
      restaurant: {
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        city: restaurants.city,
        cuisineType: restaurants.cuisineType,
        logoUrl: restaurants.logoUrl,
        coverUrl: restaurants.coverUrl,
      },
    })
    .from(favorites)
    .innerJoin(restaurants, eq(favorites.restaurantId, restaurants.id))
    .where(eq(favorites.userId, session.userId))
    .orderBy(favorites.createdAt);

  return NextResponse.json({
    favorites: result,
    favoriteIds: result.map((f) => f.restaurantId),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { restaurantId, action } = await request.json();

  if (action === "add") {
    // Check if already favorited
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, session.userId), eq(favorites.restaurantId, restaurantId)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(favorites).values({
        userId: session.userId,
        restaurantId,
      });
    }
    return NextResponse.json({ success: true, isFavorite: true });
  }

  if (action === "remove") {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, session.userId), eq(favorites.restaurantId, restaurantId)));
    return NextResponse.json({ success: true, isFavorite: false });
  }

  if (action === "toggle") {
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, session.userId), eq(favorites.restaurantId, restaurantId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, session.userId), eq(favorites.restaurantId, restaurantId)));
      return NextResponse.json({ success: true, isFavorite: false });
    } else {
      await db.insert(favorites).values({ userId: session.userId, restaurantId });
      return NextResponse.json({ success: true, isFavorite: true });
    }
  }

  return NextResponse.json({ error: "Neznámá akce" }, { status: 400 });
}

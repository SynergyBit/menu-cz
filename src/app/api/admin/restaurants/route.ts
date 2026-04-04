import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  const result = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      city: restaurants.city,
      cuisineType: restaurants.cuisineType,
      isActive: restaurants.isActive,
      isPremium: restaurants.isPremium,
      createdAt: restaurants.createdAt,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(restaurants)
    .leftJoin(users, eq(restaurants.userId, users.id))
    .orderBy(restaurants.createdAt);

  return NextResponse.json({ restaurants: result });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  try {
    const { id, isActive, isPremium } = await request.json();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (typeof isPremium === "boolean") updates.isPremium = isPremium;

    const [updated] = await db
      .update(restaurants)
      .set(updates)
      .where(eq(restaurants.id, id))
      .returning();

    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

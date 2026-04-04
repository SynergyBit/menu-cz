import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, address, city, phone, email, website, cuisineType, priceRange } = body;

    const [updated] = await db
      .update(restaurants)
      .set({
        name: name || undefined,
        description,
        address,
        city,
        phone,
        email,
        website,
        cuisineType,
        priceRange: priceRange ? Number(priceRange) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, session.restaurantId))
      .returning();

    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    console.error("Update restaurant error:", error);
    return NextResponse.json({ error: "Chyba při aktualizaci" }, { status: 500 });
  }
}

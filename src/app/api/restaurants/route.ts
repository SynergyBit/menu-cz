import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, openingHours } from "@/db/schema";
import { eq, and, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const cuisine = searchParams.get("cuisine");

    let query = db
      .select()
      .from(restaurants)
      .where(eq(restaurants.isActive, true));

    const conditions = [eq(restaurants.isActive, true)];

    if (q) {
      conditions.push(
        or(
          ilike(restaurants.name, `%${q}%`),
          ilike(restaurants.city, `%${q}%`),
          ilike(restaurants.description, `%${q}%`)
        )!
      );
    }

    if (cuisine) {
      conditions.push(ilike(restaurants.cuisineType, `%${cuisine}%`));
    }

    const result = await db
      .select()
      .from(restaurants)
      .where(and(...conditions))
      .orderBy(sql`${restaurants.isPremium} DESC, ${restaurants.name} ASC`);

    return NextResponse.json({ restaurants: result });
  } catch (error) {
    console.error("Restaurants API error:", error);
    return NextResponse.json(
      { error: "Chyba při načítání restaurací" },
      { status: 500 }
    );
  }
}

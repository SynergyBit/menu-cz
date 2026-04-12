import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, restaurants } from "@/db/schema";
import { eq, and, gte, desc, ilike, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const type = searchParams.get("type");

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Get active restaurants
    const activeRestaurants = await db
      .select({ id: restaurants.id, name: restaurants.name, slug: restaurants.slug, city: restaurants.city, logoUrl: restaurants.logoUrl })
      .from(restaurants)
      .where(eq(restaurants.isActive, true));

    const restaurantIds = activeRestaurants.map((r) => r.id);
    if (restaurantIds.length === 0) {
      return NextResponse.json({ events: [], cities: [] });
    }

    const restaurantMap = new Map(activeRestaurants.map((r) => [r.id, r]));

    const conditions = [
      inArray(events.restaurantId, restaurantIds),
      eq(events.isPublished, true),
      gte(events.eventDate, now),
    ];

    if (type) {
      conditions.push(eq(events.eventType, type));
    }

    const result = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.eventDate);

    let enriched = result.map((e) => ({
      ...e,
      restaurant: restaurantMap.get(e.restaurantId) || null,
    }));

    if (city) {
      enriched = enriched.filter((e) =>
        e.restaurant?.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    const cities = [...new Set(activeRestaurants.map((r) => r.city).filter(Boolean))] as string[];

    return NextResponse.json({ events: enriched, cities });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json({ events: [], cities: [] });
  }
}

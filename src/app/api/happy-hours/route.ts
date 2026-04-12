import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { happyHours, restaurants } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    const activeRestaurants = await db
      .select({ id: restaurants.id, name: restaurants.name, slug: restaurants.slug, city: restaurants.city, logoUrl: restaurants.logoUrl, address: restaurants.address })
      .from(restaurants)
      .where(eq(restaurants.isActive, true));

    const ids = activeRestaurants.map((r) => r.id);
    if (ids.length === 0) return NextResponse.json({ happyHours: [], cities: [] });

    const restaurantMap = new Map(activeRestaurants.map((r) => [r.id, r]));

    const result = await db
      .select()
      .from(happyHours)
      .where(and(inArray(happyHours.restaurantId, ids), eq(happyHours.isActive, true)));

    // Check which are active NOW
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7; // Monday=0
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let enriched = result.map((hh) => {
      const days = hh.daysOfWeek.split(",").map(Number);
      const isActiveToday = days.includes(currentDay);
      const isActiveNow = isActiveToday && currentTime >= hh.startTime && currentTime <= hh.endTime;

      // Minutes remaining
      let minutesRemaining: number | null = null;
      if (isActiveNow) {
        const [eh, em] = hh.endTime.split(":").map(Number);
        minutesRemaining = (eh * 60 + em) - (now.getHours() * 60 + now.getMinutes());
      }

      // Minutes until start (if today but not started yet)
      let minutesUntilStart: number | null = null;
      if (isActiveToday && !isActiveNow && currentTime < hh.startTime) {
        const [sh, sm] = hh.startTime.split(":").map(Number);
        minutesUntilStart = (sh * 60 + sm) - (now.getHours() * 60 + now.getMinutes());
      }

      return {
        ...hh,
        restaurant: restaurantMap.get(hh.restaurantId) || null,
        isActiveToday,
        isActiveNow,
        minutesRemaining,
        minutesUntilStart,
      };
    });

    if (city) {
      enriched = enriched.filter((hh) => hh.restaurant?.city?.toLowerCase().includes(city.toLowerCase()));
    }

    // Sort: active now first, then upcoming today, then rest
    enriched.sort((a, b) => {
      if (a.isActiveNow && !b.isActiveNow) return -1;
      if (!a.isActiveNow && b.isActiveNow) return 1;
      if (a.isActiveToday && !b.isActiveToday) return -1;
      if (!a.isActiveToday && b.isActiveToday) return 1;
      return a.startTime.localeCompare(b.startTime);
    });

    const cities = [...new Set(activeRestaurants.map((r) => r.city).filter(Boolean))] as string[];

    return NextResponse.json({ happyHours: enriched, cities });
  } catch (error) {
    console.error("Happy hours API error:", error);
    return NextResponse.json({ happyHours: [], cities: [] });
  }
}

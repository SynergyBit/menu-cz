import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, menuItems, openingHours, dailyMenus, reviews } from "@/db/schema";
import { eq, and, ilike, or, sql, count, gte, lte, avg, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const cuisine = searchParams.get("cuisine");

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

    if (result.length === 0) {
      return NextResponse.json({ restaurants: [] });
    }

    const restaurantIds = result.map((r) => r.id);

    // Batch: menu item counts
    const itemCounts = await db
      .select({ restaurantId: menuItems.restaurantId, count: count() })
      .from(menuItems)
      .where(inArray(menuItems.restaurantId, restaurantIds))
      .groupBy(menuItems.restaurantId);
    const itemCountMap = new Map(itemCounts.map((c) => [c.restaurantId, c.count]));

    // Batch: opening hours
    const allHours = await db
      .select()
      .from(openingHours)
      .where(inArray(openingHours.restaurantId, restaurantIds));
    const hoursMap = new Map<string, typeof allHours>();
    for (const h of allHours) {
      const arr = hoursMap.get(h.restaurantId) || [];
      arr.push(h);
      hoursMap.set(h.restaurantId, arr);
    }

    // Batch: today's daily menus
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMenus = await db
      .select({ restaurantId: dailyMenus.restaurantId })
      .from(dailyMenus)
      .where(
        and(
          inArray(dailyMenus.restaurantId, restaurantIds),
          gte(dailyMenus.date, today),
          lte(dailyMenus.date, tomorrow)
        )
      );
    const dailyMenuIds = new Set(todayMenus.map((m) => m.restaurantId));

    // Batch: ratings
    const ratings = await db
      .select({
        restaurantId: reviews.restaurantId,
        avgRating: avg(reviews.rating),
        reviewCount: count(),
      })
      .from(reviews)
      .where(and(inArray(reviews.restaurantId, restaurantIds), eq(reviews.isApproved, true)))
      .groupBy(reviews.restaurantId);
    const ratingMap = new Map(
      ratings.map((r) => [r.restaurantId, { avg: parseFloat(String(r.avgRating || 0)), count: r.reviewCount }])
    );

    // Check open now
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const enriched = result.map((r) => {
      const hours = hoursMap.get(r.id) || [];
      const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
      let isOpenNow = false;
      if (todayHours && !todayHours.isClosed && todayHours.openTime && todayHours.closeTime) {
        isOpenNow = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
      }

      const rating = ratingMap.get(r.id);

      return {
        ...r,
        menuItemCount: itemCountMap.get(r.id) || 0,
        hasDailyMenu: dailyMenuIds.has(r.id),
        isOpenNow,
        avgRating: rating?.avg || 0,
        reviewCount: rating?.count || 0,
      };
    });

    return NextResponse.json({ restaurants: enriched });
  } catch (error) {
    console.error("Restaurants API error:", error);
    return NextResponse.json({ error: "Chyba při načítání restaurací" }, { status: 500 });
  }
}

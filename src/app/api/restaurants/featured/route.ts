import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, reviews, dailyMenus } from "@/db/schema";
import { eq, and, desc, avg, count, gte, lte } from "drizzle-orm";

export async function GET() {
  try {
    // Get active restaurants
    const active = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.isActive, true));

    // Get ratings
    const ratings = await db
      .select({
        restaurantId: reviews.restaurantId,
        avgRating: avg(reviews.rating),
        reviewCount: count(),
      })
      .from(reviews)
      .where(eq(reviews.isApproved, true))
      .groupBy(reviews.restaurantId);

    const ratingMap = new Map(
      ratings.map((r) => [r.restaurantId, { avg: parseFloat(String(r.avgRating || 0)), count: r.reviewCount }])
    );

    // Today's daily menus
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMenus = await db
      .select({ restaurantId: dailyMenus.restaurantId })
      .from(dailyMenus)
      .where(and(gte(dailyMenus.date, today), lte(dailyMenus.date, tomorrow)));

    const dailyMenuIds = new Set(todayMenus.map((m) => m.restaurantId));

    // Enrich
    const enriched = active.map((r) => ({
      ...r,
      avgRating: ratingMap.get(r.id)?.avg || 0,
      reviewCount: ratingMap.get(r.id)?.count || 0,
      hasDailyMenu: dailyMenuIds.has(r.id),
    }));

    // Top rated (min 1 review)
    const topRated = enriched
      .filter((r) => r.reviewCount > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 4);

    // With daily menu today
    const withDailyMenu = enriched
      .filter((r) => r.hasDailyMenu)
      .slice(0, 4);

    // Newest
    const newest = enriched
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);

    return NextResponse.json({ topRated, withDailyMenu, newest });
  } catch (error) {
    console.error("Featured API error:", error);
    return NextResponse.json({ topRated: [], withDailyMenu: [], newest: [] });
  }
}

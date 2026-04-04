import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, menuItems, openingHours, dailyMenus, dailyMenuItems, reviews } from "@/db/schema";
import { eq, and, ilike, or, sql, count, gte, lte, avg } from "drizzle-orm";

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

    // Enrich with menu item counts and opening hours
    const enriched = await Promise.all(
      result.map(async (r) => {
        const [itemCount] = await db
          .select({ count: count() })
          .from(menuItems)
          .where(eq(menuItems.restaurantId, r.id));

        const hours = await db
          .select()
          .from(openingHours)
          .where(eq(openingHours.restaurantId, r.id))
          .orderBy(openingHours.dayOfWeek);

        // Check if has today's daily menu
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [todayMenu] = await db
          .select({ id: dailyMenus.id })
          .from(dailyMenus)
          .where(
            and(
              eq(dailyMenus.restaurantId, r.id),
              gte(dailyMenus.date, today),
              lte(dailyMenus.date, tomorrow)
            )
          )
          .limit(1);

        // Check if open now
        const now = new Date();
        const dayOfWeek = (now.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
        let isOpenNow = false;
        if (todayHours && !todayHours.isClosed && todayHours.openTime && todayHours.closeTime) {
          const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          isOpenNow = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
        }

        // Rating
        const [ratingStats] = await db
          .select({ avgRating: avg(reviews.rating), reviewCount: count() })
          .from(reviews)
          .where(and(eq(reviews.restaurantId, r.id), eq(reviews.isApproved, true)));

        return {
          ...r,
          menuItemCount: itemCount?.count || 0,
          hasDailyMenu: !!todayMenu,
          isOpenNow,
          avgRating: ratingStats.avgRating ? parseFloat(String(ratingStats.avgRating)) : 0,
          reviewCount: ratingStats.reviewCount || 0,
        };
      })
    );

    return NextResponse.json({ restaurants: enriched });
  } catch (error) {
    console.error("Restaurants API error:", error);
    return NextResponse.json(
      { error: "Chyba při načítání restaurací" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, dailyMenus, dailyMenuItems } from "@/db/schema";
import { eq, and, gte, lte, ilike, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's daily menus
    const menus = await db
      .select()
      .from(dailyMenus)
      .where(and(gte(dailyMenus.date, today), lte(dailyMenus.date, tomorrow)));

    if (menus.length === 0) {
      return NextResponse.json({ results: [], cities: [] });
    }

    const restaurantIds = menus.map((m) => m.restaurantId);

    // Get restaurants
    const conditions = [
      eq(restaurants.isActive, true),
      inArray(restaurants.id, restaurantIds),
    ];
    if (city) {
      conditions.push(ilike(restaurants.city, `%${city}%`));
    }

    const restaurantList = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        city: restaurants.city,
        address: restaurants.address,
        logoUrl: restaurants.logoUrl,
        cuisineType: restaurants.cuisineType,
        priceRange: restaurants.priceRange,
        isPremium: restaurants.isPremium,
      })
      .from(restaurants)
      .where(and(...conditions));

    const restaurantMap = new Map(restaurantList.map((r) => [r.id, r]));

    // Get all daily menu items
    const menuIds = menus
      .filter((m) => restaurantMap.has(m.restaurantId))
      .map((m) => m.id);

    if (menuIds.length === 0) {
      return NextResponse.json({ results: [], cities: [] });
    }

    const items = await db
      .select()
      .from(dailyMenuItems)
      .where(inArray(dailyMenuItems.dailyMenuId, menuIds))
      .orderBy(dailyMenuItems.sortOrder);

    // Build results
    const results = menus
      .filter((m) => restaurantMap.has(m.restaurantId))
      .map((menu) => ({
        restaurant: restaurantMap.get(menu.restaurantId)!,
        items: items.filter((i) => i.dailyMenuId === menu.id),
      }))
      .sort((a, b) => {
        // Premium first, then alphabetical
        if (a.restaurant.isPremium !== b.restaurant.isPremium) {
          return a.restaurant.isPremium ? -1 : 1;
        }
        return a.restaurant.name.localeCompare(b.restaurant.name);
      });

    // Get unique cities for filter
    const allCities = await db
      .select({ city: restaurants.city })
      .from(restaurants)
      .where(and(eq(restaurants.isActive, true), inArray(restaurants.id, restaurantIds)));

    const cities = [...new Set(allCities.map((r) => r.city).filter(Boolean))] as string[];

    return NextResponse.json({ results, cities });
  } catch (error) {
    console.error("Daily today error:", error);
    return NextResponse.json({ results: [], cities: [] });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, menuCategories, menuItems, dailyMenus, dailyMenuItems, openingHours } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(and(eq(restaurants.slug, slug), eq(restaurants.isActive, true)))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurace nenalezena" }, { status: 404 });
    }

    // Fetch categories with items
    const categories = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, restaurant.id))
      .orderBy(menuCategories.sortOrder);

    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurant.id))
      .orderBy(menuItems.sortOrder);

    const categoriesWithItems = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.categoryId === cat.id),
    }));

    // Today's daily menu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayMenu] = await db
      .select()
      .from(dailyMenus)
      .where(
        and(
          eq(dailyMenus.restaurantId, restaurant.id),
          gte(dailyMenus.date, today),
          lte(dailyMenus.date, tomorrow)
        )
      )
      .limit(1);

    let dailyItems: typeof dailyMenuItems.$inferSelect[] = [];
    if (todayMenu) {
      dailyItems = await db
        .select()
        .from(dailyMenuItems)
        .where(eq(dailyMenuItems.dailyMenuId, todayMenu.id))
        .orderBy(dailyMenuItems.sortOrder);
    }

    // Opening hours
    const hours = await db
      .select()
      .from(openingHours)
      .where(eq(openingHours.restaurantId, restaurant.id))
      .orderBy(openingHours.dayOfWeek);

    return NextResponse.json({
      restaurant,
      menu: categoriesWithItems,
      dailyMenu: todayMenu ? { ...todayMenu, items: dailyItems } : null,
      openingHours: hours,
    });
  } catch (error) {
    console.error("Restaurant detail error:", error);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}

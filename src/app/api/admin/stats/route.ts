import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, users, menuItems, dailyMenus } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { count, eq, gte, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  const [totalRestaurants] = await db.select({ count: count() }).from(restaurants);
  const [activeRestaurants] = await db.select({ count: count() }).from(restaurants).where(eq(restaurants.isActive, true));
  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalMenuItems] = await db.select({ count: count() }).from(menuItems);

  // Plans breakdown
  const planCounts = await db
    .select({ plan: restaurants.plan, count: count() })
    .from(restaurants)
    .groupBy(restaurants.plan);

  // Recent registrations (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const [recentRegistrations] = await db
    .select({ count: count() })
    .from(restaurants)
    .where(gte(restaurants.createdAt, weekAgo));

  // Today's daily menus
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayMenus] = await db
    .select({ count: count() })
    .from(dailyMenus)
    .where(gte(dailyMenus.date, today));

  return NextResponse.json({
    totalRestaurants: totalRestaurants.count,
    activeRestaurants: activeRestaurants.count,
    totalUsers: totalUsers.count,
    totalMenuItems: totalMenuItems.count,
    recentRegistrations: recentRegistrations.count,
    todayMenus: todayMenus.count,
    planBreakdown: planCounts.reduce(
      (acc, p) => ({ ...acc, [p.plan]: p.count }),
      {} as Record<string, number>
    ),
  });
}

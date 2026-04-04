import { NextResponse } from "next/server";
import { db } from "@/db";
import { pageViews } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, gte, count, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const restaurantId = session.restaurantId;

  // Total views
  const [total] = await db
    .select({ count: count() })
    .from(pageViews)
    .where(eq(pageViews.restaurantId, restaurantId));

  // Views by type
  const byType = await db
    .select({ viewType: pageViews.viewType, count: count() })
    .from(pageViews)
    .where(eq(pageViews.restaurantId, restaurantId))
    .groupBy(pageViews.viewType);

  // Last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [weekViews] = await db
    .select({ count: count() })
    .from(pageViews)
    .where(and(eq(pageViews.restaurantId, restaurantId), gte(pageViews.date, weekAgo)));

  // Last 30 days
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [monthViews] = await db
    .select({ count: count() })
    .from(pageViews)
    .where(and(eq(pageViews.restaurantId, restaurantId), gte(pageViews.date, monthAgo)));

  // Daily breakdown (last 7 days)
  const daily = await db
    .select({
      date: sql<string>`DATE(${pageViews.date})`,
      count: count(),
    })
    .from(pageViews)
    .where(and(eq(pageViews.restaurantId, restaurantId), gte(pageViews.date, weekAgo)))
    .groupBy(sql`DATE(${pageViews.date})`)
    .orderBy(sql`DATE(${pageViews.date})`);

  return NextResponse.json({
    totalViews: total.count,
    weekViews: weekViews.count,
    monthViews: monthViews.count,
    byType: byType.reduce((acc, t) => ({ ...acc, [t.viewType]: t.count }), {} as Record<string, number>),
    daily,
  });
}

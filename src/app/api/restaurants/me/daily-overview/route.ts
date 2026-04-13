import { NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, dailyMenus, dailyMenuItems, reservations, messages, reviews, pageViews, coupons, seasonalMenus } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, gte, lte, count, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  const rid = session.restaurantId;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  // Daily menu status
  const [todayMenu] = await db.select({ id: dailyMenus.id }).from(dailyMenus)
    .where(and(eq(dailyMenus.restaurantId, rid), gte(dailyMenus.date, today), lte(dailyMenus.date, tomorrow))).limit(1);
  let dailyMenuItemCount = 0;
  if (todayMenu) {
    const [c] = await db.select({ count: count() }).from(dailyMenuItems).where(eq(dailyMenuItems.dailyMenuId, todayMenu.id));
    dailyMenuItemCount = c.count;
  }

  // Today's reservations
  const todayReservations = await db.select().from(reservations)
    .where(and(eq(reservations.restaurantId, rid), gte(reservations.date, today), lte(reservations.date, tomorrow)))
    .orderBy(reservations.time);
  const pendingReservations = todayReservations.filter((r) => r.status === "pending").length;

  // Unread messages
  const [unreadMsgs] = await db.select({ count: count() }).from(messages)
    .where(and(eq(messages.restaurantId, rid), eq(messages.isRead, false)));

  // Today's views
  const [todayViews] = await db.select({ count: count() }).from(pageViews)
    .where(and(eq(pageViews.restaurantId, rid), gte(pageViews.date, today)));

  // Latest reviews
  const latestReviews = await db.select().from(reviews)
    .where(and(eq(reviews.restaurantId, rid), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt)).limit(3);

  // Active coupons
  const [activeCoupons] = await db.select({ count: count() }).from(coupons)
    .where(and(eq(coupons.restaurantId, rid), eq(coupons.isActive, true), gte(coupons.validUntil, today)));

  // Active seasonal menus
  const [activeSeasonals] = await db.select({ count: count() }).from(seasonalMenus)
    .where(and(eq(seasonalMenus.restaurantId, rid), eq(seasonalMenus.isActive, true), gte(seasonalMenus.validUntil, today), lte(seasonalMenus.validFrom, tomorrow)));

  return NextResponse.json({
    dailyMenu: { exists: !!todayMenu, itemCount: dailyMenuItemCount },
    reservations: { today: todayReservations.length, pending: pendingReservations, list: todayReservations.slice(0, 5) },
    unreadMessages: unreadMsgs.count,
    todayViews: todayViews.count,
    latestReviews,
    activeCoupons: activeCoupons.count,
    activeSeasonalMenus: activeSeasonals.count,
  });
}

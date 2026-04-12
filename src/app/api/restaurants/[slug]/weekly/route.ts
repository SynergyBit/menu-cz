import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, dailyMenus, dailyMenuItems } from "@/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [restaurant] = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.isActive, true)))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
  }

  // Current week Mon-Sun
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  const menus = await db
    .select()
    .from(dailyMenus)
    .where(
      and(
        eq(dailyMenus.restaurantId, restaurant.id),
        gte(dailyMenus.date, monday),
        lte(dailyMenus.date, sunday)
      )
    );

  const menuIds = menus.map((m) => m.id);
  let items: (typeof dailyMenuItems.$inferSelect)[] = [];
  if (menuIds.length > 0) {
    items = await db
      .select()
      .from(dailyMenuItems)
      .where(inArray(dailyMenuItems.dailyMenuId, menuIds))
      .orderBy(dailyMenuItems.sortOrder);
  }

  const dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
  const weekData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const menu = menus.find((m) => new Date(m.date).toISOString().split("T")[0] === dateStr);
    if (menu) {
      weekData.push({
        date: dateStr,
        dayName: dayNames[i],
        items: items.filter((it) => it.dailyMenuId === menu.id),
      });
    }
  }

  return NextResponse.json({ week: weekData });
}

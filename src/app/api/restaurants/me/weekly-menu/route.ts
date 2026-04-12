import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyMenus, dailyMenuItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, gte, lte, inArray } from "drizzle-orm";

function getWeekDates(offsetWeeks = 0): { start: Date; end: Date; dates: Date[] } {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  return { start: monday, end: sunday, dates };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const week = parseInt(searchParams.get("week") || "0");
  const { start, end, dates } = getWeekDates(week);

  const menus = await db
    .select()
    .from(dailyMenus)
    .where(
      and(
        eq(dailyMenus.restaurantId, session.restaurantId),
        gte(dailyMenus.date, start),
        lte(dailyMenus.date, end)
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

  // Build week structure
  const dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
  const weekData = dates.map((date, i) => {
    const dateStr = date.toISOString().split("T")[0];
    const menu = menus.find((m) => {
      const menuDate = new Date(m.date);
      return menuDate.toISOString().split("T")[0] === dateStr;
    });
    return {
      date: dateStr,
      dayName: dayNames[i],
      dayIndex: i,
      menu: menu || null,
      items: menu ? items.filter((item) => item.dailyMenuId === menu.id) : [],
    };
  });

  return NextResponse.json({ week: weekData, weekOffset: week });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const { action, date, items: newItems, sourceWeek } = await request.json();

    if (action === "saveDay") {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Delete existing menu for this day
      const existing = await db
        .select()
        .from(dailyMenus)
        .where(
          and(
            eq(dailyMenus.restaurantId, session.restaurantId),
            gte(dailyMenus.date, targetDate),
            lte(dailyMenus.date, nextDay)
          )
        );
      for (const m of existing) {
        await db.delete(dailyMenuItems).where(eq(dailyMenuItems.dailyMenuId, m.id));
        await db.delete(dailyMenus).where(eq(dailyMenus.id, m.id));
      }

      if (!newItems || newItems.length === 0) {
        return NextResponse.json({ success: true });
      }

      const [menu] = await db
        .insert(dailyMenus)
        .values({ restaurantId: session.restaurantId, date: targetDate })
        .returning();

      for (let i = 0; i < newItems.length; i++) {
        await db.insert(dailyMenuItems).values({
          dailyMenuId: menu.id,
          name: newItems[i].name,
          description: newItems[i].description || null,
          price: newItems[i].price,
          type: newItems[i].type || "main",
          sortOrder: i,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "copyWeek") {
      const source = getWeekDates(sourceWeek || -1);
      const target = getWeekDates(0);

      const sourceMenus = await db
        .select()
        .from(dailyMenus)
        .where(
          and(
            eq(dailyMenus.restaurantId, session.restaurantId),
            gte(dailyMenus.date, source.start),
            lte(dailyMenus.date, source.end)
          )
        );

      if (sourceMenus.length === 0) {
        return NextResponse.json({ error: "Zdrojový týden je prázdný" }, { status: 404 });
      }

      const sourceIds = sourceMenus.map((m) => m.id);
      const sourceItems = await db
        .select()
        .from(dailyMenuItems)
        .where(inArray(dailyMenuItems.dailyMenuId, sourceIds))
        .orderBy(dailyMenuItems.sortOrder);

      // For each source day, create corresponding target day
      for (let i = 0; i < 7; i++) {
        const sourceDate = source.dates[i].toISOString().split("T")[0];
        const sourceMenu = sourceMenus.find(
          (m) => new Date(m.date).toISOString().split("T")[0] === sourceDate
        );
        if (!sourceMenu) continue;

        const targetDate = target.dates[i];
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Delete existing
        const existing = await db
          .select()
          .from(dailyMenus)
          .where(
            and(
              eq(dailyMenus.restaurantId, session.restaurantId),
              gte(dailyMenus.date, targetDate),
              lte(dailyMenus.date, nextDay)
            )
          );
        for (const m of existing) {
          await db.delete(dailyMenuItems).where(eq(dailyMenuItems.dailyMenuId, m.id));
          await db.delete(dailyMenus).where(eq(dailyMenus.id, m.id));
        }

        const [newMenu] = await db
          .insert(dailyMenus)
          .values({ restaurantId: session.restaurantId, date: targetDate })
          .returning();

        const dayItems = sourceItems.filter((it) => it.dailyMenuId === sourceMenu.id);
        for (const item of dayItems) {
          await db.insert(dailyMenuItems).values({
            dailyMenuId: newMenu.id,
            name: item.name,
            description: item.description,
            price: item.price,
            type: item.type,
            sortOrder: item.sortOrder,
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Neznámá akce" }, { status: 400 });
  } catch (error) {
    console.error("Weekly menu error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

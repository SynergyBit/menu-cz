import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { dailyMenus, dailyMenuItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [menu] = await db
    .select()
    .from(dailyMenus)
    .where(
      and(
        eq(dailyMenus.restaurantId, session.restaurantId),
        gte(dailyMenus.date, today),
        lte(dailyMenus.date, tomorrow)
      )
    )
    .limit(1);

  if (!menu) {
    return NextResponse.json({ dailyMenu: null, items: [] });
  }

  const items = await db
    .select()
    .from(dailyMenuItems)
    .where(eq(dailyMenuItems.dailyMenuId, menu.id))
    .orderBy(dailyMenuItems.sortOrder);

  return NextResponse.json({ dailyMenu: menu, items });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const { action, ...data } = await request.json();

    if (action === "createMenu") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Delete existing today's menu
      const existing = await db
        .select()
        .from(dailyMenus)
        .where(
          and(
            eq(dailyMenus.restaurantId, session.restaurantId),
            gte(dailyMenus.date, today),
            lte(dailyMenus.date, tomorrow)
          )
        );

      for (const m of existing) {
        await db.delete(dailyMenuItems).where(eq(dailyMenuItems.dailyMenuId, m.id));
        await db.delete(dailyMenus).where(eq(dailyMenus.id, m.id));
      }

      const [menu] = await db
        .insert(dailyMenus)
        .values({
          restaurantId: session.restaurantId,
          date: today,
        })
        .returning();

      return NextResponse.json({ dailyMenu: menu });
    }

    if (action === "addItem") {
      const [item] = await db
        .insert(dailyMenuItems)
        .values({
          dailyMenuId: data.dailyMenuId,
          name: data.name,
          description: data.description || null,
          price: data.price,
          type: data.type || "main",
          sortOrder: data.sortOrder || 0,
        })
        .returning();
      return NextResponse.json({ item });
    }

    if (action === "deleteItem") {
      await db.delete(dailyMenuItems).where(eq(dailyMenuItems.id, data.id));
      return NextResponse.json({ success: true });
    }

    if (action === "copyPrevious") {
      // Find yesterday's menu
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const dayAfterYesterday = new Date(yesterday);
      dayAfterYesterday.setDate(dayAfterYesterday.getDate() + 1);

      const [prevMenu] = await db
        .select()
        .from(dailyMenus)
        .where(
          and(
            eq(dailyMenus.restaurantId, session.restaurantId),
            gte(dailyMenus.date, yesterday),
            lte(dailyMenus.date, dayAfterYesterday)
          )
        )
        .limit(1);

      if (!prevMenu) {
        return NextResponse.json({ error: "Včerejší menu nenalezeno" }, { status: 404 });
      }

      const prevItems = await db
        .select()
        .from(dailyMenuItems)
        .where(eq(dailyMenuItems.dailyMenuId, prevMenu.id))
        .orderBy(dailyMenuItems.sortOrder);

      if (prevItems.length === 0) {
        return NextResponse.json({ error: "Včerejší menu je prázdné" }, { status: 404 });
      }

      // Create today's menu
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Delete existing today if any
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const existing = await db
        .select()
        .from(dailyMenus)
        .where(
          and(
            eq(dailyMenus.restaurantId, session.restaurantId),
            gte(dailyMenus.date, today),
            lte(dailyMenus.date, tomorrow)
          )
        );
      for (const m of existing) {
        await db.delete(dailyMenuItems).where(eq(dailyMenuItems.dailyMenuId, m.id));
        await db.delete(dailyMenus).where(eq(dailyMenus.id, m.id));
      }

      const [newMenu] = await db
        .insert(dailyMenus)
        .values({ restaurantId: session.restaurantId, date: today })
        .returning();

      // Copy items
      for (const item of prevItems) {
        await db.insert(dailyMenuItems).values({
          dailyMenuId: newMenu.id,
          name: item.name,
          description: item.description,
          price: item.price,
          type: item.type,
          sortOrder: item.sortOrder,
        });
      }

      const newItems = await db
        .select()
        .from(dailyMenuItems)
        .where(eq(dailyMenuItems.dailyMenuId, newMenu.id))
        .orderBy(dailyMenuItems.sortOrder);

      return NextResponse.json({ dailyMenu: newMenu, items: newItems });
    }

    return NextResponse.json({ error: "Neznámá akce" }, { status: 400 });
  } catch (error) {
    console.error("Daily menu error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

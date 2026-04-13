import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menuTemplates, restaurants, dailyMenus, dailyMenuItems } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  // Check premium
  const [rest] = await db.select({ plan: restaurants.plan }).from(restaurants).where(eq(restaurants.id, session.restaurantId)).limit(1);
  if (!rest || rest.plan === "free") {
    return NextResponse.json({ error: "Šablony vyžadují plán Standard nebo Premium" }, { status: 403 });
  }

  const templates = await db.select().from(menuTemplates)
    .where(eq(menuTemplates.restaurantId, session.restaurantId))
    .orderBy(desc(menuTemplates.createdAt));

  return NextResponse.json({
    templates: templates.map((t) => ({ ...t, items: JSON.parse(t.items) })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  const [rest] = await db.select({ plan: restaurants.plan }).from(restaurants).where(eq(restaurants.id, session.restaurantId)).limit(1);
  if (!rest || rest.plan === "free") {
    return NextResponse.json({ error: "Šablony vyžadují plán Standard nebo Premium" }, { status: 403 });
  }

  try {
    const { action, name, items, templateId, date } = await request.json();

    // Save current daily menu as template
    if (action === "saveAsTemplate") {
      if (!name) return NextResponse.json({ error: "Název šablony je povinný" }, { status: 400 });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayMenu] = await db.select().from(dailyMenus)
        .where(and(eq(dailyMenus.restaurantId, session.restaurantId), gte(dailyMenus.date, today), lte(dailyMenus.date, tomorrow)))
        .limit(1);

      if (!todayMenu) return NextResponse.json({ error: "Dnes nemáte denní menu" }, { status: 404 });

      const todayItems = await db.select().from(dailyMenuItems)
        .where(eq(dailyMenuItems.dailyMenuId, todayMenu.id))
        .orderBy(dailyMenuItems.sortOrder);

      if (todayItems.length === 0) return NextResponse.json({ error: "Denní menu je prázdné" }, { status: 404 });

      const [template] = await db.insert(menuTemplates).values({
        restaurantId: session.restaurantId,
        name,
        items: JSON.stringify(todayItems.map((i) => ({ name: i.name, description: i.description, price: i.price, type: i.type }))),
      }).returning();

      return NextResponse.json({ template: { ...template, items: JSON.parse(template.items) } });
    }

    // Save custom items as template
    if (action === "saveCustomTemplate") {
      if (!name || !items || items.length === 0) return NextResponse.json({ error: "Název a položky jsou povinné" }, { status: 400 });

      const [template] = await db.insert(menuTemplates).values({
        restaurantId: session.restaurantId,
        name,
        items: JSON.stringify(items),
      }).returning();

      return NextResponse.json({ template: { ...template, items: JSON.parse(template.items) } });
    }

    // Apply template to a date
    if (action === "applyTemplate") {
      if (!templateId || !date) return NextResponse.json({ error: "Šablona a datum jsou povinné" }, { status: 400 });

      const [template] = await db.select().from(menuTemplates).where(and(eq(menuTemplates.id, templateId), eq(menuTemplates.restaurantId, session.restaurantId))).limit(1);
      if (!template) return NextResponse.json({ error: "Šablona nenalezena" }, { status: 404 });

      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Delete existing menu for target date
      const existing = await db.select().from(dailyMenus)
        .where(and(eq(dailyMenus.restaurantId, session.restaurantId), gte(dailyMenus.date, targetDate), lte(dailyMenus.date, nextDay)));
      for (const m of existing) {
        await db.delete(dailyMenuItems).where(eq(dailyMenuItems.dailyMenuId, m.id));
        await db.delete(dailyMenus).where(eq(dailyMenus.id, m.id));
      }

      // Create new menu from template
      const [newMenu] = await db.insert(dailyMenus).values({ restaurantId: session.restaurantId, date: targetDate }).returning();
      const templateItems = JSON.parse(template.items);

      for (let i = 0; i < templateItems.length; i++) {
        await db.insert(dailyMenuItems).values({
          dailyMenuId: newMenu.id,
          name: templateItems[i].name,
          description: templateItems[i].description || null,
          price: templateItems[i].price,
          type: templateItems[i].type || "main",
          sortOrder: i,
        });
      }

      return NextResponse.json({ success: true });
    }

    // Delete template
    if (action === "deleteTemplate") {
      if (!templateId) return NextResponse.json({ error: "Chybí ID" }, { status: 400 });
      await db.delete(menuTemplates).where(and(eq(menuTemplates.id, templateId), eq(menuTemplates.restaurantId, session.restaurantId)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Neznámá akce" }, { status: 400 });
  } catch (error) {
    console.error("Template error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

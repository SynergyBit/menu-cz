import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { seasonalMenus, restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  const result = await db.select().from(seasonalMenus).where(eq(seasonalMenus.restaurantId, session.restaurantId)).orderBy(desc(seasonalMenus.createdAt));
  return NextResponse.json({ menus: result.map((m) => ({ ...m, items: JSON.parse(m.items) })) });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  const [rest] = await db.select({ plan: restaurants.plan }).from(restaurants).where(eq(restaurants.id, session.restaurantId)).limit(1);
  if (!rest || rest.plan !== "premium") return NextResponse.json({ error: "Sezónní menu vyžaduje plán Premium" }, { status: 403 });

  try {
    const body = await request.json();
    if (!body.title || !body.validFrom || !body.validUntil || !body.items?.length) {
      return NextResponse.json({ error: "Název, data a položky jsou povinné" }, { status: 400 });
    }
    const [menu] = await db.insert(seasonalMenus).values({
      restaurantId: session.restaurantId,
      title: body.title,
      description: body.description || null,
      items: JSON.stringify(body.items),
      coverImage: body.coverImage || null,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
    }).returning();
    return NextResponse.json({ menu: { ...menu, items: JSON.parse(menu.items) } });
  } catch (error) {
    console.error("Seasonal menu error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) await db.delete(seasonalMenus).where(eq(seasonalMenus.id, id));
  return NextResponse.json({ success: true });
}

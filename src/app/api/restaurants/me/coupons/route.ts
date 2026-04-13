import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons, restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  const result = await db.select().from(coupons).where(eq(coupons.restaurantId, session.restaurantId)).orderBy(desc(coupons.createdAt));
  return NextResponse.json({ coupons: result });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  const [rest] = await db.select({ plan: restaurants.plan }).from(restaurants).where(eq(restaurants.id, session.restaurantId)).limit(1);
  if (!rest || rest.plan === "free") return NextResponse.json({ error: "Kupóny vyžadují plán Standard nebo Premium" }, { status: 403 });

  try {
    const body = await request.json();
    if (!body.title || !body.code || !body.validFrom || !body.validUntil) {
      return NextResponse.json({ error: "Název, kód, datum od a do jsou povinné" }, { status: 400 });
    }
    const [coupon] = await db.insert(coupons).values({
      restaurantId: session.restaurantId,
      title: body.title,
      description: body.description || null,
      code: body.code.toUpperCase(),
      discountType: body.discountType || "percent",
      discountValue: body.discountValue || null,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      maxUses: body.maxUses ? Number(body.maxUses) : null,
    }).returning();
    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Coupon error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) await db.delete(coupons).where(and(eq(coupons.id, id), eq(coupons.restaurantId, session.restaurantId)));
  return NextResponse.json({ success: true });
}

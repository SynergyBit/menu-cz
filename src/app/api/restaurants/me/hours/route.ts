import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { openingHours } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const hours = await db
    .select()
    .from(openingHours)
    .where(eq(openingHours.restaurantId, session.restaurantId))
    .orderBy(openingHours.dayOfWeek);

  return NextResponse.json({ hours });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const { hours: hoursData } = await request.json();

    // Delete existing and reinsert
    await db.delete(openingHours).where(eq(openingHours.restaurantId, session.restaurantId));

    if (hoursData && hoursData.length > 0) {
      await db.insert(openingHours).values(
        hoursData.map((h: { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }) => ({
          restaurantId: session.restaurantId,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        }))
      );
    }

    const result = await db
      .select()
      .from(openingHours)
      .where(eq(openingHours.restaurantId, session.restaurantId!))
      .orderBy(openingHours.dayOfWeek);

    return NextResponse.json({ hours: result });
  } catch (error) {
    console.error("Hours API error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

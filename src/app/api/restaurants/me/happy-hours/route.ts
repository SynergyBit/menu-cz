import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { happyHours } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(happyHours)
    .where(eq(happyHours.restaurantId, session.restaurantId));

  return NextResponse.json({ happyHours: result });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const { title, description, discount, startTime, endTime, daysOfWeek } = await request.json();

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: "Název, začátek a konec jsou povinné" }, { status: 400 });
    }

    const [hh] = await db
      .insert(happyHours)
      .values({
        restaurantId: session.restaurantId,
        title,
        description: description || null,
        discount: discount || null,
        startTime,
        endTime,
        daysOfWeek: daysOfWeek || "0,1,2,3,4",
      })
      .returning();

    return NextResponse.json({ happyHour: hh });
  } catch (error) {
    console.error("Happy hour create error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { id, isActive } = await request.json();
  await db.update(happyHours).set({ isActive }).where(and(eq(happyHours.id, id), eq(happyHours.restaurantId, session.restaurantId)));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    await db.delete(happyHours).where(and(eq(happyHours.id, id), eq(happyHours.restaurantId, session.restaurantId)));
  }
  return NextResponse.json({ success: true });
}

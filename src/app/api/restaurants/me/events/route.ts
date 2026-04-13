import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(events)
    .where(eq(events.restaurantId, session.restaurantId))
    .orderBy(desc(events.eventDate));

  return NextResponse.json({ events: result });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const { title, description, eventDate, eventTime, endTime, eventType } = await request.json();

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Název a datum jsou povinné" }, { status: 400 });
    }

    const [event] = await db
      .insert(events)
      .values({
        restaurantId: session.restaurantId,
        title,
        description: description || null,
        eventDate: new Date(eventDate),
        eventTime: eventTime || null,
        endTime: endTime || null,
        eventType: eventType || "other",
      })
      .returning();

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Event create error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Chybí ID" }, { status: 400 });

  await db.delete(events).where(and(eq(events.id, id), eq(events.restaurantId, session.restaurantId)));
  return NextResponse.json({ success: true });
}

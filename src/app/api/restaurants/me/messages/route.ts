import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and, count } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.restaurantId, session.restaurantId))
    .orderBy(desc(messages.createdAt))
    .limit(100);

  const [unread] = await db
    .select({ count: count() })
    .from(messages)
    .where(and(eq(messages.restaurantId, session.restaurantId), eq(messages.isRead, false)));

  return NextResponse.json({ messages: result, unreadCount: unread.count });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { id, isRead } = await request.json();

  await db.update(messages).set({ isRead }).where(and(eq(messages.id, id), eq(messages.restaurantId, session.restaurantId)));

  return NextResponse.json({ success: true });
}

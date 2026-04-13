import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and, gte } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  const result = await db.select().from(reservations)
    .where(eq(reservations.restaurantId, session.restaurantId))
    .orderBy(desc(reservations.date))
    .limit(200);

  // Count by status
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = result.filter((r) => new Date(r.date) >= today);
  const pending = upcoming.filter((r) => r.status === "pending").length;

  return NextResponse.json({ reservations: result, pendingCount: pending });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.restaurantId) return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });

  const { id, status, adminNote } = await request.json();
  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (adminNote !== undefined) updates.adminNote = adminNote;

  await db.update(reservations).set(updates).where(eq(reservations.id, id));
  return NextResponse.json({ success: true });
}

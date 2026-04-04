import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteSessionCookie } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const [user] = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
  }).from(users).where(eq(users.id, session.userId)).limit(1);

  if (!user) {
    return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 });
  }

  let restaurant = null;
  if (user.role === "restaurant" && session.restaurantId) {
    const [r] = await db.select().from(restaurants).where(eq(restaurants.id, session.restaurantId)).limit(1);
    restaurant = r || null;
  }

  return NextResponse.json({ user, restaurant });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", deleteSessionCookie());
  return response;
}

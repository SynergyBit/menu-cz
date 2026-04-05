import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { isStrongPassword, checkRateLimit } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`password:${ip}`, 5, 900000)) {
    return NextResponse.json({ error: "Příliš mnoho pokusů" }, { status: 429 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Obě pole jsou povinná" }, { status: 400 });
    }

    const pwCheck = isStrongPassword(newPassword);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Uživatel nenalezen" }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Nesprávné aktuální heslo" }, { status: 401 });
    }

    const hashed = await hashPassword(newPassword);
    await db.update(users).set({ password: hashed }).where(eq(users.id, session.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, restaurants } from "@/db/schema";
import { verifyPassword, createToken, createSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sanitize, checkRateLimit } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`login:${ip}`, 10, 900000)) { // 10 attempts per 15min
      return NextResponse.json({ error: "Příliš mnoho pokusů. Zkuste to za 15 minut." }, { status: 429 });
    }

    const body = await request.json();
    const email = sanitize(body.email).toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Email a heslo jsou povinné" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Neplatné přihlašovací údaje" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Neplatné přihlašovací údaje" }, { status: 401 });
    }

    let restaurantId: string | undefined;
    if (user.role === "restaurant") {
      const [rest] = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.userId, user.id))
        .limit(1);
      restaurantId = rest?.id;
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    response.headers.set("Set-Cookie", createSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Chyba při přihlášení" }, { status: 500 });
  }
}

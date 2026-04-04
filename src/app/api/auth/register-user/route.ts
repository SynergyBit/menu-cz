import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createToken, createSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sanitize, isValidEmail, isStrongPassword, checkRateLimit } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`register-user:${ip}`, 5, 3600000)) {
      return NextResponse.json({ error: "Příliš mnoho pokusů. Zkuste to později." }, { status: 429 });
    }

    const body = await request.json();
    const email = sanitize(body.email).toLowerCase();
    const password = body.password;
    const name = sanitize(body.name);

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Všechna pole jsou povinná" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Neplatný formát emailu" }, { status: 400 });
    }

    const pwCheck = isStrongPassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "Jméno je příliš dlouhé" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email je již registrován" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({ email, password: hashedPassword, name, role: "user" })
      .returning();

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    response.headers.set("Set-Cookie", createSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Register user error:", error);
    return NextResponse.json({ error: "Chyba při registraci" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createToken, createSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Všechna pole jsou povinná" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Heslo musí mít alespoň 6 znaků" }, { status: 400 });
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

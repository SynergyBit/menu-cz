import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, restaurants } from "@/db/schema";
import { hashPassword, createToken, createSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, restaurantName } = await request.json();

    if (!email || !password || !name || !restaurantName) {
      return NextResponse.json(
        { error: "Všechna pole jsou povinná" },
        { status: 400 }
      );
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email je již registrován" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({ email, password: hashedPassword, name, role: "restaurant" })
      .returning();

    let slug = generateSlug(restaurantName);
    const existingSlug = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
    if (existingSlug.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const [restaurant] = await db
      .insert(restaurants)
      .values({
        userId: user.id,
        name: restaurantName,
        slug,
        isActive: false,
      })
      .returning();

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId: restaurant.id,
    });

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    response.headers.set("Set-Cookie", createSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Chyba při registraci" }, { status: 500 });
  }
}

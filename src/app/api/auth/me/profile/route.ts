import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sanitize } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = sanitize(body.name);

    if (!name || name.length < 1) {
      return NextResponse.json({ error: "Jméno je povinné" }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "Jméno je příliš dlouhé" }, { status: 400 });
    }

    await db.update(users).set({ name }).where(eq(users.id, session.userId));

    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

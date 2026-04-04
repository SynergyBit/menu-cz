import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.userId))
    .limit(1);

  return NextResponse.json({
    preferences: prefs
      ? {
          ...prefs,
          dietaryPreferences: prefs.dietaryPreferences ? JSON.parse(prefs.dietaryPreferences) : [],
          favoritesCuisines: prefs.favoritesCuisines ? JSON.parse(prefs.favoritesCuisines) : [],
        }
      : null,
  });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const { dietaryPreferences, favoritesCuisines, defaultCity } = await request.json();

  const [existing] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.userId))
    .limit(1);

  const data = {
    dietaryPreferences: dietaryPreferences ? JSON.stringify(dietaryPreferences) : null,
    favoritesCuisines: favoritesCuisines ? JSON.stringify(favoritesCuisines) : null,
    defaultCity: defaultCity || null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(userPreferences).set(data).where(eq(userPreferences.userId, session.userId));
  } else {
    await db.insert(userPreferences).values({ userId: session.userId, ...data });
  }

  return NextResponse.json({ success: true });
}

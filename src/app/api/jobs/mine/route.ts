import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobOffers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.restaurantId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(jobOffers)
    .where(eq(jobOffers.restaurantId, session.restaurantId))
    .orderBy(desc(jobOffers.createdAt));
  return NextResponse.json({ jobs: rows });
}

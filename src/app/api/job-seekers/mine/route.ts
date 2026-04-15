import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobSeekers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, session.userId))
    .orderBy(desc(jobSeekers.createdAt));
  return NextResponse.json({ seekers: rows });
}

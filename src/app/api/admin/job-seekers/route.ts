import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobSeekers } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(jobSeekers)
    .orderBy(desc(jobSeekers.createdAt))
    .limit(500);
  return NextResponse.json({ seekers: rows });
}

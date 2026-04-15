import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobSeekers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.isApproved === "boolean") patch.isApproved = body.isApproved;
  if (typeof body.isFeatured === "boolean") patch.isFeatured = body.isFeatured;

  const [updated] = await db
    .update(jobSeekers)
    .set(patch)
    .where(eq(jobSeekers.id, id))
    .returning();
  return NextResponse.json({ seeker: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await db.delete(jobSeekers).where(eq(jobSeekers.id, id));
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobOffers } from "@/db/schema";
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
    .update(jobOffers)
    .set(patch)
    .where(eq(jobOffers.id, id))
    .returning();

  return NextResponse.json({ job: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await db.delete(jobOffers).where(eq(jobOffers.id, id));
  return NextResponse.json({ success: true });
}

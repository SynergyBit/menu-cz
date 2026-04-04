import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, restaurants } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  const result = await db
    .select({
      id: reviews.id,
      authorName: reviews.authorName,
      rating: reviews.rating,
      comment: reviews.comment,
      isApproved: reviews.isApproved,
      createdAt: reviews.createdAt,
      restaurantName: restaurants.name,
      restaurantSlug: restaurants.slug,
    })
    .from(reviews)
    .leftJoin(restaurants, eq(reviews.restaurantId, restaurants.id))
    .orderBy(desc(reviews.createdAt))
    .limit(100);

  return NextResponse.json({ reviews: result });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  const { id, isApproved } = await request.json();
  await db.update(reviews).set({ isApproved }).where(eq(reviews.id, id));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Přístup odepřen" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    await db.delete(reviews).where(eq(reviews.id, id));
  }
  return NextResponse.json({ success: true });
}

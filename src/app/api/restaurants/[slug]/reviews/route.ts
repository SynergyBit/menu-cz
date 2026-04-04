import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { restaurants, reviews } from "@/db/schema";
import { eq, and, desc, avg, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { sanitize, checkRateLimit } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [restaurant] = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
  }

  const reviewList = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.restaurantId, restaurant.id), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(50);

  const [stats] = await db
    .select({
      avgRating: avg(reviews.rating),
      totalReviews: count(),
    })
    .from(reviews)
    .where(and(eq(reviews.restaurantId, restaurant.id), eq(reviews.isApproved, true)));

  return NextResponse.json({
    reviews: reviewList,
    avgRating: stats.avgRating ? parseFloat(String(stats.avgRating)) : 0,
    totalReviews: stats.totalReviews,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [restaurant] = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json({ error: "Nenalezeno" }, { status: 404 });
  }

  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`review:${ip}`, 5, 3600000)) {
      return NextResponse.json({ error: "Příliš mnoho recenzí. Zkuste to později." }, { status: 429 });
    }

    const body = await request.json();
    const authorName = sanitize(body.authorName);
    const authorEmail = sanitize(body.authorEmail);
    const rating = Number(body.rating);
    const comment = sanitize(body.comment);

    if (!authorName || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Jméno a hodnocení jsou povinné" }, { status: 400 });
    }

    if (authorName.length > 100 || (comment && comment.length > 2000)) {
      return NextResponse.json({ error: "Příliš dlouhý text" }, { status: 400 });
    }

    // Attach user if logged in
    const session = await getSession();

    const [review] = await db
      .insert(reviews)
      .values({
        restaurantId: restaurant.id,
        userId: session?.userId || null,
        authorName,
        authorEmail: authorEmail || null,
        rating,
        comment: comment || null,
      })
      .returning();

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Chyba" }, { status: 500 });
  }
}

import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Distributed rate limit backed by Postgres.
 * Atomic: single UPSERT returns the new count after increment/reset.
 * Returns true if request is allowed, false if limit exceeded.
 */
export async function checkRateLimitDb(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  const resetAt = new Date(Date.now() + windowMs);
  try {
    const rows = await db
      .insert(rateLimits)
      .values({ key, count: 1, resetAt })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`CASE WHEN ${rateLimits.resetAt} < NOW() THEN 1 ELSE ${rateLimits.count} + 1 END`,
          resetAt: sql`CASE WHEN ${rateLimits.resetAt} < NOW() THEN ${resetAt} ELSE ${rateLimits.resetAt} END`,
        },
      })
      .returning({ count: rateLimits.count });
    const count = rows[0]?.count ?? 1;
    return count <= maxRequests;
  } catch {
    // Fail-open on DB error to avoid breaking the app; log server-side.
    return true;
  }
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

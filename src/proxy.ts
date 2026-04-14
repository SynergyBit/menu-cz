import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const jwtSecretRaw = process.env.JWT_SECRET;
if (!jwtSecretRaw) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = new TextEncoder().encode(jwtSecretRaw);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("__session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/prihlaseni", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "restaurant" && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/prihlaseni", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/prihlaseni", request.url));
    }
  }

  // Protect admin routes (pages + API)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isApi = pathname.startsWith("/api/");
    const token = request.cookies.get("__session")?.value;
    const unauth = () =>
      isApi
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/prihlaseni", request.url));
    const forbidden = () =>
      isApi
        ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/", request.url));

    if (!token) return unauth();
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "admin") return forbidden();
    } catch {
      return unauth();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
};

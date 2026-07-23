import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Protects dashboard routes.
 * Runs on Edge Runtime — CANNOT use Prisma or Node.js-only modules.
 * Only checks for session token cookie presence.
 * Full auth validation happens in the server components/API routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  const publicPaths = ["/", "/login", "/registro", "/api/auth"];
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isPublic) return NextResponse.next();

  // Check for session cookie (set by NextAuth)
  const sessionToken =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

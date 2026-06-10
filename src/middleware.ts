import { NextResponse, type NextRequest } from "next/server";

// Middleware berjalan di Edge Runtime — tidak import @supabase/ssr di sini.
// Auth verification yang sesungguhnya dilakukan di DashboardLayout (Server Component).
// Middleware hanya melakukan redirect kasar berdasarkan cookie.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Explicit allowlist — bypass auth check
  const isPublicPath = ["/login", "/register"].some((p) =>
    pathname.startsWith(p)
  );
  const isPortalPath =
    pathname.startsWith("/portal") || pathname.startsWith("/api/portal");

  if (isPublicPath || isPortalPath) {
    return NextResponse.next();
  }

  const isDashboardPath =
    pathname.startsWith("/dashboard") || pathname === "/";
  const isProtectedApiPath =
    pathname.startsWith("/api/") && !isPortalPath;

  if (!isDashboardPath && !isProtectedApiPath) {
    return NextResponse.next();
  }

  // Cek keberadaan Supabase auth token cookie
  // Format normal: sb-[ref]-auth-token
  // Format chunked (token panjang): sb-[ref]-auth-token.0, .1, dst.
  const hasAuthToken = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
    );

  if (!hasAuthToken) {
    if (isProtectedApiPath) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

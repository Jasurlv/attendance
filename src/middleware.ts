import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Admin pages need a valid session cookie. The mobile API (added later) lives under
// /api/mobile and uses its own token check, so it is excluded here.
export async function middleware(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const onLogin = req.nextUrl.pathname === "/login";

  if (!session && !onLogin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (session && onLogin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/mobile|_next/static|_next/image|favicon.ico).*)"],
};

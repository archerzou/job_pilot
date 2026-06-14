import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ACCESS_TOKEN_COOKIE } from "@insforge/sdk/ssr";

const PROTECTED_PATHS = ["/dashboard", "/profile", "/find-jobs"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  if (!request.cookies.has(DEFAULT_ACCESS_TOKEN_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/find-jobs/:path*"],
};

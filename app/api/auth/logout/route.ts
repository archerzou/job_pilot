import { NextRequest, NextResponse } from "next/server";
import { createServerClient, clearAuthCookies } from "@insforge/sdk/ssr";

export async function POST(request: NextRequest) {
  const client = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: request.cookies,
  });

  await client.auth.signOut();

  const response = NextResponse.redirect(new URL("/", request.url));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clearAuthCookies(response.cookies as any);
  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { setAuthCookies } from "@insforge/sdk/ssr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("insforge_code");
  const codeVerifier = request.cookies.get("insforge-pkce-verifier")?.value;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    isServerMode: true,
  });

  const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.accessToken) {
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAuthCookies(response.cookies as any, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
  });

  response.cookies.delete("insforge-pkce-verifier");

  return response;
}

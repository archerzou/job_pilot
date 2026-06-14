import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const origin = request.nextUrl.origin;

  const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    isServerMode: true,
  });

  const { data, error } = await insforge.auth.signInWithOAuth(provider, {
    redirectTo: `${origin}/api/auth/callback`,
    skipBrowserRedirect: true,
  });

  if (error || !data?.url) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const response = NextResponse.redirect(data.url);

  if (data.codeVerifier) {
    response.cookies.set("insforge-pkce-verifier", data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }

  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";
import { setAuthCookies } from "@insforge/sdk/ssr";
import { getPostHogClient } from "@/lib/posthog-server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("insforge_code");
  const codeVerifier = request.cookies.get("insforge-pkce-verifier")?.value;

  if (!code) {
    const posthog = getPostHogClient();
    posthog.capture({ distinctId: "anonymous", event: "login_failed", properties: { reason: "no_code" } });
    await posthog.shutdown();
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    isServerMode: true,
  });

  const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.accessToken) {
    const posthog = getPostHogClient();
    posthog.capture({ distinctId: "anonymous", event: "login_failed", properties: { reason: "exchange_failed" } });
    await posthog.shutdown();
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }

  const userId = getSubFromToken(data.accessToken);
  const posthog = getPostHogClient();
  if (userId) {
    posthog.identify({ distinctId: userId });
    posthog.capture({ distinctId: userId, event: "login_completed" });
  }
  await posthog.shutdown();

  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  // InsForge SDK's setAuthCookies expects its own internal cookie type;
  // NextResponse.cookies is compatible at runtime but diverges in TS generics.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAuthCookies(response.cookies as any, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
  });

  response.cookies.delete("insforge-pkce-verifier");

  return response;
}

function getSubFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

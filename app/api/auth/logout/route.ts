import { NextRequest, NextResponse } from "next/server";
import { createServerClient, clearAuthCookies } from "@insforge/sdk/ssr";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: NextRequest) {
  const client = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: request.cookies,
  });

  const { data: userData } = await client.auth.getCurrentUser();
  const userId = userData?.user?.id;

  await client.auth.signOut();

  if (userId) {
    const posthog = getPostHogClient();
    posthog.capture({ distinctId: userId, event: "logout_completed" });
    await posthog.shutdown();
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clearAuthCookies(response.cookies as any);
  return response;
}

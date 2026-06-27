import { NextResponse } from "next/server";
import {
  DEFAULT_ACCESS_TOKEN_COOKIE,
  DEFAULT_REFRESH_TOKEN_COOKIE,
} from "@insforge/sdk/ssr";
import { getServerClient } from "@/lib/auth";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST() {
  let userId: string | undefined;

  try {
    const client = await getServerClient();
    const { data: userData } = await client.auth.getCurrentUser();
    userId = userData?.user?.id;
    await client.auth.signOut();
  } catch {
    // Continue to clear cookies even if signOut fails
  }

  if (userId) {
    try {
      const posthog = getPostHogClient();
      posthog.capture({ distinctId: userId, event: "logout_completed" });
      await posthog.shutdown();
    } catch {
      // Non-fatal
    }
  }

  // Return 200 — client handles the /login redirect after fetch resolves
  const response = new NextResponse(null, { status: 200 });
  response.cookies.delete(DEFAULT_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(DEFAULT_REFRESH_TOKEN_COOKIE);
  return response;
}

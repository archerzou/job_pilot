import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserSchema } from "@insforge/sdk";

function insforgeConfig() {
  return {
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
  };
}

export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient({
    ...insforgeConfig(),
    cookies: cookieStore,
  });
}

export async function getUser(): Promise<UserSchema | null> {
  const client = await getServerClient();
  const { data } = await client.auth.getCurrentUser();
  return data?.user ?? null;
}

export async function requireUser(): Promise<UserSchema> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

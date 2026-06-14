import { requireUser } from "@/lib/auth";
import { getPostHogClient } from "@/lib/posthog-server";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default async function DashboardPage() {
  const user = await requireUser();

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: user.id, event: "dashboard_viewed" });
  await posthog.shutdown();

  return (
    <>
      <PostHogIdentify userId={user.id} email={user.email} />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
          <p className="mt-2 text-text-secondary">Welcome, {user.email}</p>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  );
}

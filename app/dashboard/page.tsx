import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-2 text-text-secondary">Welcome, {user.email}</p>
        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

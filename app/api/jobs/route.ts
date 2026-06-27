import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/auth";
import { MATCH_THRESHOLD } from "@/lib/utils";

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const client = await getServerClient();
    const { data: authData } = await client.auth.getCurrentUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search")?.trim() ?? "";
    const matchFilter = searchParams.get("matchFilter") ?? "high";
    const dateSort = searchParams.get("dateSort") ?? "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // The PostgREST fluent builder changes TypeScript type at each chain step;
    // `any` is the only practical way to build queries conditionally.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = client.database
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }

    if (matchFilter === "low") {
      query = query.lt("match_score", MATCH_THRESHOLD);
      query = query.order("match_score", { ascending: true });
    } else {
      query = query.gte("match_score", MATCH_THRESHOLD);
      query = query.order("match_score", { ascending: false });
    }

    query = query.order("found_at", { ascending: dateSort === "oldest" });
    query = query.range(from, to);

    const { data: jobs, count, error } = await query;

    if (error) {
      console.error("[api/jobs]", error);
      return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 });
    }

    return NextResponse.json({ success: true, jobs: jobs ?? [], totalCount: count ?? 0, page, pageSize: PAGE_SIZE });
  } catch (err) {
    console.error("[api/jobs]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

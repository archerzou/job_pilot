import { NextResponse } from "next/server";
import { requireUser, getServerClient } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();

  try {
    const client = await getServerClient();
    const path = `${user.id}/resume.pdf`;

    const { data: blob, error } = await client.storage.from("resumes").download(path);

    if (error || !blob) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to download resume." }, { status: 500 });
  }
}

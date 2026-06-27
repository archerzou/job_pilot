"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Loader2 } from "lucide-react";
import type { Job, CompanyResearchDossier } from "@/types";

function ResearchCompanyButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResearch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Research failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleResearch}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent-muted disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Search className="h-3.5 w-3.5" />
        )}
        {loading ? "Researching…" : "Research Company"}
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function DossierSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-xs text-text-muted">—</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs text-text-secondary"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items, accent }: { items: string[]; accent?: boolean }) {
  if (!items.length) return <p className="text-xs text-text-muted">—</p>;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-xs text-text-secondary"
        >
          <span
            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${accent ? "bg-green-500" : "bg-text-muted"}`}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-xs text-text-muted">—</p>;
  return (
    <ol className="space-y-1">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-xs text-text-secondary"
        >
          <span className="mt-0.5 shrink-0 font-semibold text-text-muted">
            {i + 1}.
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function DossierView({ dossier }: { dossier: CompanyResearchDossier }) {
  return (
    <div className="space-y-5">
      <DossierSection title="Company Overview">
        <p className="text-sm text-text-secondary">{dossier.companyOverview}</p>
      </DossierSection>

      <div className="h-px bg-border" />

      <DossierSection title="Tech Stack">
        <ChipList items={dossier.techStack} />
      </DossierSection>

      <DossierSection title="Culture & Values">
        <BulletList items={dossier.culture} />
      </DossierSection>

      <div className="h-px bg-border" />

      <DossierSection title="Why This Role Exists">
        <p className="text-xs text-text-secondary">{dossier.whyThisRole}</p>
      </DossierSection>

      <DossierSection title="Your Edge">
        <BulletList items={dossier.yourEdge} accent />
      </DossierSection>

      <DossierSection title="Gaps to Address">
        <BulletList items={dossier.gapsToAddress} />
      </DossierSection>

      <div className="h-px bg-border" />

      <DossierSection title="Smart Questions to Ask">
        <NumberedList items={dossier.smartQuestions} />
      </DossierSection>

      <DossierSection title="Interview Prep">
        <BulletList items={dossier.interviewPrep} />
      </DossierSection>

      {dossier.sources.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <DossierSection title="Sources">
            <div className="flex flex-col gap-1">
              {dossier.sources.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-accent hover:underline"
                >
                  {src}
                </a>
              ))}
            </div>
          </DossierSection>
        </>
      )}
    </div>
  );
}

type Props = { job: Job };

export function CompanyResearch({ job }: Props) {
  return (
    <div className="bg-surface rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">
            Company Research
          </h2>
        </div>
        {!job.company_research && <ResearchCompanyButton jobId={job.id} />}
      </div>

      {job.company_research ? (
        <DossierView dossier={job.company_research} />
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-tertiary">
            <Building2 className="h-6 w-6 text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">
            No research yet
          </p>
          <p className="mt-1 max-w-xs text-xs text-text-muted">
            Click &quot;Research Company&quot; to let the AI browse{" "}
            {job.company ?? "the company"}&apos;s public pages and build a
            Dossier.
          </p>
        </div>
      )}
    </div>
  );
}

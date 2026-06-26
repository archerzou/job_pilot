"use client";

import { useState, useRef, useTransition } from "react";
import { uploadResume, extractProfile } from "@/actions/profile";
import type { ExtractedProfile } from "@/lib/profile-utils";

type Props = {
  resumeUrl?: string | null;
  onExtracted?: (data: ExtractedProfile) => void;
};

export function ResumeSection({ resumeUrl, onExtracted }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUploadTransition] = useTransition();
  const [isPending, startExtractTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(resumeUrl ?? null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);

  function handleExtract() {
    setUploadError(null);
    setExtractSuccess(false);
    setIsExtracting(true);
    startExtractTransition(async () => {
      const result = await extractProfile();
      setIsExtracting(false);
      if (result.success) {
        setExtractSuccess(true);
        onExtracted?.(result.data);
      } else {
        setUploadError(result.error);
      }
    });
  }

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    setUploadError(null);
    setExtractSuccess(false);
    const fd = new FormData();
    fd.append("file", file);
    startUploadTransition(async () => {
      const result = await uploadResume(fd);
      if (result.success) {
        setCurrentUrl(result.url);
      } else {
        setUploadError(result.error ?? "Upload failed.");
      }
    });
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <h2 className="text-base font-semibold text-text-primary mb-1">Resume</h2>
      <p className="text-sm text-text-secondary mb-4">
        Upload an existing resume to auto fill the profile, or generate a new one from your details below.
      </p>

      {/* Hidden file input — always in DOM so Replace button can trigger it */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {currentUrl ? (
        <div className="rounded-xl border border-border px-4 py-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in srgb, var(--color-accent) 12%, transparent)" }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              style={{ color: "var(--color-accent)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">resume.pdf</p>
            <p className="text-xs text-text-muted">PDF · Uploaded</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/api/resume/view"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-text-primary hover:bg-surface-secondary transition-colors whitespace-nowrap"
            >
              View Resume
            </a>
            <button
              type="button"
              disabled={isExtracting || isUploading}
              onClick={handleExtract}
              className="px-3 py-1.5 rounded-md border border-border bg-surface text-xs font-medium text-text-primary hover:bg-surface-secondary transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {isExtracting ? "Extracting…" : "Extract Profile"}
            </button>
            <button
              type="button"
              disabled={isUploading || isExtracting}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
              style={{ background: "var(--color-accent)" }}
            >
              {isUploading ? "Uploading…" : "Replace"}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-10 px-6 cursor-pointer transition-colors ${
            isDragging ? "border-accent bg-accent-muted" : "border-border-muted bg-surface-secondary"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? (
            <p className="text-sm text-text-secondary">Uploading…</p>
          ) : (
            <>
              <svg
                className="w-10 h-10 text-text-muted mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                />
              </svg>
              <p className="text-sm font-medium text-text-primary mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-text-muted">PDF formatting only, Maximum file size 5MB</p>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded-md border border-border bg-surface text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Select Resume
              </button>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="mt-3 text-sm" style={{ color: "var(--color-error)" }}>{uploadError}</p>
      )}
      {extractSuccess && (
        <p className="mt-3 text-sm" style={{ color: "var(--color-success)" }}>
          Profile fields filled in. Review and save below.
        </p>
      )}

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-text-secondary">Need a fresh document based on this Profile below?</p>
        <button
          type="button"
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--color-accent)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          Generate Resume from Profile
        </button>
      </div>
    </div>
  );
}

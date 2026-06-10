"use client";

import { useState } from "react";

interface Resume {
  id: string;
  title: string;
}

export default function CoverLetterForm({ resumes }: { resumes: Resume[] }) {
  const [resumeId, setResumeId] = useState(resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!jobDescription.trim()) return;
    setGenerating(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/cover-letter/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, jobDescription, jobTitle, company }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Generation failed");
      setGenerating(false);
      return;
    }

    setResult(data.coverLetter.content);
    setGenerating(false);
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Resume Select */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">
          Select Resume
        </label>
        <select
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#f5a623]/40 transition-all"
        >
          {resumes.map((r) => (
            <option key={r.id} value={r.id} className="bg-[#111]">
              {r.title}
            </option>
          ))}
        </select>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Job Title
          </label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Engineer"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#f5a623]/40 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Company
          </label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Stripe"
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#f5a623]/40 transition-all"
          />
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1.5">
          Job Description <span className="text-[#f5a623]">*</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={7}
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#f5a623]/40 resize-none transition-all"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating || !jobDescription.trim()}
        className="w-full bg-[#f5a623] text-[#0a0a0a] font-bold py-3 rounded-lg text-sm hover:bg-[#f5a623]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? "Generating with Claude…" : "Generate Cover Letter"}
      </button>

      {error && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {result && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Your Cover Letter</h3>
            <button
              onClick={handleCopy}
              className="text-xs text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
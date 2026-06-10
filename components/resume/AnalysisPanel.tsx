"use client";

import { useState } from "react";

interface Resume {
  id: string;
  title: string;
  ats_score: number | null;
  status: string;
  parsed_content: string | null;  // ← plain string, not { text: string }
}

export default function AnalysisPanel({ resume }: { resume: Resume }) {
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setAnalyzing(true);
    setError(null);

    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeId: resume.id,
        jobDescription: jobDescription || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Analysis failed");
      setAnalyzing(false);
      return;
    }

    setAnalysis(data.analysis);
    setAnalyzing(false);
  }

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1">Job Description</h2>
        <p className="text-white/40 text-sm mb-4">
          Optional — paste a job posting to get a targeted match score.
        </p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here…"
          rows={6}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#f5a623]/40 resize-none transition-all"
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="mt-4 bg-[#f5a623] text-[#0a0a0a] font-bold px-6 py-3 rounded-lg text-sm hover:bg-[#f5a623]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? "Analyzing with Claude…" : "Analyze Resume"}
        </button>
        {error && (
          <p className="text-red-400 text-xs mt-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Results */}
      {analysis && (
        <>
          {/* Score */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">ATS Score</h2>
              <span className="text-4xl font-bold text-[#f5a623]">
                {analysis.ats_score}
                <span className="text-white/30 text-lg">/100</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(analysis.score_breakdown).map(([key, val]) => (
                <div key={key} className="bg-white/[0.03] rounded-lg p-3 text-center">
                  <p className="text-white font-bold text-xl">{val as number}</p>
                  <p className="text-white/30 text-xs capitalize mt-0.5">{key}</p>
                </div>
              ))}
            </div>

            <p className="text-white/50 text-sm mt-5 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Keyword Gaps */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Keyword Gaps</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.keyword_gaps.map((kw: string) => (
                <span
                  key={kw}
                  className="text-xs px-3 py-1.5 rounded-full bg-red-400/10 border border-red-400/20 text-red-400"
                >
                  missing: {kw}
                </span>
              ))}
              {analysis.keyword_matches.map((kw: string) => (
                <span
                  key={kw}
                  className="text-xs px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Rewrite Suggestions */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">AI Rewrite Suggestions</h2>
            <div className="space-y-4">
              {analysis.rewrite_suggestions.map((s: any, i: number) => (
                <div key={i} className="border border-white/[0.07] rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-red-400/5 border-b border-white/[0.05]">
                    <p className="text-xs text-white/30 mb-1">Original</p>
                    <p className="text-white/60 text-sm">{s.original}</p>
                  </div>
                  <div className="px-4 py-3 bg-emerald-400/5">
                    <p className="text-xs text-emerald-400/60 mb-1">Rewritten</p>
                    <p className="text-emerald-300 text-sm">{s.rewritten}</p>
                    <p className="text-white/30 text-xs mt-2">{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
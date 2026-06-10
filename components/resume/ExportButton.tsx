"use client";

export function ExportButton({ resumeId }: { resumeId: string }) {
  async function handleExport() {
    const res = await fetch("/api/resume/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="border border-white/[0.10] text-white/70 hover:text-white hover:border-white/25 px-5 py-2.5 rounded-lg text-sm transition-all"
    >
      Export PDF
    </button>
  );
}
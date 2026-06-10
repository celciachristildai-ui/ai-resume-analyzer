"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.replace(/\.[^.]+$/, ""));

    const res = await fetch("/api/resume/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    router.push(`/dashboard/resume/${data.resume.id}`);
    router.refresh();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all select-none ${
        uploading
          ? "border-[#f5a623]/40 bg-[#f5a623]/5 cursor-wait"
          : dragging
          ? "border-[#f5a623] bg-[#f5a623]/5 cursor-copy"
          : "border-white/[0.10] hover:border-[#f5a623]/40 hover:bg-white/[0.02] cursor-pointer"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 transition-all ${
        uploading ? "bg-[#f5a623]/20" : "bg-white/[0.04]"
      }`}>
        {uploading ? (
          <span className="animate-spin text-[#f5a623]">⟳</span>
        ) : (
          <span>+</span>
        )}
      </div>

      {uploading ? (
        <>
          <p className="text-white font-medium mb-1">Uploading and parsing…</p>
          <p className="text-white/30 text-sm">This takes a few seconds</p>
        </>
      ) : (
        <>
          <p className="text-white font-medium mb-1">
            {dragging ? "Drop it!" : "Upload your resume"}
          </p>
          <p className="text-white/30 text-sm">
  Click to browse or drag and drop · PDF, DOCX, or image · Max 10MB
</p>
        </>
      )}

      {error && (
        <p className="text-red-400 text-xs mt-4 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 inline-block">
          {error}
        </p>
      )}
    </div>
  );
}
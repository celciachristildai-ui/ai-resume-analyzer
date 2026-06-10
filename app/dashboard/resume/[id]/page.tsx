import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AnalysisPanel from "@/components/resume/AnalysisPanel";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-white/30 text-sm mb-1">
            <a href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </a>{" "}
            / {resume.title}
          </p>
          <h1 className="text-3xl font-bold text-white">{resume.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                resume.status === "analyzed"
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10"
                  : "border-white/10 text-white/30"
              }`}
            >
              {resume.status}
            </span>
            {resume.ats_score !== null && (
              <span className="text-[#f5a623] font-bold text-sm">
                ATS Score: {resume.ats_score}/100
              </span>
            )}
          </div>
        </div>
        <AnalysisPanel resume={resume} />
      </div>
    </div>
  );
}
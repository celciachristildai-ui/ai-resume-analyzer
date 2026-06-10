import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import UploadZone from "@/components/resume/UploadZone";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#f5a623] rounded-sm flex items-center justify-center text-[#0a0a0a] font-bold text-sm">
            R
          </div>
          <span className="font-semibold text-white">ResumeAI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-sm hidden sm:block">{user!.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-[#f5a623] text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Dashboard
          </p>
          <h1 className="text-4xl font-bold text-white">Welcome back</h1>
          <p className="text-white/40 mt-2">
            Upload a resume to get your ATS score and AI-powered fixes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-6 py-5">
            <p className="text-3xl font-bold text-white mb-1">0</p>
            <p className="text-white/40 text-sm">Resumes analyzed</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-6 py-5">
            <p className="text-3xl font-bold text-white mb-1">--</p>
            <p className="text-white/40 text-sm">Avg ATS score</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-6 py-5">
            <p className="text-3xl font-bold text-white mb-1">0</p>
            <p className="text-white/40 text-sm">Cover letters</p>
          </div>
        </div>

        <UploadZone />
      </main>
    </div>
  );
}
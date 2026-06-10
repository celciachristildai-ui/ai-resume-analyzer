import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoverLetterForm from "@/components/cover-letter/CoverLetterForm";

export default async function CoverLetterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-[#f5a623] text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Cover Letter
          </p>
          <h1 className="text-3xl font-bold text-white">Generate Cover Letter</h1>
          <p className="text-white/40 mt-1">
            Get a personalized cover letter in under 30 seconds.
          </p>
        </div>

        <CoverLetterForm resumes={resumes ?? []} />
      </div>
    </div>
  );
}
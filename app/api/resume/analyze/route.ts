import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResume } from "@/lib/ai/analyze";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId, jobDescription } = await request.json();

  // Fetch resume
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // ✅ parsed_content is a plain string now
  const resumeText = resume.parsed_content ?? "";

  if (!resumeText.trim()) {
    return NextResponse.json(
      { error: "Resume has no parsed content" },
      { status: 400 }
    );
  }

  // Run AI analysis
  const analysis = await analyzeResume(resumeText, jobDescription);

  // Save results
  const { error: updateError } = await supabase
    .from("resumes")
    .update({
      ats_score: analysis.ats_score,
      status: "analyzed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Save job description if provided (skip if table doesn't exist yet)
  if (jobDescription) {
    await supabase.from("job_descriptions").insert({
      user_id: user.id,
      resume_id: resumeId,
      content: jobDescription,
      match_score: analysis.ats_score,
      keyword_gaps: analysis.keyword_gaps,
    }).then(({ error }) => {
      if (error) console.warn("job_descriptions insert skipped:", error.message);
    });
  }

  return NextResponse.json({ analysis });
}
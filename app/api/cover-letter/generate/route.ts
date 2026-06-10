import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCoverLetter } from "@/lib/ai/cover-letter";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId, jobDescription, jobTitle, company } = await request.json();

  const { data: resume } = await supabase
    .from("resumes")
    .select("parsed_content")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume?.parsed_content?.text) {
    return NextResponse.json(
      { error: "Resume content not found" },
      { status: 404 }
    );
  }

  const content = await generateCoverLetter(
    resume.parsed_content.text,
    jobDescription,
    jobTitle,
    company
  );

  // Save to DB
  const { data: coverLetter } = await supabase
    .from("cover_letters")
    .insert({
      user_id: user.id,
      resume_id: resumeId,
      content,
    })
    .select()
    .single();

  return NextResponse.json({ coverLetter });
}
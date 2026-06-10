import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumeDocument } from "@/lib/pdf/ResumeDocument";
import React from "react";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId } = await request.json();

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // Use builder_content if available, otherwise create minimal data from parsed
  const resumeData = resume.builder_content ?? {
    name: resume.title,
    email: user.email ?? "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
  };

  const buffer = await renderToBuffer(
    React.createElement(ResumeDocument, { data: resumeData })
  );

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.title}.pdf"`,
    },
  });
}
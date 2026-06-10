import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const title = (formData.get("title") as string) ?? "Untitled Resume";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, DOCX, JPG, PNG, and WEBP files are supported." },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10MB." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let parsedText = "";
  try {
    if (file.type === "application/pdf") {
      const { extractText } = await import("unpdf");
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      parsedText = text?.trim() ?? "";
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      parsedText = result.value?.trim() ?? "";
    }
  } catch (err) {
    console.error("Parse error:", err);
  }

  console.log("Parsed length:", parsedText.length, "| type:", file.type);

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;
  let fileUrl: string | null = null;

  const { error: storageError } = await supabase.storage
    .from("resumes")
    .upload(filePath, buffer, { contentType: file.type });

  if (storageError) {
    console.error("Storage error:", storageError.message);
  } else {
    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(filePath);
    fileUrl = urlData.publicUrl;
  }

  const { data: resume, error: dbError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      file_url: fileUrl,
      parsed_content: parsedText,
      status: "draft",
    })
    .select()
    .single();

  if (dbError) {
    console.error("DB error:", dbError.message);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ resume });
}

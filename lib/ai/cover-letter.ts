import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
  company?: string
): Promise<string> {
  const prompt = `You are an expert career coach who writes compelling, personalized cover letters.

Write a professional cover letter for this candidate applying to the role below.

Rules:
- 3-4 paragraphs, under 350 words
- Use first person, confident and direct tone
- Reference specific details from the job description
- Highlight the strongest matching experience from the resume
- Do NOT use clichés like "I am writing to express my interest"
- Do NOT invent experience that isn't in the resume
- End with a clear call to action

${company ? `Company: ${company}` : ""}
${jobTitle ? `Role: ${jobTitle}` : ""}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Write only the cover letter body. No subject line, no date, no address blocks.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}
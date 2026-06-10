import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AnalysisResult {
  ats_score: number;
  score_breakdown: {
    formatting: number;
    keywords: number;
    readability: number;
    impact: number;
  };
  keyword_gaps: string[];
  keyword_matches: string[];
  rewrite_suggestions: {
    original: string;
    rewritten: string;
    reason: string;
  }[];
  summary: string;
}

export async function analyzeResume(
  resumeText: string,
  jobDescription?: string
): Promise<AnalysisResult> {
  const prompt = jobDescription
    ? `You are an expert ATS analyst and career coach.

Analyze this resume against the job description and return a JSON object with this exact structure:
{
  "ats_score": <number 0-100>,
  "score_breakdown": {
    "formatting": <number 0-25>,
    "keywords": <number 0-25>,
    "readability": <number 0-25>,
    "impact": <number 0-25>
  },
  "keyword_gaps": [<keywords in JD missing from resume>],
  "keyword_matches": [<keywords present in both>],
  "rewrite_suggestions": [
    {
      "original": <exact bullet point from resume>,
      "rewritten": <improved version with metrics and action verbs>,
      "reason": <why this is better>
    }
  ],
  "summary": "<2-3 sentence overall assessment>"
}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY the JSON object. No markdown, no explanation.`
    : `You are an expert ATS analyst and career coach.

Analyze this resume for general ATS compatibility and return a JSON object:
{
  "ats_score": <number 0-100>,
  "score_breakdown": {
    "formatting": <number 0-25>,
    "keywords": <number 0-25>,
    "readability": <number 0-25>,
    "impact": <number 0-25>
  },
  "keyword_gaps": [<important keywords that are missing>],
  "keyword_matches": [<strong keywords present>],
  "rewrite_suggestions": [
    {
      "original": <exact bullet point from resume>,
      "rewritten": <improved version>,
      "reason": <why this is better>
    }
  ],
  "summary": "<2-3 sentence overall assessment>"
}

RESUME:
${resumeText}

Return ONLY the JSON object. No markdown, no explanation.`;

  const message = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.choices[0].message.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as AnalysisResult;
  } catch {
    console.error("Failed to parse AI response:", clean);
    throw new Error("AI returned invalid JSON. Raw: " + clean.slice(0, 200));
  }
}
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { incident } = await req.json();

    if (!incident || typeof incident !== "string" || incident.trim().length < 20) {
      return NextResponse.json(
        { error: "Incident description is required (minimum 20 characters)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.0-flash";

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server." },
        { status: 500 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `
You are BoardBrief AI, an executive decision-support assistant.

Your role is to help business leaders understand cybersecurity incidents at a strategic level.

Assessment date (today): ${today}

Rules:
- Do NOT invent dates or facts.
- If information is unknown, clearly state assumptions.
- Write for non-technical executives.
- Focus on business impact and leadership decisions, not technical detail.

Generate a high-level executive cybersecurity assessment with the following sections:

1. Executive Summary
2. Business Impact (financial, operational, legal, reputational)
3. Top 3 Recommended Actions
4. Key Questions for Leadership

Incident description:
${incident}
    `.trim();

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 900 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Gemini API error",
          details: data?.error?.message || "Unknown error",
          raw: data,
        },
        { status: response.status }
      );
    }

    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts) ? parts.map((p: any) => p?.text || "").join("") : "";

    if (!text.trim()) {
      return NextResponse.json(
        {
          error: "Gemini returned no content. The incident may have been blocked by safety filters.",
          raw: data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      brief: text,
      meta: {
        generatedAt: today,
        model,
        note: "AI-generated decision support. Review recommended.",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error while generating brief.", details: err?.message },
      { status: 500 }
    );
  }
}

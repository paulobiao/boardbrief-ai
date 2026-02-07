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
    const model = "gemini-2.0-flash"; // modelo confirmado funcionando

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server." },
        { status: 500 }
      );
    }

    // Data do dia (server-side, confiável)
    const today = new Date().toISOString().split("T")[0];

    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are BoardBrief AI.

Generate an executive-ready cybersecurity brief using the date below.

Date of assessment: ${today}

Rules:
- Do NOT invent dates.
- If information is unknown, clearly state assumptions.
- Use professional, executive language.
- Focus on decision-making, not technical noise.

Structure the brief with:

1. Executive Summary
2. Business Impact (financial, operational, legal, reputational)
3. Top 3 Recommended Actions
4. Key Questions for Leadership

Incident description:
${incident}
                `,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 900,
        },
      }),
    );

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

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        {
          error: "Gemini returned no content. Incident may be blocked by safety policy.",
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
        note: "This brief was generated using an AI model and should be reviewed by leadership.",
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Server error while generating brief.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incident = body?.incident;

    if (!incident || typeof incident !== "string" || incident.trim().length < 20) {
      return NextResponse.json(
        { error: "Incident description is required (minimum 20 characters)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server." },
        { status: 500 }
      );
    }

    // Modelo comprovadamente funcional
    const model = "gemini-2.0-flash";

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

Create an executive-ready cybersecurity brief with:

1. Executive summary
2. Business impact (financial, operational, legal, reputational)
3. Top 3 recommended actions
4. Key questions for leadership

Incident:
${incident}
                `,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Gemini API error",
          details: data?.error?.message || "Unknown error",
        },
        { status: response.status }
      );
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        {
          error: "Gemini returned no content.",
          raw: data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ brief: text });
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

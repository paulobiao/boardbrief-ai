import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { incident } = await req.json();

    if (!incident || typeof incident !== "string" || incident.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a valid incident description (min 20 characters)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server." },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
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

Generate an executive-ready cybersecurity brief with:

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
      }
    );

    const data = await res.json();

    console.log("GEMINI RESPONSE:", JSON.stringify(data, null, 2));

    const candidate = data?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const text = part?.text;

    if (!text) {
      return NextResponse.json(
        {
          brief:
            "⚠️ Gemini returned no text. Check safety filters or try rephrasing the incident.",
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

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incident = body?.incident;

    if (!incident || typeof incident !== "string" || incident.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide an incident description (at least 20 characters)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are BoardBrief AI.
Turn the following cybersecurity incident into an executive-ready brief with:
- Executive summary
- Impact (operational, financial, legal, reputation)
- Top 3 actions
- Key questions for leadership

Incident:
${incident}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 900,
          },
        }),
      }
    );

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") || "No response generated.";

    return NextResponse.json({ brief: text });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to generate brief", details: error?.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { incident } = await req.json();

    if (
      !incident ||
      typeof incident !== "string" ||
      incident.trim().length < 20
    ) {
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
                  text: `You are an expert cybersecurity advisor writing for executives.

Write a clear, structured executive brief with the following sections:

1. Executive Summary
2. Business Impact (operational, financial, legal, reputational)
3. Top 3 Recommended Actions
4. Key Questions for Leadership

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

    // 🔎 Log real para debug no Vercel
    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

    let brief = "No response generated.";

    if (data?.candidates?.length) {
      const candidate = data.candidates[0];

      if (candidate?.content?.parts?.length) {
        brief = candidate.content.parts
          .map((p: any) => p.text)
          .join("");
      } else if (candidate?.content?.text) {
        brief = candidate.content.text;
      } else if (candidate?.outputText) {
        brief = candidate.outputText;
      }
    }

    return NextResponse.json({ brief });
  } catch (error: any) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate brief",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

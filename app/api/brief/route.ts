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
        {
          error:
            "Please provide a valid incident description (minimum 20 characters).",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-pro-latest";

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
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
                  text: `
You are an AI system assisting executives with post-incident analysis.

Your task is to generate a high-level, executive-facing cybersecurity brief focused on
risk assessment and leadership decision-making. Avoid operational or exploit-level detail.

Produce the following sections:

1. Executive Summary
2. Business Impact (financial, operational, legal, reputational)
3. Top 3 Recommended Actions
4. Key Questions for Executive Leadership

Incident description:
${incident}
                  `.trim(),
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

    console.log(
      "GEMINI RAW RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("")
        ?.trim() || "";

    if (!text) {
      return NextResponse.json(
        {
          error:
            "Gemini returned no content. The request may have been blocked by safety policy.",
          raw: data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ brief: text });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Server error while generating executive brief.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}
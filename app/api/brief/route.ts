import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { incident } = await req.json();

    if (!incident || typeof incident !== "string" || incident.trim().length < 20) {
      return NextResponse.json(
        { error: "Invalid incident description (minimum 20 characters)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured." },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
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
You are a cybersecurity risk analyst producing a DEFENSIVE, POST-INCIDENT executive report.
This is for security governance and risk management purposes only.

Generate a structured executive brief with:
1. Executive summary
2. Business impact (financial, operational, legal, reputational)
3. Top 3 defensive remediation actions
4. Key strategic questions for executive leadership

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
          safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUAL_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    const data = await res.json();

    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("")
        ?.trim();

    if (!text) {
      return NextResponse.json(
        {
          error: "Gemini returned no content. Incident likely blocked by safety policy.",
          raw: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ brief: text });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Unexpected server error during brief generation.",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}

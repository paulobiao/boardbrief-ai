import { NextResponse } from "next/server";

function fallbackBrief(incident: string) {
  return `
EXECUTIVE SUMMARY
A cybersecurity incident involving suspected credential compromise was detected following a phishing attempt. While no confirmed financial loss has occurred, the incident presents material operational, financial, and reputational risk.

BUSINESS IMPACT
• Financial: Potential exposure to fraud, unauthorized payment redirection, and investigation costs.
• Operational: Disruption to finance and IT workflows during containment and remediation.
• Legal & Compliance: Possible reporting obligations depending on jurisdiction and data exposure.
• Reputational: Risk of stakeholder concern if incident handling is delayed or ineffective.

TOP 3 RECOMMENDED ACTIONS
1. Immediately reset affected credentials, revoke active sessions, and enforce MFA across impacted accounts.
2. Conduct a targeted audit of email rules, login activity, and financial change requests.
3. Brief executive leadership and initiate an internal incident response review.

KEY QUESTIONS FOR LEADERSHIP
• Were any sensitive communications or financial instructions exposed?
• Are current identity and email security controls sufficient?
• Should this incident trigger regulatory notification or external review?

INCIDENT CONTEXT
${incident}
`;
}

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
      // Mesmo sem chave, NÃO quebra o demo
      return NextResponse.json({
        brief: fallbackBrief(incident),
        source: "fallback-no-api-key",
      });
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
You are a cybersecurity risk analyst producing a POST-INCIDENT EXECUTIVE REPORT.
This is defensive analysis only.

Generate:
- Executive summary
- Business impact
- Top 3 defensive actions
- Executive questions

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

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      // 🔑 AQUI está o pulo do gato
      return NextResponse.json({
        brief: fallbackBrief(incident),
        source: "fallback-gemini-blocked",
        raw: data,
      });
    }

    return NextResponse.json({
      brief: text,
      source: "gemini",
    });
  } catch (err: any) {
    return NextResponse.json({
      brief: fallbackBrief("Incident unavailable due to server error."),
      source: "fallback-error",
      error: err?.message,
    });
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { incident } = await req.json();

    if (!incident) {
      return NextResponse.json({ error: "Incident description is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    // Usando o modelo exato que apareceu no seu log de sucesso
    const model = "gemini-2.0-flash"; 

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    // URL baseada no seu log de debug que retornou OK (v1)
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Generate an executive cybersecurity brief for: ${incident}` }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: "Gemini Error", 
        details: data.error?.message || "Unknown error" 
      }, { status: response.status });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated";
    return NextResponse.json({ brief: text });

  } catch (err: any) {
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}
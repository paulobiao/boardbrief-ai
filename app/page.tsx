"use client";

import { useState } from "react";

const SAMPLE = `A staff member received an email that looked like Microsoft 365.
They entered credentials. Shortly after, multiple suspicious login attempts appeared
from overseas IPs. A rule was added to auto-forward emails to an external address.
Finance received a request to change vendor banking details.`;

export default function Page() {
  const [incident, setIncident] = useState(SAMPLE);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setBrief("");
    setLoading(true);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setBrief(data.brief);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">BoardBrief AI</h1>
        <p className="mt-2 text-gray-600">
          Turn incident descriptions into an executive-ready cybersecurity brief.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-4 shadow-sm">
            <h2 className="font-semibold">Incident input</h2>
            <textarea
              className="mt-3 w-full h-64 rounded-xl border p-3 text-sm"
              value={incident}
              onChange={(e) => setIncident(e.target.value)}
            />
            <button
              onClick={generate}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-black text-white py-3 font-semibold disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Executive Brief"}
            </button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="rounded-2xl border p-4 shadow-sm">
            <h2 className="font-semibold">Executive brief</h2>
            <div className="mt-3 h-64 overflow-auto rounded-xl bg-gray-50 p-3 text-sm whitespace-pre-wrap">
              {brief || "Click Generate to produce a board-ready brief."}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

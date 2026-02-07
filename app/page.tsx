"use client";

import { useState } from "react";

const INCIDENTS = {
  phishing: `An employee from the Accounts Payable team received an email that appeared to come from an internal IT security notification. The message requested an urgent password reset due to suspicious activity. The employee entered their credentials into the provided link.

Shortly afterward, unusual login attempts were detected from foreign IP addresses, and an email forwarding rule was added to the employee’s mailbox, redirecting messages to an external address. A subsequent request was sent to the finance department asking to change vendor banking details.

The payment request was flagged and stopped before execution. Access to the compromised account has been revoked, and no confirmed financial loss has occurred. However, the incident raises concerns regarding credential security, email protection, and financial fraud exposure.`,

  cloud: `During a routine internal audit, the security team identified overly permissive access controls on a cloud storage environment used to host internal reports and limited customer documentation.

The configuration allowed authenticated users outside the intended business unit to view and download sensitive files. The misconfiguration was introduced several weeks earlier during an infrastructure update. Access logs show that multiple internal users accessed files outside their job scope, though no external access has been identified.

The exposed information may include internal financial reports, operational metrics, and limited customer-related data. The configuration has since been corrected, and a broader review of cloud access policies and change management processes is underway.`,

  insider: `Security monitoring identified repeated access to confidential internal documents by an employee outside their normal job responsibilities. The access occurred over multiple days and involved internal strategy documents and operational reports.

There is no indication of data exfiltration or external sharing at this time. The access pattern appears inconsistent with the employee’s role and approved access level. Management has temporarily restricted the account pending review.

The incident raises concerns around internal access governance, role-based access controls, and monitoring effectiveness.`
};

export default function Page() {
  const [incident, setIncident] = useState(INCIDENTS.phishing);
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

      setBrief(data.brief || "No response generated.");
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">BoardBrief AI</h1>
        <p className="mt-2 text-gray-600">
          Turn cybersecurity incidents into executive-ready decision briefs.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setIncident(INCIDENTS.phishing)}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Load Phishing / BEC
          </button>
          <button
            onClick={() => setIncident(INCIDENTS.cloud)}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Load Cloud Misconfig
          </button>
          <button
            onClick={() => setIncident(INCIDENTS.insider)}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Load Insider Access
          </button>
        </div>

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

        <p className="mt-8 text-xs text-gray-500">
          AI-generated decision support. Review recommended.
        </p>
      </div>
    </main>
  );
}

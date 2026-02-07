# BoardBrief AI (Gemini 3)

BoardBrief AI transforms raw cybersecurity incident descriptions into executive-ready decision briefs.

Security incidents are usually written for engineers. Executives need clarity: business impact, risk exposure, and clear next actions. BoardBrief AI bridges this gap using Google Gemini to produce concise, board-level cybersecurity assessments.

---

## What it does

**Input:** Plain-text cybersecurity incident description  
**Output:** Executive cybersecurity brief including:
- Executive Summary
- Business Impact (financial, operational, legal, reputational)
- Top 3 Recommended Actions
- Key Questions for Leadership

The system is designed for decision support, not technical analysis.

---

## Example incident scenarios

This project includes three standard incident scenarios used for demonstrations:
- Phishing / Business Email Compromise
- Cloud Access Misconfiguration
- Insider Access Misuse

These examples show how BoardBrief AI adapts to different risk categories while maintaining a consistent executive format.

---

## Design principles

- No fabrication of facts or dates
- Explicit assumptions when information is missing
- Executive-friendly language
- Focus on governance, risk, and decision-making
- Clear feedback when content is restricted by safety policies

---

## Built with

- **Google Gemini 3** (gemini-2.0-flash)
- Next.js (App Router)
- TypeScript
- Vercel

---

## Run locally

```bash
npm install
npm run dev
Set environment variables:

GEMINI_API_KEY=your_api_key_here
Disclaimer
This tool provides AI-generated decision support and should be reviewed by qualified leadership and security professionals.


---

## PASSO 3B — Texto FINAL do Devpost (colar direto)

### Project Title
**BoardBrief AI (Gemini 3)**

---

### Elevator Pitch
Turn cybersecurity incidents into executive-ready decision briefs in minutes.

---

### Project Description / Story
> BoardBrief AI (Gemini 3) converts unstructured cybersecurity incident descriptions into concise, executive-level decision briefs.
>
> Security incidents are typically written for technical teams, but leadership needs a different view: business impact, risk exposure, and clear next steps. BoardBrief AI bridges this gap by transforming raw incident narratives into board-ready assessments focused on governance and decision-making.
>
> The system is intentionally designed to prioritize trust over completeness. It avoids speculation, clearly states assumptions, and never fabricates missing information. When content is restricted by safety policies, the system returns transparent feedback rather than misleading output.
>
> BoardBrief AI is built for CISOs, executives, and boards who need clarity—not technical noise—when responding to cybersecurity risk.

---

### What it does
- **Input:** Plain-text incident description  
- **Output:** Executive cybersecurity brief with:
  - Executive summary
  - Business impact (financial, operational, legal, reputational)
  - Top 3 recommended actions
  - Key questions for leadership

---

### Built With
Google Gemini 3 (gemini-2.0-flash)
Next.js
TypeScript
Vercel


---

### Design Decisions
> The system is deliberately designed as a decision-support tool rather than a technical incident analyzer. It emphasizes executive trust, governance, and responsible AI usage by clearly surfacing uncertainty instead of generating speculative content.

---

## Commit e subir

Depois de salvar:

```bash
git add README.md
git commit -m "Update README and Devpost documentation"
git push
# Voice Interview — Setup Guide

The new AI Voice Interview module ships in two modes:

| Mode  | When                                                       | Behaviour                                                                                          |
| ----- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| voice | `RETELL_API_KEY` **and** `RETELL_AGENT_ID` are both set    | Retell web call — Rexa speaks via WebRTC, the candidate replies through the browser mic.           |
| text  | Either env var is missing, **or** the Retell call fails    | Falls back to the existing text-mode flow with the same personalised prompts. No setup required.   |

The text-mode fallback means you can use the feature **today** with zero third-party signup. Voice is an opt-in upgrade.

---

## 1. The free path (text mode only)

If you just want the new feature working:

```bash
cd backend
npm install
# Make sure GEMINI_API_KEY is in .env (this already exists from the analyzer)
npm run dev
```

That's it. The Interview page shows a "Voice mode is offline" banner and runs every interview in text mode using the new context-aware prompts.

---

## 2. Voice setup (when you're ready to add Rexa's real voice)

Sign up at https://retellai.com — free tier includes enough minutes to demo with.

### 2.1 Create the agent in the Retell dashboard

1. Go to **Agents → Create agent**.
2. Voice: pick any human-sounding voice (e.g. `11labs-Adrian` or `openai-shimmer`). Set the agent name to `Rexa`.
3. LLM: choose **Retell LLM** (cheaper and lower latency than custom for our use).
4. System prompt — paste this template **verbatim**:

   ```
   {{system_prompt}}
   ```

   Yes, the whole prompt is `{{system_prompt}}`. The Capabl backend builds the real system prompt per interview (using the candidate's resume, projects, GitHub, roadmap…) and injects it as a dynamic variable.

5. (Optional) **Begin message** template:

   ```
   Hi {{candidate_name}}! I'm Rexa, and I'll be running your {{interview_purpose}} interview today. Ready when you are.
   ```

6. Save the agent and copy the **Agent ID** (looks like `agent_xxxxxxxxxxxxxxxxxxxx`).

### 2.2 Wire credentials

Add to `backend/.env`:

```env
RETELL_API_KEY=key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RETELL_AGENT_ID=agent_xxxxxxxxxxxxxxxxxxxx
RETELL_AGENT_NAME=Rexa           # optional override
```

Restart the backend dev server — the `/api/interviews` response now returns `voice.available: true` and the start-call button switches to "Start voice call with Rexa".

### 2.3 (Later) Phone calls via Twilio

The phone-call endpoint (`POST /api/interviews/dial`) is already wired but unused from the UI. To enable it:

1. In your Twilio dashboard, provision a number that accepts voice (any local number works).
2. In Retell → **Phone numbers**, bind that Twilio number to the Rexa agent (Retell handles the SIP plumbing — you don't write Twilio code).
3. Add to `backend/.env`:

   ```env
   RETELL_PHONE_NUMBER=+15551234567
   ```

4. Add a UI button that calls `POST /api/interviews/dial { phone, purpose, level, ... }`. Capabl will call the candidate's phone and stream the same Rexa interview through the call.

Phone billing comes from Twilio (~ $0.014 + voice mins), Retell minutes from Retell's plan.

---

## 3. Database

The new module rewrote the `InterviewSession` schema (old rows were wiped per your request — the old interview history is no longer compatible).

If your dev server is currently running, stop it once and run:

```bash
cd backend
npx prisma generate         # refresh the client to match the new schema
npm run dev                 # restart
```

The schema is already pushed to the database (`npx prisma db push --accept-data-loss` was run during the rebuild). For production / additional environments, regenerate proper migration files with `npx prisma migrate dev --name interview_voice_rebuild`.

---

## 4. Sanity check

1. Open the **AI Interview** page. You should see the type picker (purpose × role × stage × medium × format × level × question budget).
2. Pick `Technical · Standard · First Round · AI Interview · One-on-One`, level `medium`, 4 questions.
3. Click **Start**:
   - With voice keys → browser asks for mic permission → Rexa says hi within ~3 s.
   - Without voice keys → falls back to text mode, first question references your actual skills/projects.
4. Finish the interview. The scorecard shows 6 dimension scores (technical / communication / problem-solving / confidence / clarity / cultural fit), strengths, weaknesses, concrete skill gaps, and a 3-step improvement plan.
5. Go back to the home view — `Past interviews`, `Performance trend`, `Dimension breakdown`, and the three heatmaps populate from your real session history.

---

## 5. Troubleshooting

| Symptom                                                  | Fix                                                                                                       |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| "Voice mode is offline" banner won't go away             | Both `RETELL_API_KEY` *and* `RETELL_AGENT_ID` must be set, then restart the backend.                      |
| Mic permission denied                                    | Browser will only ask once — clear the site permission and retry, or check OS-level mic permission.        |
| Retell call connects but Rexa stays silent               | Confirm the agent's system prompt is literally `{{system_prompt}}` (not the words "system prompt").       |
| Prisma client throws "Unknown field `purpose`"           | Stop the backend, run `npx prisma generate`, restart.                                                     |
| Gemini errors "API key not valid"                        | Get a free key at https://aistudio.google.com/app/apikey and set `GEMINI_API_KEY` in `backend/.env`.      |

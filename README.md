# Capabl — AI Career Decision Simulator

Capabl is an AI-powered career decision platform for students. Instead of just telling a student “learn React” or dumping a huge skill checklist, Capabl turns their real evidence — resume, projects, certifications, and mock interview performance — into an evidence-based readiness score, then simulates multiple learning paths with explicit tradeoffs so the student can decide what to do next.

**You decide; the AI never picks for you.**

---

## 📌 Problem

Students trying to become Full Stack Developers, AI Engineers, Data Engineers, and other roles often get stuck on one question:

> “What should I actually learn next to get hired?”

The problem is not lack of information — it’s too much of it. Existing tools often:
* Oversimplify the answer into generic advice
* Overwhelm users with long skill lists
* Fail to explain tradeoffs
* Give “scores” without showing where the number came from

Capabl was built to solve that gap.

---

## ✨ What Capabl Does

Capabl helps a student go from **confusion → clarity → action**.

### 1) Resume & Evidence Analysis
Capabl takes a student’s real evidence:
* Resume (PDF)
* Projects
* Certifications
* Mock interview performance
* Optional GitHub / LinkedIn context

And uses it to build a more honest picture of their readiness.

### 2) Role Skill Intelligence
Given a target role (for example Full Stack Developer), Capabl identifies the skills that role demands today and assigns importance weights.

### 3) Evidence-Based Readiness Scoring
Capabl does not let the LLM invent a score. Instead, it computes readiness from a fixed, auditable formula across multiple evidence sources.

### 4) Decision Simulator / What-If Analysis
Capabl generates three distinct paths such as:
* **Quick Wins**
* **Close Critical Gaps**
* **Balanced Sprint**

Each path shows:
* Projected readiness gain
* Estimated effort
* The skills it focuses on
* The tradeoff (what you are delaying by choosing it)

### 5) AI Mock Interview + Scorecard
Students can take a mock interview through Capabl’s voice interview flow and receive:
* An interview scorecard
* Dimension-level feedback
* Strengths and areas to improve
* Concrete next steps before the next interview

### 6) Roadmap & Action Plan
Once the student chooses a path, Capabl can turn it into a structured next-step learning plan.

---

## 🧠 Core Idea

Capabl is designed around one decision moment:

> “Given my real evidence, which learning path should I commit to this month — and what am I giving up by choosing it?”

The AI helps the student reason, but the final decision remains with the student.

---

## 🏗️ How it Works

### Step 1 — Inputs
Capabl takes:
* Target role
* Resume
* Projects
* Certifications
* Interview transcript / interview performance
* Optional GitHub/LinkedIn context

### Step 2 — AI + Scoring Pipeline
Capabl uses AI where meaning matters and deterministic rules where trust matters.

* **AI is used for:**
  * Parsing the target role
  * Understanding resume/project language
  * Inferring role skills
  * Semantic matching between evidence and skills
  * Generating explanations / plan text
* **Deterministic logic is used for:**
  * Readiness scoring
  * Projected score gains
  * Path comparison logic
  * Confidence bands
  * Evidence breakdowns

---

## 📊 Readiness Scoring Philosophy

Capabl deliberately avoids “mystery scores.” Instead of asking an LLM to output a readiness number, Capabl computes scores from evidence sources such as:
* Interview
* Projects
* Resume
* Certifications
* Roadmap progress

This makes the score:
* More reproducible
* Easier to audit
* Easier to explain to the user

---

## 🧩 Key Features

* **1. Career Readiness Dashboard:** A dashboard that surfaces overall readiness, role match, skill readiness, confidence band / uncertainty, and evidence-backed skill analysis.
* **2. Decision Simulator:** Capabl’s signature feature. Instead of giving one answer, it shows multiple strategies side-by-side so the student can compare short-term wins, critical missing skills, and balanced progress.
* **3. AI Voice Mock Interview:** Capabl includes a voice interview flow that helps students practice role-specific questions and get structured feedback.
* **4. Resume Analysis:** Capabl parses the student’s resume and uses it as a key evidence source in the readiness pipeline.
* **5. Project Intelligence:** Projects are not just listed — they are treated as evidence for specific skills and readiness signals.
* **6. Roadmap / Learning Progress:** Capabl can turn selected paths into actionable learning steps and track progress.

---

## 🛠️ Tech Stack

### Frontend
* React
* JavaScript
* React Router
* Tailwind CSS / CSS
* Axios

### Backend
* Node.js
* Express.js
* TypeScript
* Prisma ORM
* JWT Authentication
* Passport.js
* Google OAuth

### Database
* PostgreSQL
* Neon / PostgreSQL deployment

### AI / APIs
* **Google Gemini 2.5 Flash** — role understanding, reasoning text, plan generation
* **Gemini Embeddings** — semantic skill matching
* **Retell AI** — voice mock interview experience
* **GitHub API** — optional profile/repo enrichment

### File / Upload Handling
* Multer
* pdf-parse

### Deployment
* **Frontend:** Vercel
* **Backend:** Render

---

## 📂 Project Structure

```text
Capabl/
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── student/
│   │   ├── components/
│   │   └── config/
│   └── public/
│
├── backend/                   # Express + Prisma backend
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── config/
│
└── README.md
```

---

## ⚙️ Local Setup

### 1) Clone the repository

```bash
git clone https://github.com/Reya-Doshi/Capabl.git
cd Capabl
```

### 2) Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` and add the required environment variables.

#### Example

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GEMINI_API_KEY=your_gemini_api_key

RETELL_API_KEY=your_retell_api_key
RETELL_AGENT_ID=your_retell_agent_id
RETELL_AGENT_NAME=your_retell_agent_name

GITHUB_TOKEN=your_github_token
FRONTEND_URL=http://localhost:3000
```

Generate the Prisma client, push the schema, and start the backend:

```bash
npx prisma generate
npx prisma db push
npx tsx src/server.ts
```

---

### 3) Frontend Setup

Open a new terminal.

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`.

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend.

```bash
npm start
```

---

## 🌍 Deployment

### Frontend

The frontend is deployed on **Vercel**.

### Backend

The backend is deployed on **Render**.

### Database

The production database is hosted on **Neon PostgreSQL**.

---

## 🔐 Environment Variables

### Backend

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `RETELL_API_KEY`
- `RETELL_AGENT_ID`
- `RETELL_AGENT_NAME`
- `GITHUB_TOKEN`
- `FRONTEND_URL`

### Frontend

- `REACT_APP_API_URL`

---

## 🧪 Example User Flow

1. Student signs up and chooses a target role.
2. Uploads a resume and adds projects/certifications.
3. Capabl analyzes the evidence and computes readiness.
4. Student views the dashboard and skill breakdown.
5. Student opens the Decision Simulator to compare multiple learning paths.
6. Student chooses a path and continues with a roadmap and interview preparation flow.

---

## 🎯 Why Capabl is Different

Most career tools either:

- Generate a generic roadmap
- Give a score with no explanation
- Recommend one "best" next step

Capabl is different because it focuses on **decision-making under uncertainty**.

It does three important things:

- Grounds the score in evidence.
- Shows tradeoffs between multiple learning paths.
- Keeps the human in control.

Capabl is not trying to replace judgment. It is trying to help students make better career decisions.

---

## ⚠️ Current Limitations / Future Work

Capabl is still evolving. Future improvements include:

- Broader role coverage
- Stronger resume extraction with OCR fallback for difficult PDFs
- More robust interview analytics
- Longer 30/60/90-day learning plans
- Repeated simulations as the student's evidence grows
- Stronger recruiter-facing profile insights

---

## 📜 License

This project is currently shared for learning, showcase, and hackathon purposes.

Add an appropriate open-source license if you plan to make the repository publicly reusable.

---

## 🙌 Acknowledgements

- Google Gemini
- Retell AI
- Prisma
- Neon
- Vercel
- Render

---

## Final Note

Capabl is built around a simple belief:

> **Students don't just need more advice. They need help making better career decisions from the evidence they already have.**
````

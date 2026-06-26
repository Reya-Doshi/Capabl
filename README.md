Capabl — AI Career Decision Simulator
Capabl is an AI-powered career decision platform for students. Instead of just telling a student “learn React” or dumping a huge skill checklist, Capabl turns their real evidence — resume, projects, certifications, and mock interview performance — into an evidence-based readiness score, then simulates multiple learning paths with explicit tradeoffs so the student can decide what to do next.

You decide; the AI never picks for you.

📌 Problem
Students trying to become Full Stack Developers, AI Engineers, Data Engineers, and other roles often get stuck on one question:

“What should I actually learn next to get hired?”

The problem is not lack of information — it’s too much of it.

Existing tools often:

oversimplify the answer into generic advice
overwhelm users with long skill lists
fail to explain tradeoffs
give “scores” without showing where the number came from
Capabl was built to solve that gap.

✨ What Capabl does
Capabl helps a student go from confusion → clarity → action.

1) Resume & Evidence Analysis
Capabl takes a student’s real evidence:

Resume (PDF)
Projects
Certifications
Mock interview performance
Optional GitHub / LinkedIn context
and uses it to build a more honest picture of their readiness.

2) Role Skill Intelligence
Given a target role (for example Full Stack Developer), Capabl identifies the skills that role demands today and assigns importance weights.

3) Evidence-Based Readiness Scoring
Capabl does not let the LLM invent a score. Instead, it computes readiness from a fixed, auditable formula across multiple evidence sources.

4) Decision Simulator / What-If Analysis
Capabl generates three distinct paths such as:

Quick Wins
Close Critical Gaps
Balanced Sprint
Each path shows:

projected readiness gain
estimated effort
the skills it focuses on
the tradeoff (what you are delaying by choosing it)
5) AI Mock Interview + Scorecard
Students can take a mock interview through Capabl’s voice interview flow and receive:

an interview scorecard
dimension-level feedback
strengths and areas to improve
concrete next steps before the next interview
6) Roadmap & Action Plan
Once the student chooses a path, Capabl can turn it into a structured next-step learning plan.

🧠 Core Idea
Capabl is designed around one decision moment:

“Given my real evidence, which learning path should I commit to this month — and what am I giving up by choosing it?”

The AI helps the student reason, but the final decision remains with the student.

🏗️ How it works
Step 1 — Inputs
Capabl takes:

target role
resume
projects
certifications
interview transcript / interview performance
optional GitHub/LinkedIn context
Step 2 — AI + Scoring Pipeline
Capabl uses AI where meaning matters and deterministic rules where trust matters.

AI is used for:
parsing the target role
understanding resume/project language
inferring role skills
semantic matching between evidence and skills
generating explanations / plan text
Deterministic logic is used for:
readiness scoring
projected score gains
path comparison logic
confidence bands
evidence breakdowns
📊 Readiness Scoring Philosophy
Capabl deliberately avoids “mystery scores.”

Instead of asking an LLM to output a readiness number, Capabl computes scores from evidence sources such as:

interview
projects
resume
certifications
roadmap progress
This makes the score:

more reproducible
easier to audit
easier to explain to the user
🧩 Key Features
1. Career Readiness Dashboard
A dashboard that surfaces:

overall readiness
role match
skill readiness
confidence band / uncertainty
evidence-backed skill analysis
2. Decision Simulator
Capabl’s signature feature. Instead of giving one answer, it shows multiple strategies side-by-side so the student can compare:

short-term wins
critical missing skills
balanced progress
3. AI Voice Mock Interview
Capabl includes a voice interview flow that helps students practice role-specific questions and get structured feedback.

4. Resume Analysis
Capabl parses the student’s resume and uses it as a key evidence source in the readiness pipeline.

5. Project Intelligence
Projects are not just listed — they are treated as evidence for specific skills and readiness signals.

6. Roadmap / Learning Progress
Capabl can turn selected paths into actionable learning steps and track progress.

🛠️ Tech Stack
Frontend
React
JavaScript
React Router
Tailwind CSS / CSS
Axios
Backend
Node.js
Express.js
TypeScript
Prisma ORM
JWT Authentication
Passport.js
Google OAuth
Database
PostgreSQL
Neon / PostgreSQL deployment
AI / APIs
Google Gemini 2.5 Flash — role understanding, reasoning text, plan generation
Gemini Embeddings — semantic skill matching
Retell AI — voice mock interview experience
GitHub API — optional profile/repo enrichment
File / Upload Handling
Multer
pdf-parse
Deployment
Frontend: Vercel
Backend: Render
📂 Project Structure
Capabl/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── student/
│   │   ├── components/
│   │   └── config/
│   └── public/
│
├── backend/                 # Express + Prisma backend
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
⚙️ Local Setup
1) Clone the repo
git clone https://github.com/VaishnaviPatil-gif/Capabl-AI-Career-Decision-Simulator.git
cd Capabl-AI-Career-Decision-Simulator
2) Backend setup
cd backend
npm install
Create a .env file in backend/ and add the required environment variables.

Example:

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
Then push the Prisma schema and start the backend:

npx prisma generate
npx prisma db push
npx tsx src/server.ts
3) Frontend setup
Open a new terminal:

cd frontend
npm install
Create a .env file in frontend/:

REACT_APP_API_URL=http://localhost:5000
Start the frontend:

npm start
🌍 Deployment
Frontend
The frontend is deployed on Vercel.

Backend
The backend is deployed on Render.

Database
The production database is hosted on Neon PostgreSQL.

🔐 Environment Variables
Backend
DATABASE_URL
JWT_SECRET
PORT
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GEMINI_API_KEY
RETELL_API_KEY
RETELL_AGENT_ID
RETELL_AGENT_NAME
GITHUB_TOKEN
FRONTEND_URL
Frontend
REACT_APP_API_URL
🧪 Example User Flow
Student signs up and chooses a target role
Uploads resume and adds projects/certifications
Capabl analyzes evidence and computes readiness
Student views dashboard and skill breakdown
Student opens Decision Simulator to compare multiple learning paths
Student chooses a path and continues with a roadmap / interview preparation flow
🎯 Why Capabl is different
Most career tools either:

generate a generic roadmap
give a score with no explanation
or recommend one “best” next step
Capabl is different because it focuses on decision-making under uncertainty.

It does three important things:

grounds the score in evidence
shows tradeoffs between multiple paths
keeps the human in control
Capabl is not trying to replace judgment. It is trying to help a student make a better one.

⚠️ Current limitations / future work
Capabl is still evolving. Some future improvements include:

broader role coverage
stronger resume extraction / OCR fallback for difficult PDFs
more robust interview analytics
longer 30/60/90-day plans
repeated simulation as the student’s evidence grows
stronger recruiter-facing profile insights
📜 License
This project is currently shared for learning / showcase / hackathon purposes. Add a license here if you want to open-source it formally.

🙌 Acknowledgements
Google Gemini
Retell AI
Prisma
Neon
Vercel
Render
Final note
Capabl is built around a simple belief:

Students don’t just need more advice. They need help making better career decisions from the evidence they already have.




SAME TO SAME
PROPER ITENDATION I WANT

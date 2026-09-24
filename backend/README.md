# Capabl Backend API

Express & TypeScript backend service for Capabl, providing authentication, resume processing, AI readiness scoring, and mock interview integration.

## Tech Stack

- **Runtime:** Node.js & TypeScript (`tsx`)
- **Framework:** Express 5
- **ORM & Database:** Prisma & PostgreSQL (Neon)
- **AI Services:** Google Gemini API & Retell AI

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Ensure the following variables are configured:
- `PORT`
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `JWT_SECRET`

### 3. Database Migration

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

The API server will run at `http://localhost:5000`.

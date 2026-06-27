# ⚡ Deadline Slayer AI

> **"An AI Chief of Staff that predicts which commitments you will fail — before you fail them."**

Built for **Vibe2Ship Hackathon** by Coding Ninjas × Google for Developers.

---

## 🏆 What It Does

Deadline Slayer is **not** a reminder app. It's an autonomous AI executive assistant powered by **Gemini 2.5 Pro** that:

- **Calculates failure probability** for every task in real time (0–100% risk score)
- **Runs life simulations** — shows you exactly what happens if you act now vs delay
- **Generates AI daily briefings** (JARVIS-style morning mission commander)
- **Builds optimal schedules** based on your energy levels and real free time
- **Negotiates impossible workloads** — tells you what to complete, delegate, or skip

---

## 🤖 AI Agent Architecture

```
User Input
    ↓
Agent 1: Task Risk Analyzer      → Calculates miss probability per task
    ↓
Agent 2: Daily Commander         → Generates personalized mission briefing
    ↓
Agent 3: Schedule Optimizer      → Creates energy-aware time blocks
    ↓
Agent 4: Life Simulation Engine  → Runs Scenario A vs B future simulations
    ↓
Agent 4B: AI Negotiator          → Makes tough calls when overloaded
```

All agents run on **Gemini 2.5 Pro** via Google AI Studio.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| AI | Gemini 2.5 Pro (Google AI Studio) |
| Charts | Recharts |
| Deployment | Google AI Studio / Vercel |

---

## 🚀 Setup (5 steps)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/deadline-slayer.git
cd deadline-slayer
npm install
```

### 2. Set up Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste contents of `supabase-schema.sql` → Run
3. Copy your Project URL and anon/service keys

### 3. Set up Clerk

1. Create app at [clerk.com](https://clerk.com)
2. Copy publishable key and secret key

### 4. Get Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create API Key → copy it

### 5. Configure environment

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local
```

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

GEMINI_API_KEY=AIza...
```

### 6. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📱 Core Features

| Feature | Description |
|---|---|
| 🎯 **Risk Score Engine** | Every task gets a live 0-100% failure probability |
| 🌅 **Daily Commander** | JARVIS-style morning briefing with mission + alerts |
| 🔮 **Life Simulation** | Act now vs delay — see exact probability difference |
| 📅 **AI Time Blocks** | Optimal schedule built around your energy levels |
| 🤝 **AI Negotiator** | Impossible workload? AI decides what to cut |
| 📊 **Analytics** | Productivity score, completion rate, risk trends |

---

## 🏗 Project Structure

```
deadline-slayer/
├── app/
│   ├── api/
│   │   ├── tasks/          # CRUD + auto risk analysis
│   │   ├── analyze/        # All 4 AI agents
│   │   ├── schedule/       # AI time block generator
│   │   ├── profile/        # User profile
│   │   └── stats/          # Analytics data
│   ├── dashboard/
│   │   ├── page.tsx        # Command Center (main)
│   │   ├── tasks/          # Task management
│   │   ├── schedule/       # AI schedule view
│   │   ├── simulate/       # Life Simulation Engine
│   │   ├── negotiate/      # AI Negotiator
│   │   └── analytics/      # Charts & stats
│   ├── sign-in/
│   ├── sign-up/
│   └── onboarding/
├── components/
│   └── dashboard/
│       ├── RiskBadge.tsx
│       └── AddTaskModal.tsx
├── lib/
│   ├── gemini.ts           # All 4 AI agents
│   └── supabase.ts
├── types/
│   └── index.ts
└── supabase-schema.sql
```

---

## 🎯 Evaluation Criteria Coverage

| Criteria | How We Score |
|---|---|
| **Agentic Depth (20%)** | 4 distinct AI agents with autonomous decision-making |
| **Innovation (20%)** | Life Simulation Engine — unique in this space |
| **Problem Solving (20%)** | Predicts failure before it happens, not just reminders |
| **Google Tech (15%)** | Gemini 2.5 Pro + Google AI Studio deployment |
| **Product Design (10%)** | Command center dark UI with risk-first UX |
| **Technical (10%)** | Full-stack, typed, real DB, production-ready |
| **Completeness (5%)** | All core flows working end-to-end |

---

## 🔑 The Core Differentiator

> *"Every other app reminds you. Deadline Slayer AI prevents failure."*

The AI doesn't wait for you to miss a deadline. It calculates — right now — whether you **will** miss it based on your actual free time, energy levels, and procrastination history. Then it acts.

---

## 📄 License

MIT

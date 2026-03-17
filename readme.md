# Agentic-Draft 🚀

An intelligent, full-stack content orchestration system that transforms raw notes into polished LinkedIn posts using a multi-agent AI workflow.



## 🌟 Overview
Agentic-Draft isn't just a wrapper for an LLM. It uses **LangGraph** to orchestrate a "debate" between specialized AI agents:
1. **The Analyst**: Extracts key insights and technical nuances from the source.
2. **The Writer**: Crafts a compelling narrative tailored for professional social media.
3. **The Critic**: Reviews the draft for tone, clarity, and engagement, forcing iterations if standards aren't met.

## 🏗️ The Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript.
- **AI Orchestration**: LangGraph, Google Gemini 1.5 Pro/Flash.
- **Database & Queue**: PostgreSQL (Prisma ORM), Redis, BullMQ.

## 📂 Project Structure
```text
Agentic-Draft/
├── agentic-draft-core/    # Backend API & Worker
│   ├── src/agents/        # LangGraph agent logic
│   ├── src/queue/         # BullMQ worker & producer
│   └── prisma/            # Database schema
└── agentic-draft-ui/      # Next.js Frontend
    ├── src/app/           # Dashboard & Layout
    └── src/lib/           # API utilities
🚀 Getting Started
1. Prerequisites
Docker (for PostgreSQL and Redis)

Node.js (v20+)

Google Gemini API Key

2. Environment Setup
Create a .env file in agentic-draft-core:

Code snippet

DATABASE_URL="postgresql://user:password@localhost:5432/agentic_draft"
REDIS_URL="redis://localhost:6379"
GOOGLE_API_KEY="your_gemini_key_here"
3. Installation & Running
Terminal 1: Infrastructure

Bash

docker start your-postgres-container your-redis-container
Terminal 2: Backend API

Bash

cd agentic-draft-core
npm install
npx prisma generate
npx ts-node --transpile-only src/index.ts
Terminal 3: Worker (AI Brain)

Bash

cd agentic-draft-core
npx ts-node --transpile-only src/queue/worker.ts
Terminal 4: Frontend UI

Bash

cd agentic-draft-ui
npm install
npm run dev
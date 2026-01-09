# LexiPlan

Enterprise-Grade RAG Document Intelligence & Collaboration Platform

[Live Demo](https://lexiplan-client.vercel.app/)

LexiPlan is a modern SaaS workspace that helps teams:

- Organize projects and documents in one place
- Ask AI questions grounded in their own content (RAG)
- Track adoption and impact with clear, actionable analytics
- Collaborate securely with role-based permissions and org-level isolation

It’s built for organizations that want fast knowledge retrieval from PDFs and project docs, simple collaboration, and a clear view of what’s working.

## What It Does

- Turn scattered PDFs into answers: Upload files and get accurate, concise responses generated from your content via a Retrieval-Augmented Generation (RAG) pipeline.
- Keep projects on track: Group documents by project, set status, and find things quickly with search and filters.
- Chat with context: Streamed AI chat that respects org/project context; save and revisit conversations.
- See what’s working: Lightweight analytics show usage, document readiness, message trends, and recent activity.

## System Architecture

LexiPlan uses a Split-Cloud architecture to optimize both responsiveness and heavy compute:

- Frontend (Vercel): React/Vite SPA with Tailwind CSS providing a seamless, low-latency interface.
- Backend (Railway): Dockerized Node.js/Express environment for long-running LangChain RAG operations, PDF parsing, and SSE chat streaming.
- Database (MongoDB Atlas): Primary store for users, organizations, projects, documents, conversations, and analytics snapshots.

## Core AI Intelligence

1. RAG Pipeline

- Semantic chunking: PDFs (up to ~2MB) split into meaningful segments to preserve context.
- Embedding: Chunks are converted into vectors using Google's `text-embedding-004` model.
- Retrieval: Vector search finds the most relevant segments for each query, filtered by `orgId` (and optionally `projectId`) to enforce tenant boundaries.
- Grounded synthesis: Google Gemini generates answers strictly from retrieved context to minimize hallucinations.

2. Conversational Memory

- Context-aware chat: LangChain memory preserves recent conversation state, enabling follow-ups like “Summarize that last point”.

## Security & Administration

- RBAC: Roles (Admin, Member, Viewer) define who can manage users, projects, and documents.
- Invitations: Admins can invite users to the organization via email.
- Enforcement: Middleware protects sensitive actions (e.g., document deletion, user management) based on role and tenant.
- Cookies & CSRF: HttpOnly JWT cookies (SameSite=None) and a double-submit CSRF pattern for safe mutations.

## Key Features

- Projects: Create/edit/delete, status tracking, search + status filters, per-organization uniqueness.
- Documents: PDF upload with background vectorization, pagination/filter/sort, rename/delete.
- Chat (RAG): Gemini-powered streaming chat, project- or org-scoped history, retrieval over your documents.
- Analytics: Snapshot model with totals, documents by project/status, messages by day, recent items, and derived KPIs.
- Auth & Org: Register/login/logout, invite flow support, roles, tenant isolation middleware.
- UX: Polished and responsive UI with dialogs, filter bars, and custom chart primitives.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios.
- Backend: Node.js, Express 5 (ES modules).
- Orchestration: LangChain (RAG + conversation memory).
- AI Engine: Google Gemini.
- Database: MongoDB Atlas.
- Security: HttpOnly JWT cookies, SameSite=None, CSRF double-submit, RBAC middleware.
- DevOps: Docker, Railway (backend), Vercel (frontend).

## API Surface (Brief)

- Projects: list (search/status/sort), create, update, delete, get by id.
- Documents: list (project/search/status/pagination/sort), upload, delete, update, get by id.
- Chat: send (SSE streaming), history (org/project), conversation CRUD.
- Analytics: get snapshot.
- Auth/Org: register, login, logout, accept invite, team endpoints.

## Data & Models

- Project (unique per org), Document, Conversation, Analytics (documentsByProject, messagesByDay, recents, derived metrics), Organization, User.

## Setup & Run

Prerequisites: Node.js 18+, Docker (optional), Google Gemini API key.

1. Install dependencies and launch

```bash
# Run Backend
cd server
npm install
npm run dev

# Run Frontend
cd ../client
npm install
npm run dev
```

2. Configure environment
   (See `.env.example` in each directory for the format)

- Backend (/server): `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_URL`.
- Frontend (/client): `VITE_API_BASE_URL`.

3. Optional: Docker

```bash
docker-compose up
```

## Deployment Notes

- Ensure SSE support for streaming chat responses.
- Set secure cookie attributes and CSRF headers for mutations.
- Verify base URLs and CORS for Vercel (FE) and Railway (BE).

## Testing & Quality

- Add lint/test scripts as needed.
- Recommended manual flow: projects → documents → chat (RAG) → analytics.

## Usage Flow

Create a project → upload documents → chat with project context (RAG) → view analytics for adoption and content health.

## Future Roadmap

- Redis integration for semantic caching to reduce API costs.
- Rate limiting to protect Gemini API quotas (sliding window).
- Multi-modal RAG for images and tables within PDFs.
- Activity logs for admin actions (audit trail).

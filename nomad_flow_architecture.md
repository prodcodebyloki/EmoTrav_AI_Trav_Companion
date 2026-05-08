# Nomad Flow — Technical Architecture

> **Adaptive Travel Experience Engine**
> Stack decision: Simplest viable path using Google Agent SDK + Google services. No user persistence — browser session only.

---

## Engineering Philosophy

> Pick boring infrastructure, invest complexity budget into the AI layer.

- Monorepo, two apps: `web` (Next.js) + `api` (FastAPI)
- Single Gemini model family throughout — no model zoo
- Session state lives in the browser (`sessionStorage` + Zustand)
- No auth, no database, no cloud infra beyond a single Cloud Run deployment

---

## 1. Frontend Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR for first load, RSC for static shells, client components for interactivity |
| Language | **TypeScript** | Type-safe agent response contracts |
| State | **Zustand** | Lightweight, no boilerplate, works perfectly with sessionStorage middleware |
| Session Persistence | **Zustand `persist` middleware → `sessionStorage`** | Tab-scoped state, zero backend, clears on close |
| Styling | **Vanilla CSS + CSS Variables** | Full design control, no class bloat |
| Animation | **Framer Motion** | Timeline animations, energy curve transitions |
| Data Viz | **Recharts** | Budget flow charts, energy maps |
| Icons | **Lucide React** | Minimal, consistent icon set |
| HTTP Client | **TanStack Query (React Query)** | SSE streaming + mutation lifecycle management |
| Map | **react-simple-maps** or **Mapbox GL JS** | Neighborhood routing visualization |

### Key Frontend Patterns

```
- Streaming UI: SSE from FastAPI → `useEventSource` hook → Zustand slice update → React re-render
- Optimistic updates: Show skeleton itinerary while AI streams
- Session hydration: On page load, rehydrate Zustand from sessionStorage
- No login wall: Anonymous session ID generated client-side (nanoid)
```

---

## 2. Backend Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **FastAPI** | Async-first, SSE support, minimal overhead |
| Language | **Python 3.12** | Google Agent SDK is Python-native |
| AI Orchestration | **Google Agent Development Kit (ADK)** | Multi-agent orchestration, tool use, Gemini integration |
| Model | **Gemini 2.0 Flash** | Speed + cost for streaming; upgrade to Pro for complex replanning |
| Session Store | **In-process dict (TTL cache)** | No DB — session tied to anonymous ID, expires after inactivity |
| Deployment | **Google Cloud Run** | Serverless, scales to zero, no infra management |
| Environment Config | **python-dotenv** | Local `.env`, Cloud Run secrets via env vars |
| CORS | **FastAPI CORSMiddleware** | Allow Next.js dev + prod origins |

> [!IMPORTANT]
> No database is used. Session state is a Python `TTLCache` (cachetools) keyed by `session_id`. The client holds the source of truth; backend is stateless between requests except for in-flight streaming.

---

## 3. AI Engineering Stack

### Model

```
Primary:   gemini-2.0-flash-001   ← streaming itinerary generation, fast adaptation
Fallback:  gemini-1.5-flash-001   ← budget-sensitive fallback if quota hit
```

### Agent Architecture (Google ADK)

All agents are defined as `google.adk.agents.Agent` instances. Orchestration uses ADK's `SequentialAgent` and `ParallelAgent` primitives.

```
                      ┌─────────────────────┐
                      │   OrchestratorAgent  │   (ADK SequentialAgent)
                      └──────────┬──────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
      ┌───────▼──────┐  ┌───────▼──────┐  ┌────────▼──────┐
      │ PlannerAgent │  │ ExperienceAg │  │  BudgetAgent  │
      │              │  │              │  │               │
      │ Builds day   │  │ Matches vibe │  │ Tracks spend  │
      │ structure +  │  │ + experience │  │ + suggests    │
      │ routing      │  │ curation     │  │ alternatives  │
      └──────────────┘  └──────────────┘  └───────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │  AdaptationAgent    │   (runs post-generation)
                      │  Handles: weather,  │
                      │  delays, fatigue,   │
                      │  replanning        │
                      └─────────────────────┘
```

### Agent Definitions

| Agent | ADK Type | Tools | Output |
|---|---|---|---|
| **PlannerAgent** | `LlmAgent` | `google_search` (Grounding), `geocode_tool` | Day structure JSON |
| **ExperienceAgent** | `LlmAgent` | `google_places_tool`, `google_search` | Experience list per day |
| **BudgetAgent** | `LlmAgent` | `currency_tool`, custom `budget_allocator` | Budget breakdown per day |
| **AdaptationAgent** | `LlmAgent` | `weather_tool` (wttr.in), `google_search` | Diff patch on itinerary |
| **OrchestratorAgent** | `SequentialAgent` | Delegates to above | Final trip JSON |

### Tools Used

```python
# Google-native tools
- google_search          # ADK built-in, used for grounding destination facts
- google_places_tool     # Custom wrapper over Places API (New)

# External lightweight tools
- weather_tool           # wttr.in JSON API, no key needed
- currency_tool          # frankfurter.app, free, no key

# Custom tools
- budget_allocator       # Pure function: distribute budget across days/categories
- geocode_tool           # Google Maps Geocoding API
```

### Streaming Strategy

```
Client                FastAPI              ADK Agent
  │                      │                     │
  │── POST /trip/gen ──►  │                     │
  │                      │── runner.run_async ─►│
  │◄── SSE stream ───────│◄── yield chunks ─────│
  │  (delta JSON)        │                     │
```

Use `google.adk.runners.Runner` with `stream=True`. Each yielded event is a partial itinerary update sent as an SSE `data:` frame.

---

## 4. Google Services Used

| Service | Usage | SDK/API |
|---|---|---|
| **Gemini 2.0 Flash** | All LLM inference | `google-genai` via ADK |
| **Google Search (Grounding)** | Destination facts, event discovery | ADK built-in tool |
| **Google Places API (New)** | POI lookup, neighborhood routing | `googlemaps` Python SDK |
| **Google Maps Geocoding** | Lat/lng resolution for routing | `googlemaps` Python SDK |
| **Google Cloud Run** | Backend deployment | `gcloud` CLI |
| **Google Secret Manager** | API key storage in prod | `google-cloud-secret-manager` |

> [!NOTE]
> Google Maps + Places requires one API key with Places API (New) + Geocoding + Maps JS enabled. All other Google services use the same GCP project.

---

## 5. Session Management

> Browser-local, tab-scoped, no server persistence.

```
Browser Tab
├── sessionStorage
│   └── nomadflow_session
│       ├── session_id: "nanoid-xyz"        ← anonymous, generated on first load
│       ├── current_trip: { ...trip JSON }   ← full itinerary
│       ├── user_inputs: { ...form state }   ← intent + soft inputs
│       └── adaptation_log: [ ...events ]    ← change history this session
│
└── Zustand Store (in-memory, synced to sessionStorage)
    ├── tripSlice
    ├── uiSlice
    └── budgetSlice
```

The `session_id` is sent as a header on every API call. FastAPI uses it as a TTL cache key (30-min timeout) to hold intermediate agent state during multi-step streaming.

---

## 6. Data Contracts

### Trip Request (Client → API)

```typescript
interface TripRequest {
  session_id: string;
  hard_inputs: {
    origin_city: string;
    budget_usd: number;
    days: number;
    group_size: number;
    transport: "flight" | "train" | "car" | "any";
  };
  soft_inputs: {
    vibe: "romantic" | "adventurous" | "healing" | "chaotic" | "social" | "slow" | "creative";
    energy_level: "low" | "medium" | "high";
    spontaneity: number; // 1–5
    social_preference: "solo" | "small_group" | "crowd";
  };
}
```

### Trip Response (Streamed SSE)

```typescript
interface TripStreamEvent {
  type: "day_ready" | "budget_update" | "experience_added" | "adaptation" | "complete" | "error";
  payload: DayPlan | BudgetUpdate | Experience | AdaptationDiff;
  session_id: string;
}

interface DayPlan {
  day_number: number;
  emotional_theme: string;        // "decompress" | "exploration" | "peak" | "wind-down"
  energy_curve: number[];         // hourly 0–100 score
  location_zone: string;
  experiences: Experience[];
  estimated_spend: number;
  transport_between: string;
}
```

---

## 7. Folder Structure

```
nomad-flow/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx              # Intent capture screen
│   │   │   │   ├── globals.css
│   │   │   │   └── workspace/
│   │   │   │       └── [tripId]/
│   │   │   │           └── page.tsx      # Main trip workspace
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── intent/
│   │   │   │   │   ├── VibeSelector.tsx
│   │   │   │   │   ├── InputForm.tsx
│   │   │   │   │   └── MoodCard.tsx
│   │   │   │   ├── workspace/
│   │   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   │   ├── JourneyTimeline.tsx
│   │   │   │   │   ├── EnergyCurve.tsx
│   │   │   │   │   ├── BudgetFlow.tsx
│   │   │   │   │   ├── MapPanel.tsx
│   │   │   │   │   ├── AdaptationAlert.tsx
│   │   │   │   │   └── DayCard.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Badge.tsx
│   │   │   │       └── Skeleton.tsx
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── index.ts              # Zustand root
│   │   │   │   ├── tripSlice.ts
│   │   │   │   ├── uiSlice.ts
│   │   │   │   └── budgetSlice.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useTripStream.ts      # SSE consumer
│   │   │   │   ├── useAdaptation.ts      # Trigger replanning
│   │   │   │   └── useSession.ts         # Session ID init + storage
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                # Typed fetch wrappers
│   │   │   │   ├── session.ts            # sessionStorage R/W
│   │   │   │   └── contracts.ts          # Shared TypeScript types
│   │   │   │
│   │   │   └── styles/
│   │   │       ├── tokens.css
│   │   │       ├── typography.css
│   │   │       └── animations.css
│   │   │
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/                          # FastAPI backend
│       ├── main.py                   # App entry, CORS, routes
│       ├── routers/
│       │   ├── trip.py               # POST /trip/generate (SSE)
│       │   ├── adapt.py              # POST /trip/adapt
│       │   └── session.py            # GET /session/ping
│       │
│       ├── agents/
│       │   ├── __init__.py
│       │   ├── orchestrator.py       # OrchestratorAgent (SequentialAgent)
│       │   ├── planner.py            # PlannerAgent
│       │   ├── experience.py         # ExperienceAgent
│       │   ├── budget.py             # BudgetAgent
│       │   └── adaptation.py        # AdaptationAgent
│       │
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── places.py             # Google Places API wrapper
│       │   ├── geocode.py            # Google Maps Geocoding
│       │   ├── weather.py            # wttr.in tool
│       │   ├── currency.py           # frankfurter.app tool
│       │   └── budget_allocator.py   # Pure function tool
│       │
│       ├── models/
│       │   ├── request.py            # TripRequest pydantic model
│       │   ├── response.py           # TripStreamEvent, DayPlan models
│       │   └── session.py            # SessionState model
│       │
│       ├── session/
│       │   └── store.py              # TTLCache session manager
│       │
│       ├── config.py                 # Settings, env vars
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/                         # Shared types (optional, TS monorepo)
│   └── contracts/
│       └── index.ts                  # Mirror of contracts.ts for type sharing
│
├── .env.example
├── docker-compose.yml               # Local dev: web + api together
├── turbo.json                       # Turborepo build orchestration
└── README.md
```

---

## 8. Local Development Setup

```bash
# Prerequisites
node >= 20, python >= 3.12, poetry or pip

# Clone and install
git clone <repo>
cd nomad-flow

# Frontend
cd apps/web && npm install && npm run dev   # → localhost:3000

# Backend
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000       # → localhost:8000

# Or run both with Docker Compose
docker compose up
```

### Required `.env` Keys

```bash
GOOGLE_API_KEY=          # Gemini + Google Search grounding
GOOGLE_MAPS_API_KEY=     # Places (New) + Geocoding
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 9. Deployment

```
Frontend → Google Cloud Run (same platform as backend, no Vercel)
Backend  → Google Cloud Run
CI/CD    → GitHub Actions (no Docker required — Cloud Run source deploy)
Secrets  → Google Secret Manager (injected as env vars at runtime)
```

### Frontend — Cloud Run (Next.js)

```bash
gcloud run deploy emotrav-web \
  --source apps/web \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://emotrav-api-<hash>-uc.a.run.app
```

### Backend — Cloud Run (FastAPI)

```bash
gcloud run deploy emotrav-api \
  --source apps/api \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GOOGLE_API_KEY=emotrav-google-api-key:latest \
  --set-secrets GOOGLE_MAPS_API_KEY=emotrav-maps-api-key:latest
```

> Cloud Run `--source` flag builds and deploys directly from source — no Dockerfile needed.
> Google Cloud Buildpacks auto-detects Node.js (web) and Python (api).

### GitHub Actions CI/CD

Two workflows in `.github/workflows/`:

**`deploy-api.yml`** — triggers on push to `main`, path `apps/api/**`
```yaml
- uses: google-github-actions/auth@v2
- run: gcloud run deploy emotrav-api --source apps/api ...
```

**`deploy-web.yml`** — triggers on push to `main`, path `apps/web/**`
```yaml
- uses: google-github-actions/auth@v2
- run: gcloud run deploy emotrav-web --source apps/web ...
```

Auth uses Workload Identity Federation — no service account key stored in GitHub.

---

## 10. Build Order (Sprint Sequence)

| Sprint | Deliverable |
|---|---|
| **S1** | Next.js scaffold + intent capture UI + Zustand session setup |
| **S2** | FastAPI + PlannerAgent + streaming SSE to UI (mock experience data) |
| **S3** | ExperienceAgent + BudgetAgent + Places API integration |
| **S4** | JourneyTimeline + EnergyCurve + BudgetFlow UI components |
| **S5** | AdaptationAgent + real-time replanning triggers |
| **S6** | AdaptationAlerts UI + MapPanel + polish |
| **S7** | GitHub Actions CI/CD + Cloud Run deploy (both services) + end-to-end test |

---

## Decision Log

| Decision | Rationale |
|---|---|
| FastAPI over Next.js API routes | SSE streaming is more reliable in a dedicated Python server; ADK is Python-only |
| sessionStorage over localStorage | Trips are ephemeral by design; tab isolation prevents stale state bleed |
| TTLCache over Redis | No infra dependency; session volume is low and ephemeral |
| Gemini Flash over Pro | Pro is 10x slower for streaming; Flash quality is sufficient for itinerary text |
| react-simple-maps over Google Maps JS | Lighter bundle; we only need area visualization, not full map interaction |
| Monorepo (Turborepo) | Shared type contracts between frontend + backend TS types |
| Cloud Run over Vercel (frontend) | Single platform (GCP) for both services — simpler secrets, billing, and IAM |
| No Docker | Cloud Run source deploy with Buildpacks removes Dockerfile maintenance overhead |
| GitHub Actions over Cloud Build | Repo already on GitHub; keeps CI/CD in one place, Workload Identity = no stored keys |

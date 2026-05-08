# EmoTrav — Pre-Build Clarification & Gap Analysis

> What's missing before development starts, and which API keys to prepare.

---

## 1. Product Decisions — RESOLVED

### Destination Scope: Curated City List (8 cities, 1 per continent + Japan + India)

MVP is locked to these cities only. Gemini grounding + Places API data quality is best-in-class for all of them. Expansion to open-ended input = post-MVP.

| Continent | City | Country | Why |
|---|---|---|---|
| **Asia** | **Tokyo** | Japan | Required. World-class transit, density of experience types, strong Places API coverage |
| **Asia** | **Mumbai** | India | Required. Maximum vibe contrast — chaos, colour, coast, culture |
| **Europe** | **Lisbon** | Portugal | Best-value European city, strong backpacker + slow travel + romantic overlap |
| **North America** | **Mexico City** | Mexico | Cultural depth, food scene, walkable neighbourhoods, budget-friendly |
| **South America** | **Medellín** | Colombia | Transformation narrative, spring climate year-round, creative energy |
| **Africa** | **Cape Town** | South Africa | Natural + urban contrast, adventure + healing vibes both strong |
| **Oceania** | **Melbourne** | Australia | Café culture, laneways, arts scene — suits slow/creative/social vibes |
| **Middle East** | **Dubai** | UAE | Aspirational, high-budget tier, luxury + chaotic vibe anchor |

> Antarctica excluded by user instruction.

**Implementation impact:**
- `origin_city` and destination are validated against this list at the API boundary
- `CityConfig` object per city stores: timezone, currency hint, neighborhood zones, Places API area bias, vibe-affinity scores
- Fallback copy ready for unsupported city input: *"We're expanding soon — pick from our current cities to get started."*

---

### Trip Length Limits

| Constraint | Value | Reason |
|---|---|---|
| Minimum | **2 days** | 1-day trips = no arc, no energy curve, no meaningful adaptation |
| Maximum | **10 days** | DayCard grid stays manageable; beyond 10 days budget math degrades without persistence |
| Default suggestion | **4 days** | Sweet spot for MVP demo and most weekend/short-break use cases |

---

### Budget Currency

**Always USD for MVP.** Conversion note shown per city (e.g. "≈ ¥85,000" next to $580 in Tokyo view). Uses `frankfurter.app` for live rate, displayed as soft hint only — not used in budget logic.

Post-MVP: detect origin city → offer local currency as primary.

---

### Group Size Logic

**Total budget, not per-person.** User enters the total they want to spend. Group size affects:
- Experience suggestions (solo café vs. group restaurant)
- Accommodation category hinting (hostel dorm vs. private room vs. apartment)
- AI prompt context only — no hard per-head math in MVP

Display label: *"Total budget for your trip"* — group size shown as context tag on the budget panel.

---

### Spontaneity Slider — Prompt Behavior

| Level | Label | What changes in AI prompt |
|---|---|---|
| 1 | *Planner* | Fixed time slots, specific named venues, exact opening hours, no gaps |
| 2 | *Guided* | Named venues with 1 alternative each, soft time windows (morning/afternoon) |
| 3 | *Balanced* | Mix of anchors + open slots; 2–3 "wander here" zones per day |
| 4 | *Spontaneous* | Only 1–2 anchors per day, rest described as neighbourhood moods not venues |
| 5 | *Surprise Me* | Loose day themes only, AI picks everything, no specific times, hidden gem bias |

Prompt injection: `SPONTANEITY_LEVEL={n}` token in PlannerAgent system prompt triggers a behavior block defined in the prompt engineering doc.

---

### Adaptation Triggers

Three trigger sources — all feed the same AdaptationAgent:

| Trigger | Source | Threshold |
|---|---|---|
| **Weather change** | `wttr.in` polled once per day-boundary | Rain > 60% probability for outdoor activity window |
| **User chat message** | Explicit replan request ("change this", "make it slower", "swap day 3") | Keyword + intent detection in OrchestratorAgent |
| **Manual "Adapt" button** | User taps ⚡ icon on any DayCard | Always triggers, no threshold |

Time-of-day fatigue signals and passive behavioral triggers = post-MVP. Too complex without user persistence.

---

### Error States

| Scenario | What user sees |
|---|---|
| Gemini fails mid-stream | Partial days already rendered stay visible. Toast: *"Generation paused — tap to retry from Day N"*. Retry resumes from last complete day. |
| Places API returns empty | Day card shows neighbourhood + experience type (e.g. "Great coffee spot in Shimokitazawa") without a specific venue name. No broken card. |
| Network drop during SSE | `useEventSource` reconnects automatically ×3. After 3 fails: *"Lost connection — your progress is saved. Reconnecting…"* |
| Unsupported city entered | Inline validation before submission. No API call made. |
| Budget too low for city | BudgetAgent flags it. UI shows: *"Tokyo on $200 for 4 days is tight — we'll make it work but expect trade-offs."* Not a blocker. |

---

## 2. AI Prompt Engineering Doc (Biggest Gap)

The architecture doc defines agent *structure* but not agent *instructions*. Missing:

- System prompt for each agent: PlannerAgent, ExperienceAgent, BudgetAgent, AdaptationAgent
- Output schema each agent must return (JSON structure, field names, types)
- How `vibe` + `energy_level` + `spontaneity` dial translate into prompt language
- Grounding instructions — when to use Google Search vs. rely on model knowledge
- Fallback behavior when a tool returns empty results

**Without this, Sprint 2 stalls on day 1.**

---

## 3. Environment & Repo Setup (Not Documented)

| Item | Status |
|---|---|
| `.env.example` file content | Missing — both docs mention it but it doesn't exist |
| `turbo.json` config | Missing |
| `docker-compose.yml` for local dev | Missing |
| Node version pinning (`.nvmrc`) | Missing |
| Python version pinning (`pyproject.toml` or `.python-version`) | Missing |
| ESLint + Prettier config | Missing |
| Pre-commit hooks | Optional but saves pain later |

---

## 4. Data Contract Gaps

`contracts.ts` covers `TripRequest` and `TripStreamEvent` but the following types are referenced but never defined:

| Missing Type | Referenced In |
|---|---|
| `Experience` | `DayPlan.experiences[]` |
| `BudgetUpdate` | `TripStreamEvent.payload` |
| `AdaptationDiff` | `TripStreamEvent.payload` |
| `AdaptationRequest` | Client → `/trip/adapt` endpoint |
| Error envelope format | SSE error frames |

---

## 5. Map Library Decision

Arch doc says `react-simple-maps` **or** Mapbox GL JS — needs a decision before Sprint 1. They are architecturally different:

| Option | Pros | Cons |
|---|---|---|
| `react-simple-maps` | Free, no API key, lightweight bundle | No routing lines, no street-level detail |
| Mapbox GL JS | Rich interaction, routing, street detail | Needs API key + billing account |

**Recommendation for MVP:** `react-simple-maps`. Switch to Mapbox only if routing lines or street-level zoom are needed.

---

## 6. Font Loading Strategy

Design doc specifies Fraunces + Inter but loading method not defined:

- **Google Fonts** — easy setup, minor privacy concern (GDPR), external dependency
- **Self-hosted** — faster, no GDPR issue, slightly more setup
- **`next/font`** — correct approach for Next.js 15, handles both options

Decision needed before Sprint 1 CSS setup.

---

## 7. API Keys — Full List

### Required Day 1 (nothing works without these)

| Key | Where to generate | Used for | Free tier |
|---|---|---|---|
| `GOOGLE_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key | Gemini 2.0 Flash inference + Google Search grounding via ADK | Yes — generous free tier |
| `GOOGLE_MAPS_API_KEY` | GCP Console → APIs & Services → Credentials | Places API (New) + Geocoding API | $200/mo free credit |

**For the Maps key — enable these APIs in GCP Console:**
- Places API (New) — not the legacy Places API
- Geocoding API
- Maps JavaScript API (only if using Mapbox route, skip this)

---

### Required for Deployment (Sprint 7)

| Key / Config | Where | Used for |
|---|---|---|
| **GCP Project ID** | GCP Console → project selector | Cloud Run deploy target for both web + api |
| **Workload Identity Pool + Provider** | GCP IAM → Workload Identity Federation | GitHub Actions → GCP auth without stored keys |
| **GitHub repo connected to GCP** | GCP IAM → grant `roles/run.admin` + `roles/storage.admin` to WIF service account | CI/CD push on merge to main |
| **Google Secret Manager secrets** | GCP → Secret Manager | Store `GOOGLE_API_KEY` and `GOOGLE_MAPS_API_KEY` — injected at Cloud Run deploy time |

> No Vercel. No Docker. No service account JSON stored in GitHub. Workload Identity Federation handles auth.

Setup order for Sprint 7:
1. Create GCP project
2. Enable APIs: Cloud Run, Cloud Build, Secret Manager, IAM
3. Store both API keys in Secret Manager
4. Set up Workload Identity Federation for GitHub repo
5. Add `deploy-api.yml` + `deploy-web.yml` to `.github/workflows/`
6. Push to main → auto-deploys both services

---

### Not Required — Already Free, No Key Needed

| Service | Reason |
|---|---|
| `wttr.in` weather | Public JSON API |
| `frankfurter.app` currency | Public API |

---

### Only If Switching to Mapbox

| Key | Where |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | mapbox.com → Account → Tokens |

---

## 8. Recommended Next Step

Write the **AI Prompt Engineering doc** before any code.

That doc drives Sprint 2 and every agent after it. Everything else (repo scaffold, `.env`, type gaps) can be done in a few hours. Prompt design takes iteration — start it first.

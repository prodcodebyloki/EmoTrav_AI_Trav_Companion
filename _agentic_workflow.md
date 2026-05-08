# EmoTrav Agent Flow

## Overview

User input → API → OrchestratorAgent → 3 parallel agents → SSE stream → Frontend

---

## Request Shape

```json
{
  "session_id": "abc123",
  "hard_inputs": { "destination_city": "Tokyo", "budget_usd": 1500, "days": 4, "group_size": 1 },
  "soft_inputs":  { "vibe": "adventurous", "energy_level": "high", "spontaneity": 3 }
}
```

---

## Agent Pipeline

```
POST /trip/generate
        │
        ▼
OrchestratorAgent
        │
        ├─ 1. PlannerAgent          (1 Gemini call)
        │      └─ builds N day skeletons
        │         each skeleton: day_number, emotional_theme,
        │                        energy_curve[18], location_zone,
        │                        anchor_count, transport_between
        │
        ├─ 2. ExperienceAgent × N   (N parallel Gemini calls via asyncio.gather)
        │      └─ fills each skeleton with real experiences
        │         each experience: name, type, location+coords,
        │                          time_start, cost, energy_score,
        │                          vibe_tags, notes, alternatives[]
        │
        └─ 3. BudgetAgent           (pure Python, no Gemini)
               └─ computes per-day + category breakdown
                  flags: on_track / near_limit / over_budget
```

---

## SSE Event Stream (frontend receives in order)

| Event | When | Payload |
|---|---|---|
| `day_ready` | after each day completes | full `DayPlan` object |
| `budget_update` | after all days done | `BudgetSummary` |
| `complete` | final | full trip + all days + budget |
| `error` | on any exception | code, message, retryable |

---

## Agent Details

### PlannerAgent
- **Input**: full `TripRequest`
- **Output**: `DayPlan[]` skeletons (no experiences yet)
- **Key config used**: `ANCHOR_COUNTS[spontaneity]`, `SPONTANEITY_BLOCKS[spontaneity]`
- **Logic**: Day 1 always "decompress/exploration", last day always "wind-down/immersion"

### ExperienceAgent
- **Input**: one day skeleton + `TripRequest`
- **Output**: same skeleton + `experiences[]` + `estimated_spend`
- **Key config used**: `CITY_COST_PROFILES[city]`, `VIBE_BLOCKS[vibe]`
- **Parallelism**: all N days run concurrently via `asyncio.gather`

### BudgetAgent
- **Input**: all completed days + `TripRequest`
- **Output**: `BudgetSummary` with per-day breakdown and category totals
- **Key config used**: `ACCOMMODATION_TIERS[city]` (budget/mid/premium tier from daily spend)
- **No Gemini** — deterministic calculation only

---

## Config Knobs

| Constant | Controls |
|---|---|
| `ANCHOR_COUNTS` | `{1:6, 2:5, 3:3, 4:2, 5:1}` — how many named venues per spontaneity level |
| `SPONTANEITY_BLOCKS` | text rules injected into PlannerAgent prompt |
| `VIBE_BLOCKS` | text rules injected into ExperienceAgent prompt |
| `CITY_COST_PROFILES` | USD cost hints per category per city |
| `ACCOMMODATION_TIERS` | nightly rate by city × tier |

---

## Data Flow Diagram

```
IntentForm  →  Zustand store  →  POST /trip/generate
                                        │
                                  PlannerAgent
                                  (1 Gemini call)
                                        │
                                  skeletons[0..N]
                                  asyncio.gather
                                  ┌────┴────┐
                            Exp[0]  ...  Exp[N]   ← N parallel Gemini calls
                                  └────┬────┘
                                  BudgetAgent
                                  (pure Python)
                                        │
                                  SSE stream →  addDay() × N
                                               setBudget()
                                               setTrip()
```

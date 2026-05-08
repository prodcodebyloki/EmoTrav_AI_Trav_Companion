// EmoTrav — Complete Data Contracts
// Source of truth for all client ↔ API data shapes.
// Mirror in apps/api/models/ as Pydantic models.

// ─── Enums & Literals ────────────────────────────────────────────────────────

export type Vibe =
  | "romantic"
  | "adventurous"
  | "healing"
  | "chaotic"
  | "social"
  | "slow"
  | "creative";

export type EnergyLevel = "low" | "medium" | "high";

export type Transport = "flight" | "train" | "car" | "any";

export type SocialPreference = "solo" | "small_group" | "crowd";

export type EmotionalTheme =
  | "decompress"
  | "exploration"
  | "peak"
  | "immersion"
  | "wind-down"
  | "spontaneous";

export type ExperienceType =
  | "food"
  | "culture"
  | "outdoor"
  | "nightlife"
  | "shopping"
  | "relaxation"
  | "transport";

export type BudgetFlag = "on_track" | "near_limit" | "over_budget";

export type StreamEventType =
  | "day_ready"
  | "budget_update"
  | "experience_added"
  | "adaptation"
  | "complete"
  | "error";

export type AdaptationTrigger = "weather" | "user_message" | "manual";

export type ChangeType = "swap" | "add" | "remove" | "reorder";

export type SupportedCity =
  | "Tokyo"
  | "Mumbai"
  | "Lisbon"
  | "Mexico City"
  | "Medellín"
  | "Cape Town"
  | "Melbourne"
  | "Dubai";

// ─── Location ─────────────────────────────────────────────────────────────────

export interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
  neighborhood: string;
}

// ─── Experience ───────────────────────────────────────────────────────────────

export interface ExperienceAlternative {
  id: string;
  name: string;
  reason: string;
}

export interface Experience {
  id: string;
  name: string;
  type: ExperienceType;
  location: Location;
  time_start: string;             // "HH:MM" 24h format
  duration_minutes: number;
  estimated_cost_usd: number;
  energy_score: number;           // 0–100, matches day energy_curve at time slot
  vibe_tags: string[];
  notes: string;
  alternatives: ExperienceAlternative[];
}

// ─── Day Plan ─────────────────────────────────────────────────────────────────

export interface DayPlan {
  day_number: number;
  emotional_theme: EmotionalTheme;
  energy_curve: number[];         // 18 integers, hourly 06:00–23:00, each 0–100
  location_zone: string;
  transport_between: string;      // how to get here from previous day, or "base" for day 1
  anchor_count: number;           // number of fixed experiences (driven by spontaneity)
  experiences: Experience[];
  estimated_spend: number;        // sum of experience costs for this day
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface DayBudget {
  day_number: number;
  accommodation_usd: number;
  transport_usd: number;
  food_usd: number;
  experiences_usd: number;
  misc_usd: number;
  day_total_usd: number;
  flag: BudgetFlag;
}

export interface CategoryTotals {
  accommodation_usd: number;
  transport_usd: number;
  food_usd: number;
  experiences_usd: number;
  misc_usd: number;
}

export interface BudgetSummary {
  total_budget_usd: number;
  days: number;
  daily_breakdown: DayBudget[];
  category_totals: CategoryTotals;
  grand_total_usd: number;
  remaining_usd: number;
  overall_flag: BudgetFlag;
  local_currency_hint: string;    // e.g. "≈ ¥142,500 JPY"
  warnings: string[];
}

export interface BudgetUpdate {
  type: "budget_update";
  budget: BudgetSummary;
}

// ─── Adaptation ───────────────────────────────────────────────────────────────

export interface AdaptationChange {
  day_number: number;
  type: ChangeType;
  experience_id: string;
  old_experience: Experience | null;   // null for "add" type
  new_experience: Experience | null;   // null for "remove" type
  reason: string;                      // human-readable, shown in AdaptationAlert UI
}

export interface AdaptationDiff {
  trigger: AdaptationTrigger;
  trigger_detail: string;
  affected_days: number[];
  summary: string;                     // one-line summary for the alert toast
  changes: AdaptationChange[];
}

// ─── Trip Request ─────────────────────────────────────────────────────────────

export interface HardInputs {
  origin_city: string;
  destination_city: SupportedCity;
  budget_usd: number;
  days: number;                        // 2–10
  group_size: number;
  transport: Transport;
}

export interface SoftInputs {
  vibe: Vibe;
  energy_level: EnergyLevel;
  spontaneity: 1 | 2 | 3 | 4 | 5;
  social_preference: SocialPreference;
}

export interface TripRequest {
  session_id: string;
  hard_inputs: HardInputs;
  soft_inputs: SoftInputs;
}

// ─── Adaptation Request ───────────────────────────────────────────────────────

export interface AdaptationRequest {
  session_id: string;
  trigger: AdaptationTrigger;
  trigger_detail: string;              // e.g. "Rain 70% probability Day 3 afternoon"
  target_day?: number;                 // only for "manual" trigger — which day to replan
  user_message?: string;               // only for "user_message" trigger
  current_trip: TripSummary;           // full current trip state for context
}

// ─── Trip Summary (sent with adaptation requests) ─────────────────────────────

export interface TripSummary {
  session_id: string;
  destination_city: SupportedCity;
  days: DayPlan[];
  budget: BudgetSummary;
  generated_at: string;                // ISO 8601
}

// ─── SSE Stream Events ────────────────────────────────────────────────────────

export interface StreamEventBase {
  type: StreamEventType;
  session_id: string;
  timestamp: string;                   // ISO 8601
}

export interface DayReadyEvent extends StreamEventBase {
  type: "day_ready";
  payload: DayPlan;
}

export interface BudgetUpdateEvent extends StreamEventBase {
  type: "budget_update";
  payload: BudgetUpdate;
}

export interface ExperienceAddedEvent extends StreamEventBase {
  type: "experience_added";
  payload: {
    day_number: number;
    experience: Experience;
  };
}

export interface AdaptationEvent extends StreamEventBase {
  type: "adaptation";
  payload: AdaptationDiff;
}

export interface CompleteEvent extends StreamEventBase {
  type: "complete";
  payload: TripSummary;
}

export interface ErrorEvent extends StreamEventBase {
  type: "error";
  payload: {
    code: "AGENT_FAILURE" | "STREAM_INTERRUPTED" | "TOOL_FAILURE" | "VALIDATION_ERROR";
    message: string;
    resume_from_day: number | null;    // null = unrecoverable, must restart
    retryable: boolean;
  };
}

export type TripStreamEvent =
  | DayReadyEvent
  | BudgetUpdateEvent
  | ExperienceAddedEvent
  | AdaptationEvent
  | CompleteEvent
  | ErrorEvent;

// ─── City Config ──────────────────────────────────────────────────────────────

export interface CityVibeAffinity {
  romantic: number;    // 0–10 score, used to rank city suggestions
  adventurous: number;
  healing: number;
  chaotic: number;
  social: number;
  slow: number;
  creative: number;
}

export interface CityConfig {
  name: SupportedCity;
  country: string;
  timezone: string;               // IANA timezone string
  currency: string;               // ISO 4217
  currency_symbol: string;
  neighborhood_zones: string[];   // curated list of zones for PlannerAgent
  places_area_bias: string;       // Google Places API area bias string
  vibe_affinity: CityVibeAffinity;
  cost_tier: "budget" | "mid" | "premium";
}

// ─── Session State (Zustand store shape / sessionStorage) ─────────────────────

export interface SessionState {
  session_id: string;
  current_trip: TripSummary | null;
  user_inputs: {
    hard: Partial<HardInputs>;
    soft: Partial<SoftInputs>;
  };
  adaptation_log: AdaptationDiff[];
  stream_status: "idle" | "streaming" | "complete" | "error";
  last_error: ErrorEvent["payload"] | null;
}

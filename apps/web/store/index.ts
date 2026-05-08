'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Vibe = 'romantic' | 'adventurous' | 'healing' | 'chaotic' | 'social' | 'slow' | 'creative';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type StreamStatus = 'idle' | 'streaming' | 'complete' | 'error';
export type ExpType = 'food' | 'culture' | 'outdoor' | 'nightlife' | 'shopping' | 'relaxation' | 'transport';

export interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
  neighborhood: string;
}

export interface Alternative {
  id: string;
  name: string;
  reason: string;
}

export interface Experience {
  id: string;
  name: string;
  type: ExpType;
  location: Location;
  time_start: string;
  duration_minutes: number;
  estimated_cost_usd: number;
  energy_score: number;
  vibe_tags: string[];
  notes: string;
  alternatives: Alternative[];
}

export interface DayPlan {
  day_number: number;
  emotional_theme: string;
  energy_curve: number[];
  location_zone: string;
  transport_between: string;
  anchor_count: number;
  spontaneity_level: number;
  experiences: Experience[];
  estimated_spend: number;
}

export interface DailyBudget {
  day_number: number;
  accommodation_usd: number;
  transport_usd: number;
  food_usd: number;
  experiences_usd: number;
  misc_usd: number;
  day_total_usd: number;
  flag: 'on_track' | 'near_limit' | 'over_budget';
}

export interface BudgetSummary {
  total_budget_usd: number;
  days: number;
  daily_breakdown: DailyBudget[];
  category_totals: Record<string, number>;
  grand_total_usd: number;
  remaining_usd: number;
  overall_flag: 'on_track' | 'near_limit' | 'over_budget';
  local_currency_hint: string;
  warnings: string[];
}

export interface Trip {
  session_id: string;
  destination_city: string;
  days: DayPlan[];
  budget: BudgetSummary;
  generated_at: string;
}

export interface SoftInputs {
  vibe: Vibe | null;
  energy_level: EnergyLevel | null;
  spontaneity: 1 | 2 | 3 | 4 | 5;
  social_preference: 'solo' | 'small_group' | 'crowd';
}

export interface HardInputs {
  origin_city: string;
  destination_city: string;
  budget_usd: number;
  days: number;
  group_size: number;
  transport: 'flight' | 'train' | 'car' | 'any';
}

interface TripStore {
  session_id: string;
  current_trip: Trip | null;
  days: DayPlan[];
  budget: BudgetSummary | null;
  soft_inputs: SoftInputs;
  hard_inputs: Partial<HardInputs>;
  stream_status: StreamStatus;

  setSoftInput: <K extends keyof SoftInputs>(key: K, value: SoftInputs[K]) => void;
  setHardInput: <K extends keyof HardInputs>(key: K, value: HardInputs[K]) => void;
  addDay: (day: DayPlan) => void;
  setBudget: (budget: BudgetSummary) => void;
  setStreamStatus: (status: StreamStatus) => void;
  setTrip: (trip: Trip) => void;
  reset: () => void;
}

const DEFAULT_SOFT: SoftInputs = {
  vibe: null,
  energy_level: null,
  spontaneity: 3,
  social_preference: 'solo',
};

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      session_id: typeof window !== 'undefined'
        ? (sessionStorage.getItem('emotrav_sid') || (() => {
            const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem('emotrav_sid', id);
            return id;
          })())
        : '',
      current_trip: null,
      days: [],
      budget: null,
      soft_inputs: DEFAULT_SOFT,
      hard_inputs: { days: 4, group_size: 1, transport: 'any', budget_usd: 1000 },
      stream_status: 'idle',

      setSoftInput: (key, value) =>
        set((s) => ({ soft_inputs: { ...s.soft_inputs, [key]: value } })),

      setHardInput: (key, value) =>
        set((s) => ({ hard_inputs: { ...s.hard_inputs, [key]: value } })),

      addDay: (day) => set((s) => ({ days: [...s.days, day] })),

      setBudget: (budget) => set({ budget }),

      setStreamStatus: (status) => set({ stream_status: status }),

      setTrip: (trip) => set({ current_trip: trip, days: trip.days, budget: trip.budget }),

      reset: () => set({ days: [], budget: null, current_trip: null, stream_status: 'idle' }),
    }),
    {
      name: 'emotrav_session',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (s) => ({
        session_id: s.session_id,
        current_trip: s.current_trip,
        days: s.days,
        budget: s.budget,
        soft_inputs: s.soft_inputs,
        hard_inputs: s.hard_inputs,
      }),
    }
  )
);

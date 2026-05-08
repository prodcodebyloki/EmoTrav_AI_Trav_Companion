'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Vibe = 'romantic' | 'adventurous' | 'healing' | 'chaotic' | 'social' | 'slow' | 'creative';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type StreamStatus = 'idle' | 'streaming' | 'complete' | 'error';

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
  current_trip: any | null;
  days: any[];
  budget: any | null;
  soft_inputs: SoftInputs;
  hard_inputs: Partial<HardInputs>;
  stream_status: StreamStatus;
  adaptation_log: any[];

  setSoftInput: <K extends keyof SoftInputs>(key: K, value: SoftInputs[K]) => void;
  setHardInput: <K extends keyof HardInputs>(key: K, value: HardInputs[K]) => void;
  addDay: (day: any) => void;
  setBudget: (budget: any) => void;
  setStreamStatus: (status: StreamStatus) => void;
  setTrip: (trip: any) => void;
  addAdaptation: (diff: any) => void;
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
      adaptation_log: [],

      setSoftInput: (key, value) =>
        set((s) => ({ soft_inputs: { ...s.soft_inputs, [key]: value } })),

      setHardInput: (key, value) =>
        set((s) => ({ hard_inputs: { ...s.hard_inputs, [key]: value } })),

      addDay: (day) => set((s) => ({ days: [...s.days, day] })),

      setBudget: (budget) => set({ budget }),

      setStreamStatus: (status) => set({ stream_status: status }),

      setTrip: (trip) => set({ current_trip: trip, days: trip.days, budget: trip.budget }),

      addAdaptation: (diff) =>
        set((s) => ({ adaptation_log: [...s.adaptation_log, diff] })),

      reset: () => set({ days: [], budget: null, current_trip: null, stream_status: 'idle', adaptation_log: [] }),
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

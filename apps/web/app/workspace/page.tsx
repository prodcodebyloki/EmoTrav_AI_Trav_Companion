'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/store';
import { streamTrip } from '@/lib/api';
import DayCard from '@/components/workspace/DayCard';
import BudgetPanel from '@/components/workspace/BudgetPanel';
import styles from './workspace.module.css';

export default function WorkspacePage() {
  const router = useRouter();
  const { session_id, soft_inputs, hard_inputs, days, budget, stream_status, addDay, setBudget, setStreamStatus, setTrip } = useTripStore();
  const started = useRef(false);
  const totalDays = hard_inputs.days ?? 4;
  const nextDayNum = days.length + 1;

  useEffect(() => {
    if (started.current) return;
    if (!soft_inputs.vibe || !hard_inputs.destination_city) {
      router.push('/');
      return;
    }
    started.current = true;
    runStream();
  }, []);

  async function runStream() {
    setStreamStatus('streaming');
    try {
      // Read fresh state at call time — avoids stale closure from before sessionStorage hydration
      const s = useTripStore.getState();
      const h = s.hard_inputs;
      const soft = s.soft_inputs;
      const payload = {
        session_id: s.session_id,
        hard_inputs: {
          origin_city: 'Home',
          destination_city: h.destination_city,
          budget_usd: h.budget_usd ?? 1000,
          days: h.days ?? 4,
          group_size: h.group_size ?? 1,
          transport: h.transport ?? 'any',
        },
        soft_inputs: {
          vibe: soft.vibe,
          energy_level: soft.energy_level ?? 'medium',
          spontaneity: soft.spontaneity ?? 3,
          social_preference: soft.social_preference ?? 'solo',
        },
      };

      for await (const event of streamTrip(payload)) {
        if (event.type === 'day_ready') addDay(event.payload);
        if (event.type === 'budget_update') setBudget(event.payload.budget);
        if (event.type === 'complete') { setTrip(event.payload); setStreamStatus('complete'); }
        if (event.type === 'error') { setStreamStatus('error'); break; }
      }
    } catch (e) {
      setStreamStatus('error');
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <button className={styles.back} onClick={() => router.push('/')}>← Back</button>
        <div className={styles.tripMeta}>
          <span className={styles.destination}>{hard_inputs.destination_city}</span>
          <span className={styles.meta}>{hard_inputs.days} days · {soft_inputs.vibe} · ${hard_inputs.budget_usd}</span>
        </div>
        <div className={styles.status}>
          {stream_status === 'streaming' && <span className={styles.streaming}>✦ Generating...</span>}
          {stream_status === 'complete' && <span className={styles.complete}>✓ Ready</span>}
          {stream_status === 'error' && <span className={styles.error}>⚠ Error</span>}
        </div>
      </header>

      <div className={styles.body}>
        <main className={styles.timeline}>
          {days.map((day) => (
            <DayCard key={day.day_number} day={day} />
          ))}
          {stream_status === 'streaming' && days.length < totalDays && (
            <div className={styles.generatingCard}>
              <div className={styles.generatingSpinner} />
              <span className={styles.generatingText}>
                Day {nextDayNum}/{totalDays} is generating…
              </span>
            </div>
          )}
          {stream_status === 'error' && (
            <div className={styles.errorState}>
              <p>Generation failed. <button onClick={runStream}>Retry</button></p>
            </div>
          )}
        </main>

        {budget && (
          <aside className={styles.sidebar}>
            <BudgetPanel budget={budget} />
          </aside>
        )}
      </div>
    </div>
  );
}

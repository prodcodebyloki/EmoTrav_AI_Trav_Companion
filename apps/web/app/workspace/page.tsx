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
      const payload = {
        session_id,
        hard_inputs: {
          origin_city: 'Home',
          destination_city: hard_inputs.destination_city,
          budget_usd: hard_inputs.budget_usd ?? 1000,
          days: hard_inputs.days ?? 4,
          group_size: hard_inputs.group_size ?? 1,
          transport: hard_inputs.transport ?? 'any',
        },
        soft_inputs: {
          vibe: soft_inputs.vibe,
          energy_level: soft_inputs.energy_level ?? 'medium',
          spontaneity: soft_inputs.spontaneity ?? 3,
          social_preference: soft_inputs.social_preference ?? 'solo',
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
          {days.length === 0 && stream_status === 'streaming' && (
            <div className={styles.loading}>
              <div className={styles.loadingDot} />
              <p>Building your {soft_inputs.vibe} trip to {hard_inputs.destination_city}…</p>
            </div>
          )}
          {days.map((day) => (
            <DayCard key={day.day_number} day={day} />
          ))}
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

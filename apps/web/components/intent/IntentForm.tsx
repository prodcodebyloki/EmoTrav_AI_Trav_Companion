'use client';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/store';
import VibeSelector from './VibeSelector';
import styles from './IntentForm.module.css';

const CITIES = ['Tokyo', 'Mumbai', 'Lisbon', 'Mexico City', 'Medellín', 'Cape Town', 'Melbourne', 'Dubai'];
const ENERGY_LEVELS = [
  { value: 'low', label: 'Gentle', desc: 'Easy pace, rest often' },
  { value: 'medium', label: 'Steady', desc: 'Active but balanced' },
  { value: 'high', label: 'Full On', desc: 'Maximum experiences' },
];

export default function IntentForm() {
  const router = useRouter();
  const { soft_inputs, hard_inputs, setSoftInput, setHardInput, reset } = useTripStore();

  const canProceed1 = soft_inputs.vibe && soft_inputs.energy_level;
  const canProceed2 = hard_inputs.destination_city && hard_inputs.days;
  const canSubmit = canProceed1 && canProceed2 && hard_inputs.budget_usd;

  function handleGenerate() {
    reset();
    router.push('/workspace');
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} />
          <span className={styles.logoText}><em>Emo</em>Trav</span>
        </div>
        <p className={styles.tagline}>Travel how you feel.</p>
      </header>

      <main className={styles.main}>
        {/* Step 1 — Vibe + Energy */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How do you want to feel?</h2>
          <VibeSelector
            selected={soft_inputs.vibe}
            onSelect={(v) => setSoftInput('vibe', v)}
          />

          <div className={styles.energyRow}>
            {ENERGY_LEVELS.map((e) => (
              <button
                key={e.value}
                className={`${styles.energyBtn} ${soft_inputs.energy_level === e.value ? styles.energyBtnActive : ''}`}
                onClick={() => setSoftInput('energy_level', e.value as any)}
              >
                <span className={styles.energyLabel}>{e.label}</span>
                <span className={styles.energyDesc}>{e.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2 — Destination + Duration */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Where and how long?</h2>
          <div className={styles.cityGrid}>
            {CITIES.map((city) => (
              <button
                key={city}
                className={`${styles.cityBtn} ${hard_inputs.destination_city === city ? styles.cityBtnActive : ''}`}
                onClick={() => setHardInput('destination_city', city as any)}
              >
                {city}
              </button>
            ))}
          </div>

          <div className={styles.row}>
            <label className={styles.label}>
              Days
              <input
                type="number"
                min={2}
                max={10}
                value={hard_inputs.days ?? 4}
                onChange={(e) => setHardInput('days', Number(e.target.value))}
                className={styles.input}
              />
            </label>
            <label className={styles.label}>
              Group size
              <input
                type="number"
                min={1}
                max={20}
                value={hard_inputs.group_size ?? 1}
                onChange={(e) => setHardInput('group_size', Number(e.target.value))}
                className={styles.input}
              />
            </label>
          </div>
        </section>

        {/* Step 3 — Budget + Spontaneity */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Budget & style</h2>
          <label className={styles.label}>
            Total budget (USD)
            <input
              type="number"
              min={100}
              step={50}
              value={hard_inputs.budget_usd ?? 1000}
              onChange={(e) => setHardInput('budget_usd', Number(e.target.value))}
              className={styles.input}
              placeholder="e.g. 1200"
            />
          </label>

          <div className={styles.spontaneityBlock}>
            <span className={styles.label}>
              Spontaneity — {['', 'Full planner', 'Guided', 'Balanced', 'Spontaneous', 'Surprise me'][soft_inputs.spontaneity]}
            </span>
            <input
              type="range"
              min={1}
              max={5}
              value={soft_inputs.spontaneity}
              onChange={(e) => setSoftInput('spontaneity', Number(e.target.value) as any)}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>Planner</span><span>Surprise me</span>
            </div>
          </div>
        </section>

        <button
          className={styles.generateBtn}
          disabled={!canSubmit}
          onClick={handleGenerate}
        >
          Build my trip →
        </button>
      </main>
    </div>
  );
}

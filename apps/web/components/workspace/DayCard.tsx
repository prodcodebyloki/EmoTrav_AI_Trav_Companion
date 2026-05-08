'use client';
import { DayPlan } from '@/store';
import styles from './DayCard.module.css';

const THEME_LABELS: Record<string, string> = {
  decompress: 'Settle In',
  exploration: 'Discover',
  peak: 'Full Send',
  immersion: 'Go Deep',
  'wind-down': 'Savor',
  spontaneous: 'See Where It Goes',
};

interface Props {
  day: DayPlan;
}

export default function DayCard({ day }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.dayNum}>Day {day.day_number}</span>
          <span className={styles.zone}>{day.location_zone}</span>
        </div>
        <span className={styles.theme}>{THEME_LABELS[day.emotional_theme] ?? day.emotional_theme}</span>
      </div>

      {day.energy_curve && (
        <div className={styles.curve}>
          {day.energy_curve.map((v, i) => (
            <div
              key={i}
              className={styles.bar}
              style={{ height: `${Math.max(4, v * 0.4)}px` }}
              title={`${6 + i}:00 — energy ${v}`}
            />
          ))}
        </div>
      )}

      {day.experiences?.length > 0 && (
        <ul className={styles.experiences}>
          {day.experiences.map((exp) => (
            <li key={exp.id} className={styles.exp}>
              <span className={styles.expTime}>{exp.time_start}</span>
              <div className={styles.expBody}>
                <div className={styles.expNameRow}>
                  <span className={styles.expName}>{exp.name}</span>
                  <a
                    href={
                      exp.location?.lat && exp.location?.lng
                        ? `https://www.google.com/maps/search/?api=1&query=${exp.location.lat},${exp.location.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.name)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLink}
                    title="Open in Google Maps"
                  >
                    ↗ Maps
                  </a>
                </div>
                <span className={styles.expMeta}>
                  {exp.duration_minutes}min · ${exp.estimated_cost_usd}
                </span>
                {exp.notes && <span className={styles.expNotes}>{exp.notes}</span>}
              </div>
              <span className={`${styles.expType} ${styles[`type_${exp.type}`]}`}>{exp.type}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.footer}>
        <span>Est. spend: <strong>${day.estimated_spend?.toFixed(0) ?? '—'}</strong></span>
        {day.transport_between && day.transport_between !== 'base' && (
          <span className={styles.transport}>✈ {day.transport_between}</span>
        )}
      </div>
    </div>
  );
}

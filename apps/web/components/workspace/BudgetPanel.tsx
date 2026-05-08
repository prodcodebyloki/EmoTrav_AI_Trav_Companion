'use client';
import styles from './BudgetPanel.module.css';

interface Props {
  budget: any;
}

const FLAG_COLOR: Record<string, string> = {
  on_track:   '#4CAF82',
  near_limit: '#F0A500',
  over_budget:'#D94F4F',
};

export default function BudgetPanel({ budget }: Props) {
  const cats = [
    { key: 'accommodation_usd', label: 'Stay' },
    { key: 'transport_usd',     label: 'Transport' },
    { key: 'food_usd',          label: 'Food' },
    { key: 'experiences_usd',   label: 'Experiences' },
    { key: 'misc_usd',          label: 'Misc' },
  ];

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Budget</h3>

      <div className={styles.totals}>
        <span className={styles.spent}>${budget.grand_total_usd?.toFixed(0)}</span>
        <span className={styles.of}>of ${budget.total_budget_usd}</span>
        <span
          className={styles.flag}
          style={{ color: FLAG_COLOR[budget.overall_flag] }}
        >
          {budget.overall_flag?.replace('_', ' ')}
        </span>
      </div>

      <div className={styles.bar}>
        <div
          className={styles.barFill}
          style={{
            width: `${Math.min(100, (budget.grand_total_usd / budget.total_budget_usd) * 100)}%`,
            background: FLAG_COLOR[budget.overall_flag],
          }}
        />
      </div>

      <ul className={styles.cats}>
        {cats.map(({ key, label }) => {
          const val = budget.category_totals?.[key] ?? 0;
          const pct = Math.min(100, (val / budget.total_budget_usd) * 100);
          return (
            <li key={key} className={styles.cat}>
              <span className={styles.catLabel}>{label}</span>
              <div className={styles.catBar}>
                <div className={styles.catBarFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.catVal}>${val.toFixed(0)}</span>
            </li>
          );
        })}
      </ul>

      {budget.local_currency_hint && (
        <p className={styles.hint}>{budget.local_currency_hint}</p>
      )}

      {budget.warnings?.length > 0 && (
        <div className={styles.warnings}>
          {budget.warnings.map((w: string, i: number) => (
            <p key={i} className={styles.warning}>⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  );
}

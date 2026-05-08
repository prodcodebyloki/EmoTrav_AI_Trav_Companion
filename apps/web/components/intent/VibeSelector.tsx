'use client';
import { Vibe } from '@/store';
import styles from './VibeSelector.module.css';

const VIBES: { value: Vibe; label: string; desc: string; icon: string }[] = [
  { value: 'romantic',    label: 'Romantic',    desc: 'Intimate, beautiful, slow', icon: '🌹' },
  { value: 'adventurous', label: 'Adventurous', desc: 'Active, bold, unexpected',  icon: '⚡' },
  { value: 'healing',     label: 'Healing',     desc: 'Calm, restorative, quiet',  icon: '🌿' },
  { value: 'chaotic',     label: 'Chaotic',     desc: 'Wild, alive, sensory',      icon: '🌀' },
  { value: 'social',      label: 'Social',      desc: 'People, energy, shared',    icon: '🎉' },
  { value: 'slow',        label: 'Slow',        desc: 'One place, deep, unhurried',icon: '☕' },
  { value: 'creative',    label: 'Creative',    desc: 'Art, culture, discovery',   icon: '🎨' },
];

interface Props {
  selected: Vibe | null;
  onSelect: (v: Vibe) => void;
}

export default function VibeSelector({ selected, onSelect }: Props) {
  return (
    <div className={styles.grid}>
      {VIBES.map((v) => (
        <button
          key={v.value}
          className={`${styles.card} ${selected === v.value ? styles.cardSelected : ''}`}
          data-vibe={v.value}
          onClick={() => onSelect(v.value)}
        >
          <span className={styles.icon}>{v.icon}</span>
          <span className={styles.label}>{v.label}</span>
          <span className={styles.desc}>{v.desc}</span>
        </button>
      ))}
    </div>
  );
}

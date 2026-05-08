# EmoTrav — Design System

> **Adaptive Travel Experience Engine**
> Design foundation for app UI, landing page, mobile, and component system.

---

## 1. Brand Direction

### Name & Concept
- **EmoTrav** = Emotion + Travel
- Core promise: trips shaped by how you *feel*, not just where you go
- Positioning: between Airbnb's warmth and Notion's calm clarity
- Voice: confident, human, never salesy — a knowledgeable friend who travels well

### Brand Personality
| Trait | Expression |
|---|---|
| Warm | Earthy tones, rounded shapes, soft shadows |
| Intelligent | Clean layouts, precise typography, purposeful whitespace |
| Alive | Subtle motion, breathing animations, energy-responsive UI |
| Honest | No dark patterns, no fake urgency, no clutter |

### Tagline Options
- *"Travel how you feel."*
- *"Your mood. Your map."*
- *"The trip you actually needed."*

---

## 2. Color System

### Primary Palette

```css
:root {
  /* Core Brand */
  --color-dusk:        #E8805A;   /* warm coral-orange — primary CTA, energy high */
  --color-sage:        #6B8F71;   /* muted green — calm, nature, healing vibe */
  --color-indigo-deep: #2D3561;   /* night blue — premium, focus, slow travel */

  /* Neutrals */
  --color-sand:        #F5F0E8;   /* warm off-white — page background */
  --color-stone:       #C9C0B0;   /* mid neutral — borders, dividers */
  --color-earth:       #4A3F35;   /* dark warm brown — body text */
  --color-charcoal:    #1A1A1A;   /* near-black — headings */

  /* Functional */
  --color-success:     #4CAF82;
  --color-warning:     #F0A500;
  --color-error:       #D94F4F;
  --color-info:        #4A90D9;
}
```

### Vibe-to-Color Mapping

Each travel vibe maps to a dominant color accent used in cards, highlights, and energy curves:

| Vibe | Color Token | Hex |
|---|---|---|
| Romantic | `--vibe-romantic` | `#E8805A` (dusk) |
| Adventurous | `--vibe-adventure` | `#D4622A` (ember) |
| Healing | `--vibe-healing` | `#6B8F71` (sage) |
| Chaotic | `--vibe-chaotic` | `#8B5CF6` (violet) |
| Social | `--vibe-social` | `#F59E0B` (amber) |
| Slow | `--vibe-slow` | `#2D3561` (indigo deep) |
| Creative | `--vibe-creative` | `#EC4899` (rose) |

### Dark Mode

```css
[data-theme="dark"] {
  --color-sand:    #1C1917;
  --color-earth:   #E7E0D8;
  --color-stone:   #44403C;
  --color-charcoal:#FAFAF9;
}
```

---

## 3. Typography

### Type Scale

```css
:root {
  --font-display:  'Fraunces', Georgia, serif;       /* emotional headlines */
  --font-body:     'Inter', system-ui, sans-serif;   /* UI, body text */
  --font-mono:     'JetBrains Mono', monospace;      /* data, coordinates */

  /* Scale (fluid, clamp-based) */
  --text-hero:   clamp(2.5rem, 6vw, 4.5rem);   /* landing hero */
  --text-h1:     clamp(2rem,   4vw, 3rem);
  --text-h2:     clamp(1.5rem, 3vw, 2rem);
  --text-h3:     clamp(1.2rem, 2vw, 1.5rem);
  --text-body:   1rem;
  --text-small:  0.875rem;
  --text-micro:  0.75rem;

  /* Weight */
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold:600;
  --weight-bold:    700;

  /* Line height */
  --leading-tight:  1.2;
  --leading-body:   1.6;
  --leading-relaxed:1.8;
}
```

### Usage Rules
- **Fraunces** for emotional beats: vibe names, day themes, hero copy
- **Inter** for everything functional: forms, labels, nav, metadata
- Max line length: 65ch for body text
- Minimum body size: 16px (1rem) — never go below on mobile

---

## 4. Spacing & Layout

### Spacing Scale

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  24px;
  --space-6:  32px;
  --space-7:  48px;
  --space-8:  64px;
  --space-9:  96px;
  --space-10: 128px;
}
```

### Grid System

```css
/* Page container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Workspace layout (Airbnb-inspired split) */
.workspace-grid {
  display: grid;
  grid-template-columns: 380px 1fr;   /* sidebar | main canvas */
  grid-template-rows: 64px 1fr;       /* topbar | content */
  height: 100vh;
  gap: 0;
}

/* Card grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-5);
}
```

### Airbnb-Inspired Layout Principles
- **Left panel**: intent/chat — persistent, scrollable, always visible
- **Right canvas**: dynamic content — map, timeline, budget — contextual
- **No modal overload**: surface info inline or in right panel, not popups
- **Generous whitespace**: minimum 32px between major sections
- **Card-first**: all trip content lives in well-padded cards with clear hierarchy

---

## 5. CSS Logo Concept

```css
/* EmoTrav logotype — pure CSS, no image dependency */
.emotrav-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.emotrav-logo__icon {
  width: 32px;
  height: 32px;
  background: conic-gradient(
    from 180deg,
    var(--color-dusk) 0%,
    var(--color-sage) 50%,
    var(--color-indigo-deep) 100%
  );
  border-radius: 50% 50% 50% 10%;   /* teardrop / pin shape */
  position: relative;
}

.emotrav-logo__icon::after {
  content: '';
  position: absolute;
  inset: 4px;
  background: var(--color-sand);
  border-radius: inherit;
  clip-path: circle(40%);           /* inner "pulse" dot */
}

.emotrav-logo__text {
  font-size: 1.5rem;
  color: var(--color-charcoal);
}

.emotrav-logo__text em {
  font-style: normal;
  color: var(--color-dusk);         /* "Emo" highlighted, "Trav" neutral */
}
```

**Renders as:** conic-gradient teardrop pin + wordmark with warm-coral "Emo" prefix.

---

## 6. Component Design Tokens

### Border Radius

```css
:root {
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;
  --radius-xl:   32px;
  --radius-full: 9999px;
}
```

### Shadow Scale

```css
:root {
  --shadow-sm:  0 1px 3px rgba(74, 63, 53, 0.08);
  --shadow-md:  0 4px 16px rgba(74, 63, 53, 0.12);
  --shadow-lg:  0 12px 40px rgba(74, 63, 53, 0.16);
  --shadow-glow-dusk: 0 0 24px rgba(232, 128, 90, 0.35);  /* CTA hover glow */
}
```

### Motion Tokens

```css
:root {
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);   /* springy, alive */
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);         /* material ease */
  --ease-out:     cubic-bezier(0, 0, 0.2, 1);

  --duration-fast:   150ms;
  --duration-normal: 300ms;
  --duration-slow:   500ms;
  --duration-reveal: 800ms;   /* page-level transitions */
}
```

---

## 7. Core Components

### Vibe Selector Card

```
┌─────────────────────────┐
│   🌿                    │
│   Healing               │  ← Fraunces, 1.2rem
│   Slow, restorative     │  ← Inter, 0.875rem, muted
│                         │
│   ░░░░░░░░░░░░░░░░░░░░  │  ← sage bottom accent bar
└─────────────────────────┘
Selected state: sage border, soft glow, checkmark top-right
```

### Day Card

```
┌─────────────────────────────────────────────────────┐
│  Day 2 · Florence          🌤  22°C    €180 budget  │
│  ─────────────────────────────────────────────────  │
│  Theme: "Slow Immersion"                            │  ← Fraunces italic
│                                                     │
│  [Energy Curve sparkline ────────╮──────]           │
│                                                     │
│  09:00  Uffizi Gallery           45 min  €20        │
│  11:30  Espresso at Rivoire      20 min  €4         │
│  13:00  Lunch — Trattoria Mario  90 min  €22        │
│  ...                                                │
└─────────────────────────────────────────────────────┘
```

### Energy Curve

- Recharts AreaChart, custom fill using vibe color with 30% opacity
- X-axis: hours (06:00–23:00)
- Y-axis: energy score 0–100
- Tooltip shows: activity name + energy peak reason
- Animated on mount: path draws left-to-right over 800ms

### Budget Flow Bar

```
Transport  ████████░░░░░░  $240 / $400
Stay       ████████████░░  $310 / $350
Food       ██████░░░░░░░░  $160 / $280
Experiences████████████░░  $95  / $110
                           ─────────────
                    Total  $805 / $1140
```

Color: green when under 80%, amber 80–95%, red above 95%.

---

## 8. UX Philosophy

### Five Principles

**1. Emotion First, Logistics Second**
Ask how you feel before where you want to go. Hard inputs (budget, dates) come after soft inputs (vibe, energy).

**2. Progressive Disclosure**
Show the 30,000-ft view first — day themes, energy arc, total budget. Details unlock on demand, never dumped upfront.

**3. The Living Itinerary**
Trip is never "done." It breathes. Weather changes → itinerary adapts. Fatigue signal → plan softens. Spontaneous moment → AI offers alternatives. Always in draft mode.

**4. Zero Friction Navigation**
No modals for core flows. No redirects mid-task. Workspace is a single-page canvas — chat, map, timeline coexist without navigation breaks.

**5. Honest Feedback Loops**
Budget overages surfaced inline, not at checkout. Energy curve mismatch flagged proactively. No hidden costs, no bait-and-switch experience promises.

---

## 9. Interaction Patterns

### Vibe Selection
- Horizontal scroll row on mobile, 3-column grid on desktop
- Single select — tapping new vibe deselects old with smooth crossfade
- Selected card: scale(1.03) + vibe-color border + bottom accent

### Intent Form Progression
```
Step 1: Vibe + Energy Level     (emotional layer)
Step 2: Where from + How long   (logistics)
Step 3: Budget + Group size     (constraints)
Step 4: Spontaneity slider      (AI personality dial)
         └── 1 = structured planner
             5 = surprise me
```
Each step fades in only after prior step confirmed. No back-and-forth forced — user can jump steps.

### Streaming Itinerary Reveal
- Skeleton cards appear immediately on generation start
- Day cards populate sequentially (Day 1 → Day 2 → …) as SSE events arrive
- Each card entry: slide-up + fade-in, 300ms stagger between experiences
- Energy curve animates after day card fully populated

### Adaptation Alert
```
┌──────────────────────────────────────────────────┐
│  ⚡ Plan update detected                         │
│  Rain forecast Day 3 afternoon                   │
│  → Uffizi moved to morning, Pitti Palace added   │
│  [Accept]  [Review changes]  [Dismiss]           │
└──────────────────────────────────────────────────┘
```
- Slides in from top of workspace, auto-dismisses after 8s if no action
- "Review changes" opens diff view inline — old vs new side-by-side

### Chat Sidebar Behavior
- Free-text input always visible at bottom
- Suggested prompt chips above input: "Make day 2 slower", "Swap lunch option", "Add a hidden gem"
- AI responses stream word-by-word into chat bubbles
- Trip mutations from chat reflected immediately in timeline (optimistic update)

---

## 10. Adaptive Travel UI Language

### Emotional Day Themes (display labels)

| Internal Key | Display Label | Usage |
|---|---|---|
| `decompress` | *"Settle In"* | Arrival day, light schedule |
| `exploration` | *"Discover"* | High variety, medium energy |
| `peak` | *"Full Send"* | Maximum experiences, high energy |
| `immersion` | *"Go Deep"* | One neighborhood, slow pace |
| `wind-down` | *"Savor"* | Last day, reflective, low effort |
| `spontaneous` | *"See Where It Goes"* | Loose schedule, high spontaneity |

### Energy Language

| Score Range | Label | Color |
|---|---|---|
| 0–30 | Gentle | sage |
| 31–55 | Steady | amber-muted |
| 56–75 | Active | dusk |
| 76–100 | Intense | ember |

### Micro-copy Principles
- Use second person: "Your pace", "How you're feeling", not "User preference"
- Avoid travel industry clichés: no "seamless", "curated", "bespoke", "unforgettable"
- Short labels win: "Slow day" not "Low-intensity travel day"
- Acknowledge adaptation warmly: "Plans shift — that's fine." not "Itinerary modified."

---

## 11. Responsive Breakpoints

```css
:root {
  --bp-sm:  480px;   /* large mobile */
  --bp-md:  768px;   /* tablet */
  --bp-lg:  1024px;  /* small desktop */
  --bp-xl:  1280px;  /* workspace desktop */
  --bp-2xl: 1536px;  /* wide */
}
```

### Layout Shifts
| Breakpoint | Workspace Layout |
|---|---|
| < 768px | Single column, tab bar (Chat / Timeline / Map / Budget) |
| 768–1024px | Chat sidebar collapses to icon rail, timeline expands |
| > 1024px | Full two-column split (380px sidebar + canvas) |
| > 1280px | Optional third panel for map or budget flow |

---

## 12. Accessibility

- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- Focus ring: 2px solid `var(--color-dusk)` with 2px offset — always visible
- Motion: all animations respect `prefers-reduced-motion`
- Touch targets: minimum 44×44px on mobile
- Vibe cards: not color-only — always include text label + icon
- Energy curves: include aria-label with plain-text summary of curve shape

---

## 13. Design Token Export (CSS → JS)

```typescript
// tokens.ts — generated from tokens.css for use in Framer Motion + Recharts
export const tokens = {
  color: {
    dusk:       '#E8805A',
    sage:       '#6B8F71',
    indigodeep: '#2D3561',
    sand:       '#F5F0E8',
    earth:      '#4A3F35',
  },
  vibe: {
    romantic:   '#E8805A',
    adventure:  '#D4622A',
    healing:    '#6B8F71',
    chaotic:    '#8B5CF6',
    social:     '#F59E0B',
    slow:       '#2D3561',
    creative:   '#EC4899',
  },
  duration: {
    fast:   150,
    normal: 300,
    slow:   500,
    reveal: 800,
  },
  ease: {
    spring: [0.34, 1.56, 0.64, 1],
    smooth: [0.4, 0, 0.2, 1],
  },
} as const;
```

---

## File Map (Design Assets → Codebase)

```
apps/web/src/styles/
├── tokens.css          ← all CSS custom properties (colors, spacing, type, motion)
├── typography.css      ← font imports, type scale classes
├── animations.css      ← keyframes, transition utilities
└── globals.css         ← resets, base html/body

apps/web/src/lib/
└── tokens.ts           ← JS mirror of tokens.css for Recharts + Framer Motion

apps/web/src/components/
├── ui/
│   ├── Button.tsx      ← primary/secondary/ghost variants, dusk CTA style
│   ├── Badge.tsx       ← vibe color badges
│   └── Skeleton.tsx    ← loading placeholder, sand bg + shimmer
├── intent/
│   ├── VibeSelector.tsx
│   ├── MoodCard.tsx
│   └── InputForm.tsx
└── workspace/
    ├── DayCard.tsx
    ├── EnergyCurve.tsx
    ├── BudgetFlow.tsx
    ├── AdaptationAlert.tsx
    └── JourneyTimeline.tsx
```

---

## Decision Log

| Decision | Rationale |
|---|---|
| Fraunces for display type | Optical serif with warmth; conveys emotion without feeling dated |
| Earthy palette over pastels | Grounded, trustworthy; avoids "meditation app" softness |
| Vibe-to-color system | Color becomes semantic — users learn the mapping across sessions |
| CSS variables over Tailwind | Full token control; no utility class churn; aligns with vanilla CSS stack |
| Conic gradient logo | Zero image assets; color still communicates the emotion-spectrum concept |
| No modal pattern | Airbnb workspace principle — context never breaks; everything inline |
| Streaming skeleton pattern | Perceived performance > actual performance; movement signals intelligence |

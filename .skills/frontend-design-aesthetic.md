---
name: frontend-design-aesthetic
description: Visual design direction for the Tauri v2 React dashboard. Sourced from Anthropic's official frontend-design skill. Use when designing new UI components, updating the dashboard layout, choosing colors, typography, or animation patterns. Enforces distinctive dark-mode premium aesthetics over generic defaults.
---

# Frontend Design — Aesthetic Direction

> Sourced from: Anthropic/skills frontend-design (https://github.com/anthropics/skills)

## Design Philosophy

Build interfaces with intentional aesthetic direction. Reject the defaults: no generic Material UI, no purple-gradient-on-white, no templated Inter-on-light-gray. Every choice — palette, typography, motion — should reflect the **local, private, intelligent file organizer** this product is.

---

## Visual Identity for This Project

### Color System

Primary palette (dark, premium, AI-native):

```css
/* Design tokens */
--bg-primary:    #020817;   /* near-black base */
--bg-surface:    #0f172a;   /* slate-950 */
--bg-card:       rgba(15, 23, 42, 0.6); /* translucent cards */
--border-subtle: rgba(51, 65, 85, 0.4); /* slate-700/40 */
--accent-blue:   #3b82f6;   /* indigo-500 */
--accent-emerald:#10b981;   /* emerald-500 (high confidence) */
--accent-amber:  #f59e0b;   /* amber-500 (medium confidence) */
--accent-red:    #ef4444;   /* red-500 (review needed) */
--text-primary:  #f1f5f9;   /* slate-100 */
--text-muted:    #64748b;   /* slate-500 */
```

### Typography

Use **Geist Mono** for file paths, categories, and technical values. Use **Inter** for readable body text and UI labels.

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Glassmorphism Cards

```css
.card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.4);
  border-radius: 16px;
}
```

---

## Component Aesthetics

### Activity Feed Items
- Left border accent based on confidence (emerald / amber / red)
- File icon based on MIME type
- Fade-in animation on new item arrival (`animate-fade-in`)
- Category path in `font-mono text-xs`
- Confidence score as a small badge with color coding

### Header
- Sticky, dark, `backdrop-blur-md`
- Ollama connection status indicator with animated pulse dot
- Watcher toggle as a pill switch, not a checkbox

### Status Indicators

```tsx
// Pulsing dot for active watcher
<span className={clsx(
  'inline-block w-2 h-2 rounded-full',
  isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
)} />
```

---

## Animation Principles (from Anthropic frontend-design)

> "Leverage motion deliberately. Choose what the direction calls for. Sometimes less is more."

For this project:
- **New transaction cards**: slide-in from top (`translateY(-8px) → 0` over 200ms)
- **Undo button**: hover scale (`scale-[1.02]`) with color transition
- **Confidence badge**: no animation (data should be readable at a glance)
- **Watcher toggle**: smooth slide transition (150ms ease)
- **Batch processing button**: loading spinner while processing

```css
@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-in { animation: slideInDown 200ms ease forwards; }
```

---

## Layout Grid

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | Status dots | Run Batch button       │
├────────────────────────────────┬────────────────────┤
│ Activity Feed (2/3 width)      │ System Status panel│
│ - Live transaction cards       │ - Taxonomy tree    │
│ - Undo buttons                 │ - Privacy info     │
│                                │ - Ollama model info│
└────────────────────────────────┴────────────────────┘
```

---

## Rules from Anthropic frontend-design

1. **The hero is a thesis.** Open with the most characteristic element — the live watcher status indicator should dominate the header, not be buried.
2. **Typography carries personality.** Mono fonts for paths. Sans-serif for actions. Clear size hierarchy.
3. **Structure is information.** Use left-border color on cards to encode confidence level, not decoration.
4. **Match complexity to vision.** This is a premium dark-mode desktop app — execute it with precision in spacing, border-radius, and color.
5. **Avoid AI-template defaults.** No `purple gradient hero`, no generic blue action buttons, no light-gray backgrounds.

## References
- [Anthropic/frontend-design SKILL.md](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Glassmorphism in CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)

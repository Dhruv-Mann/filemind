---
name: react-typescript-ui
description: React 18 + TypeScript coding patterns for the Tauri v2 frontend dashboard. Sourced and adapted from PatrickJS/awesome-cursorrules React/TypeScript rules. Use when creating or modifying any .tsx or .ts file in the src/ directory, building UI components, handling state, or implementing Tauri event listeners.
---

# React + TypeScript UI Patterns

> Adapted from: PatrickJS/awesome-cursorrules (React/TypeScript/Tailwind ruleset)

## Core Principles

- **TypeScript strict mode** everywhere. No `any` types.
- **Functional components only** — no class components.
- **Declarative JSX** — derive UI from state, never mutate DOM directly.
- All components go in `src/components/`. Named with PascalCase.
- Utility functions and hooks go in `src/lib/` and `src/hooks/`.

---

## Component Structure Template

```tsx
// src/components/TransactionCard.tsx
import { useState } from 'react';
import type { FileTransaction } from '../types';
import { undoTransaction } from '../lib/tauri';
import { clsx } from 'clsx';

interface TransactionCardProps {
  transaction: FileTransaction;
  onUndo: (id: string) => void;
}

export function TransactionCard({ transaction, onUndo }: TransactionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleUndo = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      await undoTransaction(transaction.id);
      onUndo(transaction.id);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={clsx(
      'rounded-xl border bg-slate-900/40 p-4 transition-all',
      hasError ? 'border-red-500/40' : 'border-slate-800'
    )}>
      {/* ... */}
    </div>
  );
}
```

---

## TypeScript Interface Definitions

Define all shared types in `src/types/index.ts`:

```typescript
// src/types/index.ts

export interface FileTransaction {
  id: string;
  original_path: string;
  new_path: string;
  timestamp: string;
  summary: string;
  category_path: string;
  confidence: number;
  undo_status: boolean;
}

export interface AppStatus {
  watcher_active: boolean;
  ollama_connected: boolean;
  processed_count: number;
}

export interface ClassificationResult {
  category_path: string;
  confidence_score: number;
  summary: string;
  suggested_filename: string;
}
```

---

## State Management Patterns

Use React `useState` + `useEffect` for simple state. Use `useReducer` for complex state flows (e.g. transaction list with undo).

```typescript
// src/hooks/useTransactions.ts
import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getTransactions } from '../lib/tauri';
import type { FileTransaction } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<FileTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    getTransactions().then(setTransactions).finally(() => setIsLoading(false));

    // Listen for real-time events from Rust backend
    const unlisten = listen<FileTransaction>('file-processed', (event) => {
      setTransactions(prev => [event.payload, ...prev]);
    });

    return () => { unlisten.then(f => f()); };
  }, []);

  const removeTransaction = (id: string) =>
    setTransactions(prev => prev.filter(t => t.id !== id));

  return { transactions, isLoading, removeTransaction };
}
```

---

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `TransactionCard.tsx` |
| Hooks | camelCase with `use` prefix | `useTransactions.ts` |
| Types/Interfaces | PascalCase | `FileTransaction` |
| Variables | camelCase | `isLoading`, `hasError` |
| Constants | UPPER_SNAKE | `MAX_SUMMARY_LENGTH` |
| Tauri wrappers | `src/lib/tauri.ts` | `getTransactions()` |

---

## Confidence Badge Color Mapping

```typescript
export function getConfidenceBadgeColor(confidence: number): string {
  if (confidence >= 0.85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (confidence >= 0.70) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-red-500/10 text-red-400 border-red-500/20';
}
```

---

## Tailwind CSS Rules

- Use Tailwind utility classes — avoid ad-hoc inline styles.
- Dark mode: all components default dark with `bg-slate-950`, `text-slate-100`.
- Glassmorphism cards: `bg-slate-900/40 backdrop-blur border border-slate-800`.
- Responsive: mobile-first with `sm:`, `lg:` breakpoints.
- Animations: use `transition-all`, `hover:scale-[1.01]`, and `animate-pulse` for loading states.

---

## Key Rules

- **Never** call `invoke()` directly from a component — always use `src/lib/tauri.ts` wrappers.
- **Always** unsubscribe from `listen()` on component unmount.
- **Prefer** named exports over default exports for components.
- **Use** auxiliary verb booleans: `isLoading`, `hasError`, `isWatcherActive`.

## References
- [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)
- [Tauri v2 Frontend Guide](https://tauri.app/develop/calling-rust/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

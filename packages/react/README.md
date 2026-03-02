# @narrify/react

React wrapper for the [Narrify SDK](https://www.npmjs.com/package/@narrify/sdk) — AI-powered interactive tours with vision-aware conversation.

## Installation

```bash
npm install @narrify/react @narrify/sdk
```

## Quick Start

```tsx
import { NarrifyProvider, useNarrify, NarrifyTour } from '@narrify/react';

function App() {
  return (
    <NarrifyProvider config={{ apiKey: 'your-api-key', tours: [/* ... */] }}>
      <NarrifyTour autoStart />
      <MyPage />
    </NarrifyProvider>
  );
}

function MyPage() {
  const { startTour, stopTour, state } = useNarrify();

  return (
    <button onClick={() => startTour()}>
      {state === 'playing' ? 'Tour Running...' : 'Start Tour'}
    </button>
  );
}
```

## API

### `<NarrifyProvider>`

Wraps your app and initializes the Narrify SDK.

| Prop | Type | Description |
|------|------|-------------|
| `config` | `NarrifyConfig & { apiKey: string }` | SDK configuration |

### `useNarrify()`

Hook returning tour control methods and state.

```ts
const {
  engine,           // NarrifyEngine instance
  state,            // 'idle' | 'playing' | 'paused' | 'conversation' | 'hover-explore'
  isReady,          // true once SDK is initialized
  startTour,        // (tourId?: string) => void
  stopTour,         // () => void
  nextStep,         // () => void
  previousStep,     // () => void
  togglePlayPause,  // () => void
  openConversation, // () => void
  closeConversation // () => void
} = useNarrify();
```

### `useNarrifyConversation()`

Hook for controlling the conversation UI.

```ts
const { open, close, toggle, isOpen } = useNarrifyConversation();
```

### `<NarrifyTour>`

Renderless component that auto-starts a tour on mount.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tourId` | `string` | — | Specific tour to start |
| `autoStart` | `boolean` | `false` | Start tour on mount |

## Next.js (App Router)

Wrap the provider in a `'use client'` component:

```tsx
// app/providers.tsx
'use client';
import { NarrifyProvider } from '@narrify/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NarrifyProvider config={{ apiKey: process.env.NEXT_PUBLIC_NARRIFY_KEY! }}>
      {children}
    </NarrifyProvider>
  );
}
```

## License

MIT

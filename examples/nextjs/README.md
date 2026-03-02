# Narrify - Next.js Example

Next.js 14 App Router integration with `@narrify/react`.

## Setup

```bash
npm install
npm run dev
```

## What's Included

- `app/providers.tsx` — `'use client'` wrapper with NarrifyProvider (required for SSR)
- `app/layout.tsx` — Root layout wrapping children in Providers
- `app/page.tsx` — Demo page using the `useNarrify` hook

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_NARRIFY_KEY=your_api_key_here
```

Or replace `YOUR_API_KEY` directly in `app/providers.tsx`.

## Key Pattern

Since Narrify uses browser APIs (DOM, canvas), the provider **must** be in a `'use client'` component. Server components can still render inside the provider — only the provider boundary itself needs the client directive.

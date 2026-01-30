# Demo Mode - Testing Without Supabase

The Narrify dashboard can run in **Demo Mode** with mock data, allowing you to explore the UI without setting up Supabase or any external services.

## 🚀 Quick Start (Demo Mode)

```bash
# Install dependencies
pnpm install

# Start the dashboard in demo mode (no .env needed!)
cd apps/dashboard
pnpm dev
```

The dashboard will start at http://localhost:3003 and automatically use mock data.

## ✨ What Works in Demo Mode

Everything in the UI is fully functional:

- ✅ **Dashboard Overview** - View stats with sample data
- ✅ **Tours Management** - See 3 pre-configured sample tours
- ✅ **Tour Builder** - Create and edit tours (changes persist in memory)
- ✅ **Theme Editor** - Customize colors with live preview
- ✅ **AI Settings** - Configure conversation and vision settings
- ✅ **API Keys** - Manage API keys (3 sample keys included)
- ✅ **Analytics** - View charts with 7 days of mock analytics data
- ✅ **Embed Code** - Get integration code snippets

## 📊 Mock Data Includes

- **3 Sample Tours**: Onboarding Tour, Feature Highlights, Settings Guide
- **3 API Keys**: Production Key, Development Key, and one disabled key
- **7 Days of Analytics**: ~100 tour views, ~70 completions, ~40 questions
- **Client Config**: Pre-configured theme and AI settings

## 🔄 Data Persistence

In demo mode:
- Changes are stored **in-memory only**
- Data resets when you restart the dev server
- Perfect for testing and UI exploration

## 🔗 Switching to Production Mode

When ready to use real data:

1. Copy the example environment file:
```bash
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

2. Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Add AI service keys (optional for dashboard testing):
```env
ANTHROPIC_API_KEY=your-key
ELEVENLABS_API_KEY=your-key
```

4. Restart the dev server:
```bash
pnpm dev
```

The app will automatically detect the environment variables and switch to production mode.

## 🎨 Demo Mode Indicator

When running in demo mode, you'll see:
- A yellow banner at the top: **"Demo Mode Active"**
- Console warning: `⚠️ Running in DEMO MODE`

## 📝 Notes

- Authentication is bypassed in demo mode
- API routes will still require real API keys (not needed for dashboard UI testing)
- The SDK package is independent and doesn't use demo mode
- All database operations work through the mock client

## 🛠️ Implementation Details

Demo mode uses:
- `lib/mock-data.ts` - Sample data (tours, keys, analytics, client config)
- `lib/supabase/mock-client.ts` - Mock Supabase client that mimics the real API
- Automatic detection via environment variable presence

The mock client supports:
- All `select()` queries with filters, ordering, limits
- `insert()`, `update()`, `delete()` operations
- In-memory data persistence during session
- Identical API to real Supabase client

# Narrify

> AI-powered interactive tour SDK with vision-aware conversation

Narrify is an embeddable SDK that adds AI-powered, voice-guided interactive tours to any website. Clients get full customization control via a dashboard, and can embed with a single script tag or NPM package.

## 🌟 Key Features

### ✨ What Makes Narrify Unique

**Vision-Aware AI Conversation** - The game-changing differentiator:
- AI can **see** what's on the user's screen in real-time
- Answers questions based on live viewport screenshots
- Uses Claude Vision API + Browser Speech APIs (NOT ElevenLabs Agent)
- Costs ~$0.04 per question vs $0.10+ for ElevenLabs Agent

**Example:**
> User: "What does this purple number mean?"
>
> AI (seeing $14,740 on screen): "That's your Hero tier daily target - $14,740. It's highlighted in purple because that's your peak performance goal..."

### Core Features

1. **White-Label Customization**
   - Custom colors, fonts, branding
   - Multi-language support (29+ languages)
   - Configurable UI positioning and behavior

2. **Voice-Guided Tours**
   - ElevenLabs text-to-speech
   - Adjustable speech speed (0.75x - 2.0x)
   - Automatic captions when sound is off

3. **Hover Exploration Mode**
   - Mark elements as "explainable"
   - Hover to see AI-generated explanations
   - Controlled by client, not random AI guesses

4. **Interactive Controls**
   - Play/pause, skip, replay
   - Progress bar with seek
   - Keyboard shortcuts
   - Exit confirmations

5. **Context-Aware**
   - Start from any page
   - Detect current screen state
   - Personalized tour paths

## 🏗️ Architecture

```
narrify/
├── packages/
│   ├── sdk/              # Core embeddable SDK
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── NarrifyEngine.ts       # Main orchestration
│   │   │   │   ├── SpotlightOverlay.ts    # Highlight system
│   │   │   │   ├── VoicePlayer.ts         # ElevenLabs TTS
│   │   │   │   ├── ScreenCapture.ts       # Screenshot capture
│   │   │   │   ├── SpeechToText.ts        # Browser STT
│   │   │   │   ├── VisionAI.ts            # Claude Vision API
│   │   │   │   └── HoverExplorer.ts       # Hover mode
│   │   │   └── index.ts
│   │   └── package.json
│   └── shared/           # Shared types
│       └── src/
│           └── types.ts
└── apps/
    └── dashboard/        # Next.js dashboard
        ├── app/
        │   ├── api/
        │   │   ├── narrify-ai/    # Claude Vision endpoint
        │   │   └── narrify-voice/ # ElevenLabs TTS endpoint
        │   └── page.tsx
        ├── lib/
        │   └── supabase/
        └── supabase/
            └── schema.sql
```

## 🚀 Quick Start

### 🎮 Demo Mode (No Setup Required!)

Test the dashboard immediately with mock data - no Supabase or API keys needed:

```bash
# Install dependencies
pnpm install

# Start dashboard in demo mode
cd apps/dashboard
pnpm dev
```

Visit http://localhost:3003 - the dashboard will automatically use mock data!

**📖 See [DEMO_MODE.md](./DEMO_MODE.md) for full details**

### For Developers (Building Narrify)

```bash
# Install dependencies
pnpm install

# Set up environment variables (optional for demo mode)
cp apps/dashboard/.env.example apps/dashboard/.env.local
# Edit .env.local with your API keys

# Run development
pnpm dev

# Build all packages
pnpm build
```

### For Clients (Using Narrify)

#### Option 1: Script Tag (Any Website)

```html
<script src="https://cdn.narrify.io/v1/narrify.min.js"></script>
<script>
  Narrify.init({
    apiKey: 'nr_live_xxxxx',
    theme: {
      primary: '#10b981',
      background: 'rgba(0, 0, 0, 0.6)',
      text: '#ffffff',
      accent: '#3b82f6'
    },
    language: 'en',
    speechSpeed: 1.0,
    conversation: {
      enabled: true,
      agentName: 'Narrify Assistant',
      vision: {
        enabled: true
      }
    }
  });
</script>
```

#### Option 2: NPM Package (React/Vue/Next.js)

```bash
npm install @narrify/sdk
```

```typescript
import Narrify from '@narrify/sdk';

Narrify.init({
  apiKey: 'nr_live_xxxxx',
  theme: { primary: '#10b981' },
  tours: [
    {
      id: 'onboarding',
      name: 'Getting Started',
      pages: [
        {
          id: 'dashboard',
          url: '/dashboard',
          title: 'Dashboard',
          steps: [
            {
              id: 'step-1',
              title: 'Welcome',
              description: 'Welcome to your dashboard',
              selector: '#main-dashboard',
              script: 'Welcome to your dashboard! Let me show you around.',
              position: 'center'
            }
          ]
        }
      ]
    }
  ]
});
```

## 🎨 Configuration

### Full Configuration Schema

```typescript
interface NarrifyConfig {
  apiKey: string;

  // Theme
  theme: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };

  // Language
  language: string; // 'en', 'es', 'fr', 'de', etc.

  // Captions
  captions: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'floating';
    fontSize: 'sm' | 'md' | 'lg';
  };

  // Auto-start
  autoStart: boolean;
  triggerButton: boolean;

  // Context-aware start
  startMode: 'full-tour' | 'current-page' | 'hover-explore';

  // Speech speed
  speechSpeed: 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
  allowSpeedControl: boolean;

  // Tours
  tours: TourDefinition[];

  // Vision-Aware Conversation
  conversation: {
    enabled: boolean;
    buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right';
    buttonLabel: string;
    agentName: string;
    agentPersonality: string; // System prompt
    showTranscript: boolean;
    textFallback: boolean;
    vision: {
      enabled: boolean;
      captureMode: 'viewport';
      includeDOM: boolean;
      maxImageSize: number; // KB
    };
  };

  // Hover Exploration
  hoverExplore: {
    enabled: boolean;
    markedElementsOnly: boolean;
    markerAttribute: string; // 'data-narrify-explain'
    triggerDelay: number; // ms
    speakOnHover: boolean;
  };

  // Progress bar
  progressBar: {
    visible: boolean;
    clickToSeek: boolean;
    position: 'top' | 'bottom';
  };

  // Keyboard shortcuts
  keyboard: {
    enabled: boolean;
    playPause: string; // 'Space'
    next: string; // 'ArrowRight'
    previous: string; // 'ArrowLeft'
    replay: string; // 'KeyR'
    exit: string; // 'Escape'
  };

  // Exit behavior
  exit: {
    confirmationDialog: boolean;
    confirmationTitle: string;
    confirmationMessage: string;
  };
}
```

### Marking Elements for Hover Exploration

```html
<!-- Mark elements in your HTML -->
<div
  data-narrify-explain="true"
  data-narrify-explain-title="Revenue Chart"
  data-narrify-explain-hint="This shows daily revenue breakdown"
>
  <!-- Chart content -->
</div>
```

Or configure via JavaScript:

```typescript
hoverExplore: {
  enabled: true,
  elements: [
    {
      selector: '.revenue-chart',
      title: 'Revenue Chart',
      explanation: 'Shows daily revenue breakdown by source'
    }
  ]
}
```

## 🔌 API Routes

### `/api/narrify-ai` - Vision AI Endpoint

Handles Claude Vision API calls for screen-aware conversation.

**Request:**
```typescript
{
  screenshot: string; // base64 image
  question: string;
  context: {
    currentStep: TourStep;
    stepIndex: number;
    totalSteps: number;
    pageTitle: string;
  };
  systemPrompt: string;
  knowledgeBase?: string;
}
```

**Response:**
```typescript
{
  answer: string;
  confidence: number;
  sources: string[];
}
```

### `/api/narrify-voice` - TTS Endpoint

Handles ElevenLabs text-to-speech generation.

**Request:**
```typescript
{
  text: string;
  voiceId: string;
  speed: number;
  language: string;
}
```

**Response:** Audio blob (audio/mpeg)

## 💾 Database Schema

The Supabase database includes:

- **clients** - Client accounts with config
- **api_keys** - API keys for SDK authentication
- **tours** - Tour definitions
- **analytics_events** - Usage tracking

See `apps/dashboard/supabase/schema.sql` for the complete schema.

## 🔐 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI Services
ANTHROPIC_API_KEY=your-anthropic-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CDN_URL=https://cdn.narrify.io
```

## 📊 Cost Analysis

| Service | Usage | Cost per Use |
|---------|-------|--------------|
| Claude Vision | Screenshot + question | ~$0.01 |
| ElevenLabs TTS | Response audio | ~$0.03 |
| Browser STT | Free | $0 |
| **Total per Q&A** | | **~$0.04** |

Compare to ElevenLabs Agent: ~$0.10+ per minute

## 🎯 Next Steps

### Phase 1: Foundation ✅
- [x] Core SDK with all features
- [x] Vision-Aware AI system
- [x] API routes (Claude + ElevenLabs)
- [x] Database schema
- [x] Monorepo structure

### Phase 2: Dashboard (TODO)
- [ ] Authentication UI
- [ ] Tour Builder
- [ ] Theme Editor
- [ ] AI Settings
- [ ] API Key Management
- [ ] Analytics Dashboard

### Phase 3: UI Components (TODO)
- [ ] ControlBar component
- [ ] ConversationUI component
- [ ] HoverTooltip component
- [ ] CaptionOverlay component
- [ ] Progress Bar component

### Phase 4: Distribution (TODO)
- [ ] Build and minify SDK
- [ ] CDN setup
- [ ] React wrapper (@narrify/react)
- [ ] Documentation site
- [ ] Example integrations

## 🛠️ Tech Stack

- **SDK**: TypeScript, Vite, html2canvas
- **Dashboard**: Next.js 14 (App Router), React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude Sonnet 4.5 (Vision API)
- **Voice**: ElevenLabs (TTS only, not Agent)
- **Speech**: Browser Web Speech API (STT)

## 📝 License

Proprietary - All Rights Reserved

## 🤝 Support

For questions or issues:
- Documentation: https://docs.narrify.io
- Email: support@narrify.io
- Discord: https://discord.gg/narrify

---

Built with ❤️ by the Narrify team

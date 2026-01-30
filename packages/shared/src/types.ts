/**
 * Narrify Shared Types
 * Used across SDK, Dashboard, and API
 */

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface NarrifyConfig {
  apiKey: string;

  // 1. Colors & Theme
  theme: ThemeConfig;

  // 2. Language
  language: string;

  // 3. Captions (when sound off)
  captions: CaptionConfig;

  // 4. On/Off Mode
  autoStart: boolean;
  triggerButton: boolean;
  triggerSelector?: string;

  // 5. Context-aware start
  startMode: 'full-tour' | 'current-page' | 'hover-explore';

  // 6. Speech speed
  speechSpeed: 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
  allowSpeedControl: boolean;

  // 7. Tour definition
  tours: TourDefinition[];

  // 8. Vision-Aware AI Conversation
  conversation: ConversationConfig;

  // 9. Hover Exploration Mode
  hoverExplore: HoverExploreConfig;

  // 10. Progress Bar
  progressBar: ProgressBarConfig;

  // 11. Keyboard Shortcuts
  keyboard: KeyboardConfig;

  // 12. Exit Behavior
  exit: ExitConfig;
}

export interface ThemeConfig {
  primary: string;        // Spotlight border color
  background: string;     // Overlay background
  text: string;           // Caption text color
  accent: string;         // Buttons, highlights
}

export interface CaptionConfig {
  enabled: boolean;
  position: 'top' | 'bottom' | 'floating';
  fontSize: 'sm' | 'md' | 'lg';
}

export interface ConversationConfig {
  enabled: boolean;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'inline';
  buttonLabel: string;
  agentName: string;
  agentPersonality: string;
  showTranscript: boolean;
  textFallback: boolean;

  vision: VisionConfig;
}

export interface VisionConfig {
  enabled: boolean;
  captureMode: 'viewport';
  includeDOM: boolean;
  maxImageSize: number;
}

export interface HoverExploreConfig {
  enabled: boolean;
  markedElementsOnly: boolean;
  markerAttribute: string;
  triggerDelay: number;
  speakOnHover: boolean;
  elements?: ExplainableElement[];
}

export interface ProgressBarConfig {
  visible: boolean;
  clickToSeek: boolean;
  position: 'top' | 'bottom';
}

export interface KeyboardConfig {
  enabled: boolean;
  playPause: string;
  next: string;
  previous: string;
  replay: string;
  exit: string;
}

export interface ExitConfig {
  confirmationDialog: boolean;
  confirmationTitle: string;
  confirmationMessage: string;
}

// ============================================================================
// TOUR TYPES
// ============================================================================

export interface TourDefinition {
  id: string;
  name: string;
  description?: string;
  pages: PageDefinition[];
  metadata?: Record<string, any>;
}

export interface PageDefinition {
  id: string;
  url: string;
  title: string;
  steps: TourStep[];
}

export interface TourStep {
  id: string;
  title: string;
  description: string;
  selector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  script: string;           // What the AI should say
  waitFor?: string;         // Optional selector to wait for
  action?: StepAction;      // Optional action to perform
  duration?: number;        // Optional duration in ms
}

export interface StepAction {
  type: 'click' | 'scroll' | 'hover' | 'wait';
  selector?: string;
  delay?: number;
}

// ============================================================================
// HOVER EXPLORATION TYPES
// ============================================================================

export interface ExplainableElement {
  selector: string;
  title: string;
  explanation: string;
  priority?: number;
}

// ============================================================================
// AI & CONVERSATION TYPES
// ============================================================================

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  screenshot?: string;
}

export interface AIRequest {
  screenshot: string;
  question: string;
  context: TourContext;
  systemPrompt: string;
  knowledgeBase?: string;
}

export interface AIResponse {
  answer: string;
  confidence?: number;
  sources?: string[];
}

export interface TourContext {
  currentStep: TourStep;
  stepIndex: number;
  totalSteps: number;
  pageTitle: string;
  tourId: string;
}

// ============================================================================
// VOICE & SPEECH TYPES
// ============================================================================

export interface VoiceConfig {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  language: string;
}

export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  type: 'tour_start' | 'tour_complete' | 'tour_exit' | 'step_view' | 'conversation_start' | 'question_asked' | 'hover_explore';
  tourId: string;
  stepId?: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface UsageStats {
  tourViews: number;
  completionRate: number;
  averageCompletionTime: number;
  dropOffPoints: Array<{ stepId: string; count: number }>;
  topQuestions: Array<{ question: string; count: number }>;
  conversationTopics: Array<{ topic: string; count: number }>;
}

// ============================================================================
// API KEY & CLIENT TYPES
// ============================================================================

export interface APIKey {
  id: string;
  key: string;
  name: string;
  clientId: string;
  domains: string[];
  usageLimit?: number;
  usageCount: number;
  createdAt: Date;
  lastUsedAt?: Date;
  active: boolean;
}

export interface Client {
  id: string;
  email: string;
  name: string;
  company?: string;
  config: NarrifyConfig;
  apiKeys: APIKey[];
  createdAt: Date;
  subscription: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
  };
}

// ============================================================================
// DATABASE TYPES (Supabase)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'createdAt'>;
        Update: Partial<Omit<Client, 'id'>>;
      };
      tours: {
        Row: TourDefinition & { clientId: string };
        Insert: Omit<TourDefinition, 'id'> & { clientId: string };
        Update: Partial<TourDefinition>;
      };
      analytics_events: {
        Row: AnalyticsEvent & { id: string; clientId: string };
        Insert: Omit<AnalyticsEvent, 'timestamp'> & { clientId: string };
        Update: never;
      };
      api_keys: {
        Row: APIKey;
        Insert: Omit<APIKey, 'id' | 'createdAt' | 'usageCount'>;
        Update: Partial<Omit<APIKey, 'id' | 'key'>>;
      };
    };
  };
}

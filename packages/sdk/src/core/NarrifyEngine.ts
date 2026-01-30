/**
 * NarrifyEngine
 * Main orchestration engine for tours
 */

import type {
  NarrifyConfig,
  TourDefinition,
  TourStep,
  TourContext,
  AnalyticsEvent
} from '@narrify/shared';
import { SpotlightOverlay } from './SpotlightOverlay';
import { VoicePlayer } from './VoicePlayer';
import { ScreenCapture } from './ScreenCapture';
import { SpeechToText } from './SpeechToText';
import { VisionAI } from './VisionAI';
import { HoverExplorer } from './HoverExplorer';
import { ConversationUI } from './ConversationUI';

export type TourState = 'idle' | 'playing' | 'paused' | 'conversation' | 'hover-explore';

export interface NarrifyEngineOptions extends Partial<NarrifyConfig> {
  apiKey: string;
}

export class NarrifyEngine {
  private config: NarrifyEngineOptions;
  private state: TourState = 'idle';

  // Core components
  private spotlight: SpotlightOverlay;
  private voicePlayer: VoicePlayer;
  private screenCapture: ScreenCapture;
  private speechToText: SpeechToText;
  private visionAI: VisionAI;
  private hoverExplorer: HoverExplorer | null = null;
  private conversationUI: ConversationUI | null = null;

  // Tour state
  private currentTour: TourDefinition | null = null;
  private currentStepIndex: number = 0;
  private sessionId: string;

  // UI elements
  private rootElement: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;

  constructor(config: NarrifyEngineOptions) {
    this.config = this.mergeConfig(config);
    this.sessionId = this.generateSessionId();

    // Initialize components
    this.spotlight = new SpotlightOverlay(this.config.theme!);
    this.voicePlayer = new VoicePlayer({
      apiKey: this.config.apiKey,
      speed: this.config.speechSpeed!,
      language: this.config.language!,
    });
    this.screenCapture = new ScreenCapture({
      maxSize: this.config.conversation?.vision?.maxImageSize || 500,
    });
    this.speechToText = new SpeechToText({
      language: this.config.language!,
    });
    this.visionAI = new VisionAI({
      apiKey: this.config.apiKey,
    });

    // Initialize hover explorer if enabled
    if (this.config.hoverExplore?.enabled) {
      this.hoverExplorer = new HoverExplorer(
        this.config.hoverExplore,
        this.voicePlayer,
        this.visionAI
      );
    }

    // Setup UI
    this.setupUI();

    // Initialize conversation UI if enabled
    if (this.config.conversation?.enabled && this.shadowRoot) {
      this.conversationUI = new ConversationUI(
        {
          buttonLabel: this.config.conversation.buttonLabel || 'Engage with Narrify',
          buttonPosition: this.config.conversation.buttonPosition || 'bottom-right',
          agentName: this.config.conversation.agentName || 'Narrify',
          agentPersonality: this.config.conversation.agentPersonality || 'You are a helpful tour guide.',
          primaryColor: this.config.theme?.primary || '#10b981',
          textColor: this.config.theme?.text || '#ffffff',
        },
        this.visionAI,
        this.voicePlayer,
        this.speechToText,
        this.screenCapture,
        this.shadowRoot
      );

      // Set up continue tour callback
      this.conversationUI.onContinue(() => {
        this.state = 'playing';
        this.resume();
      });
    }

    // Setup keyboard shortcuts
    if (this.config.keyboard?.enabled) {
      this.setupKeyboardShortcuts();
    }

    // Track initialization
    this.trackEvent('tour_initialized');
  }

  /**
   * Merge user config with defaults
   */
  private mergeConfig(config: NarrifyEngineOptions): NarrifyEngineOptions {
    return {
      apiKey: config.apiKey,
      theme: {
        primary: '#10b981',
        background: 'rgba(0, 0, 0, 0.6)',
        text: '#ffffff',
        accent: '#3b82f6',
        ...config.theme,
      },
      language: config.language || 'en',
      captions: {
        enabled: true,
        position: 'bottom',
        fontSize: 'md',
        ...config.captions,
      },
      autoStart: config.autoStart ?? false,
      triggerButton: config.triggerButton ?? true,
      startMode: config.startMode || 'full-tour',
      speechSpeed: config.speechSpeed || 1.0,
      allowSpeedControl: config.allowSpeedControl ?? true,
      tours: config.tours || [],
      conversation: {
        enabled: true,
        buttonPosition: 'bottom-right',
        buttonLabel: 'Ask Narrify',
        agentName: 'Narrify',
        agentPersonality: 'You are a helpful tour guide. Answer questions about what the user sees on screen.',
        showTranscript: true,
        textFallback: true,
        vision: {
          enabled: true,
          captureMode: 'viewport',
          includeDOM: false,
          maxImageSize: 500,
          ...config.conversation?.vision,
        },
        ...config.conversation,
      },
      hoverExplore: {
        enabled: false,
        markedElementsOnly: true,
        markerAttribute: 'data-narrify-explain',
        triggerDelay: 500,
        speakOnHover: false,
        ...config.hoverExplore,
      },
      progressBar: {
        visible: true,
        clickToSeek: true,
        position: 'bottom',
        ...config.progressBar,
      },
      keyboard: {
        enabled: true,
        playPause: 'Space',
        next: 'ArrowRight',
        previous: 'ArrowLeft',
        replay: 'KeyR',
        exit: 'Escape',
        conversation: 'KeyC',
        ...config.keyboard,
      },
      exit: {
        confirmationDialog: true,
        confirmationTitle: 'Exit Tour?',
        confirmationMessage: 'Are you sure you want to exit the tour?',
        ...config.exit,
      },
      visionNavigation: {
        enabled: true,
        fallbackToSelector: true,
        logResults: true,
        ...config.visionNavigation,
      },
    };
  }

  /**
   * Setup UI container with Shadow DOM
   */
  private setupUI(): void {
    // Create root container
    this.rootElement = document.createElement('div');
    this.rootElement.id = 'narrify-root';
    this.rootElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      pointer-events: none;
    `;

    // Attach shadow DOM for style isolation
    this.shadowRoot = this.rootElement.attachShadow({ mode: 'open' });

    // Inject base styles
    const style = document.createElement('style');
    style.textContent = this.getBaseStyles();
    this.shadowRoot.appendChild(style);

    // Append to body
    document.body.appendChild(this.rootElement);
  }

  /**
   * Get base CSS styles
   */
  private getBaseStyles(): string {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      :host {
        --narrify-primary: ${this.config.theme!.primary};
        --narrify-background: ${this.config.theme!.background};
        --narrify-text: ${this.config.theme!.text};
        --narrify-accent: ${this.config.theme!.accent};
      }

      .narrify-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--narrify-background);
        pointer-events: auto;
      }

      .narrify-spotlight {
        position: absolute;
        border: 3px solid var(--narrify-primary);
        border-radius: 8px;
        box-shadow: 0 0 0 9999px var(--narrify-background);
        pointer-events: none;
        transition: all 0.3s ease;
      }

      .narrify-caption {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: var(--narrify-text);
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 18px;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 800px;
        text-align: center;
        pointer-events: auto;
      }

      .narrify-caption.top {
        top: 20px;
      }

      .narrify-caption.bottom {
        bottom: 20px;
      }

      .narrify-controls {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 12px 16px;
        border-radius: 12px;
        display: flex;
        gap: 8px;
        align-items: center;
        pointer-events: auto;
      }

      .narrify-button {
        background: var(--narrify-accent);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.2s;
      }

      .narrify-button:hover {
        opacity: 0.8;
      }

      .narrify-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.config.keyboard?.enabled) return;

      const { playPause, next, previous, replay, exit, conversation } = this.config.keyboard;

      switch (e.code) {
        case playPause:
          e.preventDefault();
          this.togglePlayPause();
          break;
        case next:
          e.preventDefault();
          this.nextStep();
          break;
        case previous:
          e.preventDefault();
          this.previousStep();
          break;
        case replay:
          e.preventDefault();
          this.restart();
          break;
        case exit:
          e.preventDefault();
          this.stop();
          break;
        case conversation:
          e.preventDefault();
          if (this.conversationUI && this.state !== 'idle') {
            this.conversationUI.open();
          }
          break;
      }
    });
  }

  /**
   * Start the tour
   */
  async start(tourId?: string): Promise<void> {
    // Load tour
    if (tourId) {
      this.currentTour = this.config.tours?.find(t => t.id === tourId) || null;
    } else {
      this.currentTour = this.config.tours?.[0] || null;
    }

    if (!this.currentTour) {
      console.error('[Narrify] No tour found');
      return;
    }

    this.state = 'playing';
    this.currentStepIndex = 0;

    // Track start
    this.trackEvent('tour_start');

    // Show overlay
    this.spotlight.show();

    // Show conversation button during tour
    if (this.conversationUI) {
      this.conversationUI.show();
    }

    // Start first step
    await this.playStep(0);
  }

  /**
   * Play a specific step
   */
  private async playStep(index: number): Promise<void> {
    if (!this.currentTour) return;

    const allSteps = this.getAllSteps();
    if (index >= allSteps.length) {
      this.complete();
      return;
    }

    const step = allSteps[index];
    this.currentStepIndex = index;

    // Track step view
    this.trackEvent('step_view', { stepId: step.id });

    // Update conversation context
    if (this.conversationUI) {
      this.conversationUI.setContext(this.getTourContext());
    }

    // Wait for element if needed
    if (step.waitFor) {
      await this.waitForElement(step.waitFor);
    }

    // Locate and highlight element using vision-first approach
    let element: Element | null = null;
    let visionUsed = false;

    // Use vision if enabled (default)
    if (this.config.visionNavigation?.enabled !== false) {
      try {
        // Capture current screen
        const screenshot = await this.screenCapture.capture();

        // Get element description from step script or generate one
        const elementDescription = step.description || step.script;

        // Use vision AI to locate the element
        const location = await this.visionAI.locateElement(
          screenshot,
          elementDescription,
          step.selector, // Use as hint/fallback
          {
            tourId: this.currentTour.id,
            stepIndex: index,
            stepDescription: step.script,
          }
        );

        if (location.found && location.selector) {
          element = document.querySelector(location.selector);
          visionUsed = true;
          console.log('[Narrify] Vision located element:', {
            confidence: location.confidence,
            selector: location.selector,
            visualDescription: location.visualDescription,
          });
        } else if (location.fallbackToHint) {
          // Vision failed but we have a selector hint
          element = document.querySelector(step.selector);
          console.log('[Narrify] Vision failed, using selector fallback');
        }
      } catch (error) {
        console.warn('[Narrify] Vision navigation failed, falling back to selector:', error);
        element = document.querySelector(step.selector);
      }
    } else {
      // Vision disabled, use traditional selector
      element = document.querySelector(step.selector);
    }

    // Highlight the located element
    if (element) {
      this.spotlight.highlight(element as HTMLElement);
    } else {
      console.warn('[Narrify] Could not locate element for step:', step);
    }

    // Track vision usage
    if (visionUsed) {
      this.trackEvent('vision_navigation_success', { stepId: step.id });
    }

    // Play voice narration
    await this.voicePlayer.speak(step.script);

    // Perform action if configured
    if (step.action) {
      await this.performAction(step.action);
    }

    // Auto-advance to next step
    if (this.state === 'playing') {
      setTimeout(() => {
        this.nextStep();
      }, step.duration || 1000);
    }
  }

  /**
   * Get all steps from all pages
   */
  private getAllSteps(): TourStep[] {
    if (!this.currentTour) return [];
    return this.currentTour.pages.flatMap(page => page.steps);
  }

  /**
   * Wait for element to exist
   */
  private waitForElement(selector: string, timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve();
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  }

  /**
   * Perform step action
   */
  private async performAction(action: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, action.delay || 0));

    switch (action.type) {
      case 'click':
        if (action.selector) {
          const element = document.querySelector(action.selector);
          if (element) {
            (element as HTMLElement).click();
          }
        }
        break;
      case 'scroll':
        if (action.selector) {
          const element = document.querySelector(action.selector);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        break;
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, action.delay || 1000));
        break;
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause(): void {
    if (this.state === 'playing') {
      this.pause();
    } else if (this.state === 'paused') {
      this.resume();
    }
  }

  /**
   * Pause tour
   */
  pause(): void {
    this.state = 'paused';
    this.voicePlayer.pause();
  }

  /**
   * Resume tour
   */
  resume(): void {
    this.state = 'playing';
    this.voicePlayer.resume();
  }

  /**
   * Next step
   */
  nextStep(): void {
    this.playStep(this.currentStepIndex + 1);
  }

  /**
   * Previous step
   */
  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.playStep(this.currentStepIndex - 1);
    }
  }

  /**
   * Restart tour
   */
  restart(): void {
    this.currentStepIndex = 0;
    this.playStep(0);
  }

  /**
   * Stop tour
   */
  stop(): void {
    if (this.config.exit?.confirmationDialog) {
      const confirmed = confirm(
        this.config.exit.confirmationMessage || 'Exit tour?'
      );
      if (!confirmed) return;
    }

    this.state = 'idle';
    this.voicePlayer.stop();
    this.spotlight.hide();

    // Hide conversation button
    if (this.conversationUI) {
      this.conversationUI.hide();
    }

    this.trackEvent('tour_exit');
  }

  /**
   * Complete tour
   */
  private complete(): void {
    this.state = 'idle';
    this.voicePlayer.stop();
    this.spotlight.hide();

    // Hide conversation button
    if (this.conversationUI) {
      this.conversationUI.hide();
    }

    this.trackEvent('tour_complete');
  }

  /**
   * Get current tour context
   */
  private getTourContext(): TourContext | null {
    if (!this.currentTour) return null;

    const allSteps = this.getAllSteps();
    const currentStep = allSteps[this.currentStepIndex];

    return {
      currentStep,
      stepIndex: this.currentStepIndex,
      totalSteps: allSteps.length,
      pageTitle: document.title,
      tourId: this.currentTour.id,
    };
  }

  /**
   * Track analytics event
   */
  private trackEvent(type: string, metadata?: any): void {
    // Send to analytics API
    const event: Partial<AnalyticsEvent> = {
      type: type as any,
      tourId: this.currentTour?.id || '',
      stepId: this.getAllSteps()[this.currentStepIndex]?.id,
      sessionId: this.sessionId,
      metadata,
    };

    // In production, send to API
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });
    console.log('[Narrify Analytics]', event);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Destroy instance
   */
  destroy(): void {
    this.stop();
    this.spotlight.destroy();
    this.voicePlayer.destroy();
    if (this.hoverExplorer) {
      this.hoverExplorer.destroy();
    }
    if (this.rootElement) {
      document.body.removeChild(this.rootElement);
    }
  }

  /**
   * Get current state
   */
  getState(): TourState {
    return this.state;
  }

  /**
   * Get current config
   */
  getConfig(): NarrifyEngineOptions {
    return this.config;
  }
}

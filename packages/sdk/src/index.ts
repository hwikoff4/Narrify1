/**
 * Narrify SDK
 * AI-powered interactive tours with vision-aware conversation
 */

import { NarrifyEngine } from './core/NarrifyEngine';
import type { NarrifyConfig } from '@narrify/shared';

/**
 * Global Narrify namespace for script tag usage
 */
declare global {
  interface Window {
    Narrify: typeof Narrify;
  }
}

/**
 * Main Narrify SDK class
 */
export class Narrify {
  private static instance: NarrifyEngine | null = null;

  /**
   * Initialize Narrify with configuration
   */
  static init(config: Partial<NarrifyConfig>): NarrifyEngine {
    if (this.instance) {
      console.warn('[Narrify] Already initialized. Use destroy() first to reinitialize.');
      return this.instance;
    }

    // Validate required config
    if (!config.apiKey) {
      throw new Error('[Narrify] API key is required');
    }

    // Create engine instance
    this.instance = new NarrifyEngine(config);

    // Auto-start if configured
    if (config.autoStart) {
      this.instance.start();
    }

    return this.instance;
  }

  /**
   * Get current instance
   */
  static getInstance(): NarrifyEngine | null {
    return this.instance;
  }

  /**
   * Destroy current instance
   */
  static destroy(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }

  /**
   * Version
   */
  static readonly version = '1.0.0';
}

// Export types
export * from '@narrify/shared';
export { NarrifyEngine } from './core/NarrifyEngine';
export { SpotlightOverlay } from './core/SpotlightOverlay';
export { VoicePlayer } from './core/VoicePlayer';
export { ScreenCapture } from './core/ScreenCapture';
export { SpeechToText } from './core/SpeechToText';
export { VisionAI } from './core/VisionAI';

// Attach to window for script tag usage
if (typeof window !== 'undefined') {
  window.Narrify = Narrify;
}

// Default export
export default Narrify;

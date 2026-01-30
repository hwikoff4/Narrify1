/**
 * SpeechToText
 * Uses browser's Web Speech API for voice recognition
 */

export interface SpeechToTextConfig {
  language: string;
  continuous?: boolean;
  interimResults?: boolean;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class SpeechToText {
  private config: SpeechToTextConfig;
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;

  constructor(config: SpeechToTextConfig) {
    this.config = config;
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Start listening
   */
  startListening(callbacks: {
    onResult: (text: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
    onStart?: () => void;
  }): void {
    if (!this.isSupported()) {
      console.error('[SpeechToText] Speech recognition not supported');
      callbacks.onError?.(new Error('Speech recognition not supported'));
      return;
    }

    if (this.isListening) {
      console.warn('[SpeechToText] Already listening');
      return;
    }

    // Create recognition instance
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionClass();

    this.recognition.continuous = this.config.continuous ?? false;
    this.recognition.interimResults = this.config.interimResults ?? true;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = 1;

    // Handle results
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[event.resultIndex];
      const transcript = lastResult[0].transcript;
      const isFinal = lastResult.isFinal;

      callbacks.onResult(transcript, isFinal);
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      console.error('[SpeechToText] Error:', event.error);
      this.isListening = false;
      callbacks.onError?.(event.error);
    };

    // Handle end
    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    // Handle start
    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      console.error('[SpeechToText] Failed to start:', error);
      this.isListening = false;
      callbacks.onError?.(error);
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Abort listening
   */
  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get supported languages (browser-specific)
   */
  getSupportedLanguages(): string[] {
    // Common languages supported by Web Speech API
    return [
      'en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'de-DE',
      'it-IT', 'pt-BR', 'pt-PT', 'ru-RU', 'ja-JP', 'ko-KR',
      'zh-CN', 'zh-TW', 'ar-SA', 'hi-IN', 'nl-NL', 'pl-PL',
      'sv-SE', 'tr-TR'
    ];
  }

  /**
   * Destroy instance
   */
  destroy(): void {
    this.abort();
    this.recognition = null;
  }
}

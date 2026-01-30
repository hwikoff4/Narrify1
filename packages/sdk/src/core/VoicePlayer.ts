/**
 * VoicePlayer
 * Handles text-to-speech using ElevenLabs API
 */

export interface VoicePlayerConfig {
  apiKey: string;
  speed: number;
  language: string;
  voiceId?: string;
}

export class VoicePlayer {
  private config: VoicePlayerConfig;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isPaused: boolean = false;
  private cache: Map<string, string> = new Map();

  constructor(config: VoicePlayerConfig) {
    this.config = config;
    this.setupAudioContext();
  }

  /**
   * Setup Web Audio API context
   */
  private setupAudioContext(): void {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Speak text using ElevenLabs TTS
   */
  async speak(text: string): Promise<void> {
    // Check cache first
    const cacheKey = this.getCacheKey(text);
    let audioUrl = this.cache.get(cacheKey);

    // Generate audio if not cached
    if (!audioUrl) {
      audioUrl = await this.generateSpeech(text);
      this.cache.set(cacheKey, audioUrl);
    }

    // Play audio
    return this.playAudio(audioUrl);
  }

  /**
   * Generate speech from text via API
   */
  private async generateSpeech(text: string): Promise<string> {
    try {
      // Call server-side API endpoint (not direct ElevenLabs)
      const response = await fetch('/api/narrify-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Narrify-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          text,
          voiceId: this.config.voiceId || 'default',
          speed: this.config.speed,
          language: this.config.language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Voice API error: ${response.statusText}`);
      }

      // Get audio blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      return url;
    } catch (error) {
      console.error('[VoicePlayer] Failed to generate speech:', error);

      // Fallback to browser's speech synthesis
      return this.fallbackToWebSpeech(text);
    }
  }

  /**
   * Fallback to browser's Web Speech API
   */
  private fallbackToWebSpeech(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.config.speed;
      utterance.lang = this.config.language;

      utterance.onend = () => {
        resolve(''); // No audio URL for Web Speech API
      };

      utterance.onerror = (error) => {
        reject(error);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Play audio from URL
   */
  private playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve(); // Web Speech API already played
        return;
      }

      this.currentAudio = new Audio(url);
      this.currentAudio.playbackRate = this.config.speed;

      this.currentAudio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        reject(error);
      };

      this.currentAudio.play().catch(reject);
    });
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume playback
   */
  resume(): void {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play();
      this.isPaused = false;
    }
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPaused = false;
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    this.config.speed = speed;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = speed;
    }
  }

  /**
   * Get cache key
   */
  private getCacheKey(text: string): string {
    return `${text}-${this.config.voiceId}-${this.config.speed}-${this.config.language}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    // Revoke blob URLs
    this.cache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.cache.clear();
  }

  /**
   * Destroy player
   */
  destroy(): void {
    this.stop();
    this.clearCache();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

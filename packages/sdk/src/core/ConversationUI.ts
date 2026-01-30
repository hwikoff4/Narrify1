/**
 * ConversationUI
 * Interactive "Engage with Narrify" interface for voice-based Q&A
 */

import type { TourContext } from '@narrify/shared';
import { VisionAI } from './VisionAI';
import { VoicePlayer } from './VoicePlayer';
import { SpeechToText } from './SpeechToText';
import { ScreenCapture } from './ScreenCapture';

export interface ConversationUIConfig {
  buttonLabel: string;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  agentName: string;
  agentPersonality: string;
  primaryColor: string;
  textColor: string;
}

export class ConversationUI {
  private config: ConversationUIConfig;
  private visionAI: VisionAI;
  private voicePlayer: VoicePlayer;
  private speechToText: SpeechToText;
  private screenCapture: ScreenCapture;
  private container: HTMLDivElement | null = null;
  private modal: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private isOpen = false;
  private isListening = false;
  private currentContext: TourContext | null = null;
  private shadowRoot: ShadowRoot;

  // Callback for when user wants to continue tour
  private onContinueTour: (() => void) | null = null;

  constructor(
    config: ConversationUIConfig,
    visionAI: VisionAI,
    voicePlayer: VoicePlayer,
    speechToText: SpeechToText,
    screenCapture: ScreenCapture,
    shadowRoot: ShadowRoot
  ) {
    this.config = config;
    this.visionAI = visionAI;
    this.voicePlayer = voicePlayer;
    this.speechToText = speechToText;
    this.screenCapture = screenCapture;
    this.shadowRoot = shadowRoot;

    this.createUI();
    this.setupSpeechRecognition();
  }

  /**
   * Create the conversation UI elements
   */
  private createUI(): void {
    // Create floating button
    this.button = document.createElement('button');
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>${this.config.buttonLabel}</span>
    `;
    this.button.style.cssText = this.getButtonStyles();
    this.button.onclick = () => this.open();

    // Create conversation modal
    this.modal = document.createElement('div');
    this.modal.style.cssText = this.getModalStyles();
    this.modal.innerHTML = this.getModalHTML();

    // Create container
    this.container = document.createElement('div');
    this.container.appendChild(this.button);
    this.container.appendChild(this.modal);

    // Append to shadow root
    this.shadowRoot.appendChild(this.container);

    // Setup modal interactions
    this.setupModalListeners();
  }

  /**
   * Get button styles based on position
   */
  private getButtonStyles(): string {
    const positions: Record<string, string> = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 80px; right: 20px;',
      'top-left': 'top: 80px; left: 20px;',
    };

    return `
      position: fixed;
      ${positions[this.config.buttonPosition]}
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: ${this.config.primaryColor};
      color: white;
      border: none;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      pointer-events: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
      z-index: 999999;
    `;
  }

  /**
   * Get modal HTML structure
   */
  private getModalHTML(): string {
    return `
      <div class="conversation-modal-content">
        <div class="conversation-header">
          <h3>${this.config.agentName}</h3>
          <button class="close-btn">&times;</button>
        </div>

        <div class="conversation-body">
          <div class="transcript"></div>
        </div>

        <div class="conversation-footer">
          <button class="action-btn mic-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span class="mic-text">Ask a Question</span>
          </button>
          <button class="action-btn continue-btn">Continue Tour</button>
        </div>
      </div>
    `;
  }

  /**
   * Get modal styles
   */
  private getModalStyles(): string {
    return `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 1000000;
    `;
  }

  /**
   * Setup modal interaction listeners
   */
  private setupModalListeners(): void {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // Microphone button
    const micBtn = this.modal.querySelector('.mic-btn');
    micBtn?.addEventListener('click', () => this.toggleListening());

    // Continue tour button
    const continueBtn = this.modal.querySelector('.continue-btn');
    continueBtn?.addEventListener('click', () => {
      this.close();
      if (this.onContinueTour) {
        this.onContinueTour();
      }
    });

    // Add styles to modal content
    const style = document.createElement('style');
    style.textContent = `
      .conversation-modal-content {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .conversation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
      }
      .conversation-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 28px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .conversation-body {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }
      .transcript {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .message {
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 85%;
      }
      .message.user {
        background: ${this.config.primaryColor};
        color: white;
        align-self: flex-end;
      }
      .message.ai {
        background: #f3f4f6;
        color: #111827;
        align-self: flex-start;
      }
      .message.system {
        background: #fef3c7;
        color: #92400e;
        align-self: center;
        text-align: center;
        font-size: 14px;
      }
      .conversation-footer {
        display: flex;
        gap: 12px;
        padding: 20px;
        border-top: 1px solid #e5e7eb;
      }
      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .mic-btn {
        background: ${this.config.primaryColor};
        color: white;
      }
      .mic-btn.listening {
        background: #ef4444;
        animation: pulse 1.5s infinite;
      }
      .continue-btn {
        background: #10b981;
        color: white;
      }
      .action-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  /**
   * Setup speech recognition handlers
   */
  private setupSpeechRecognition(): void {
    this.speechToText.onResult((transcript: string) => {
      this.addMessage('user', transcript);
      this.handleUserQuestion(transcript);
    });

    this.speechToText.onError((error: string) => {
      this.addMessage('system', `Speech recognition error: ${error}`);
      this.isListening = false;
      this.updateMicButton();
    });
  }

  /**
   * Add message to transcript
   */
  private addMessage(type: 'user' | 'ai' | 'system', text: string): void {
    const transcript = this.modal?.querySelector('.transcript');
    if (!transcript) return;

    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    transcript.appendChild(message);

    // Scroll to bottom
    transcript.scrollTop = transcript.scrollHeight;
  }

  /**
   * Handle user question
   */
  private async handleUserQuestion(question: string): Promise<void> {
    try {
      // Capture screen
      const screenshot = await this.screenCapture.capture();

      // Get AI response with vision
      const response = await this.visionAI.ask(
        screenshot,
        question,
        this.currentContext,
        this.config.agentPersonality
      );

      // Display AI response
      this.addMessage('ai', response.answer);

      // Speak response
      await this.voicePlayer.speak(response.answer);

    } catch (error) {
      console.error('[ConversationUI] Failed to get response:', error);
      this.addMessage('system', 'Sorry, I encountered an error. Please try again.');
    }
  }

  /**
   * Toggle speech recognition
   */
  private toggleListening(): void {
    if (this.isListening) {
      this.speechToText.stop();
      this.isListening = false;
    } else {
      this.addMessage('system', 'Listening... Ask your question now');
      this.speechToText.start();
      this.isListening = true;
    }
    this.updateMicButton();
  }

  /**
   * Update microphone button appearance
   */
  private updateMicButton(): void {
    const micBtn = this.modal?.querySelector('.mic-btn');
    const micText = this.modal?.querySelector('.mic-text');

    if (!micBtn || !micText) return;

    if (this.isListening) {
      micBtn.classList.add('listening');
      micText.textContent = 'Listening...';
    } else {
      micBtn.classList.remove('listening');
      micText.textContent = 'Ask a Question';
    }
  }

  /**
   * Open conversation modal
   */
  open(): void {
    if (!this.modal || !this.button) return;

    this.isOpen = true;
    this.modal.style.display = 'flex';
    this.button.style.display = 'none';

    // Add welcome message
    this.addMessage('ai', `Hi! I'm ${this.config.agentName}. How can I help you with this tour?`);
  }

  /**
   * Close conversation modal
   */
  close(): void {
    if (!this.modal || !this.button) return;

    this.isOpen = false;
    this.modal.style.display = 'none';
    this.button.style.display = 'flex';

    // Stop listening if active
    if (this.isListening) {
      this.speechToText.stop();
      this.isListening = false;
      this.updateMicButton();
    }

    // Clear transcript
    const transcript = this.modal.querySelector('.transcript');
    if (transcript) {
      transcript.innerHTML = '';
    }
  }

  /**
   * Show the engage button
   */
  show(): void {
    if (this.button) {
      this.button.style.display = 'flex';
    }
  }

  /**
   * Hide the engage button
   */
  hide(): void {
    if (this.button) {
      this.button.style.display = 'none';
    }
    if (this.isOpen) {
      this.close();
    }
  }

  /**
   * Update tour context
   */
  setContext(context: TourContext | null): void {
    this.currentContext = context;
  }

  /**
   * Set callback for continue tour
   */
  onContinue(callback: () => void): void {
    this.onContinueTour = callback;
  }

  /**
   * Destroy the UI
   */
  destroy(): void {
    if (this.container) {
      this.container.remove();
    }
  }
}

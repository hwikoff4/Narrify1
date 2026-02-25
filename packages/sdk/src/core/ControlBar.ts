/**
 * ControlBar
 * Floating toolbar with visual buttons for tour control
 */

import type { ThemeConfig } from '@narrify/shared';

export interface ControlBarConfig {
  theme: ThemeConfig;
}

export class ControlBar {
  private config: ControlBarConfig;
  private shadowRoot: ShadowRoot;
  private container: HTMLDivElement | null = null;

  // Button elements
  private playPauseBtn: HTMLButtonElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;
  private replayBtn: HTMLButtonElement | null = null;
  private exitBtn: HTMLButtonElement | null = null;
  private stepLabel: HTMLSpanElement | null = null;

  // Callbacks
  private onPlayPauseCb: (() => void) | null = null;
  private onNextCb: (() => void) | null = null;
  private onPreviousCb: (() => void) | null = null;
  private onReplayCb: (() => void) | null = null;
  private onExitCb: (() => void) | null = null;

  // State
  private playing = false;

  constructor(config: ControlBarConfig, shadowRoot: ShadowRoot) {
    this.config = config;
    this.shadowRoot = shadowRoot;
    this.createUI();
  }

  private createUI(): void {
    // Inject component styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'narrify-control-bar';
    this.container.style.display = 'none';

    // Previous button
    this.prevBtn = this.createButton('narrify-cb-btn', this.getSvgPrev(), 'Previous step');
    this.prevBtn.addEventListener('click', () => this.onPreviousCb?.());

    // Play/Pause button
    this.playPauseBtn = this.createButton('narrify-cb-btn narrify-cb-play', this.getSvgPlay(), 'Play/Pause');
    this.playPauseBtn.addEventListener('click', () => this.onPlayPauseCb?.());

    // Next button
    this.nextBtn = this.createButton('narrify-cb-btn', this.getSvgNext(), 'Next step');
    this.nextBtn.addEventListener('click', () => this.onNextCb?.());

    // Separator
    const sep1 = document.createElement('div');
    sep1.className = 'narrify-cb-sep';

    // Step label
    this.stepLabel = document.createElement('span');
    this.stepLabel.className = 'narrify-cb-label';
    this.stepLabel.textContent = 'Step 1 of 1';

    // Separator
    const sep2 = document.createElement('div');
    sep2.className = 'narrify-cb-sep';

    // Replay button
    this.replayBtn = this.createButton('narrify-cb-btn', this.getSvgReplay(), 'Replay tour');
    this.replayBtn.addEventListener('click', () => this.onReplayCb?.());

    // Exit button
    this.exitBtn = this.createButton('narrify-cb-btn narrify-cb-exit', this.getSvgExit(), 'Exit tour');
    this.exitBtn.addEventListener('click', () => this.onExitCb?.());

    // Assemble
    this.container.appendChild(this.prevBtn);
    this.container.appendChild(this.playPauseBtn);
    this.container.appendChild(this.nextBtn);
    this.container.appendChild(sep1);
    this.container.appendChild(this.stepLabel);
    this.container.appendChild(sep2);
    this.container.appendChild(this.replayBtn);
    this.container.appendChild(this.exitBtn);

    this.shadowRoot.appendChild(this.container);
  }

  private createButton(className: string, svgHTML: string, title: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = className;
    btn.innerHTML = svgHTML;
    btn.title = title;
    return btn;
  }

  private getStyles(): string {
    const { primary, accent, text } = this.config.theme;
    return `
      .narrify-control-bar {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(12px);
        padding: 8px 12px;
        border-radius: 999px;
        display: flex;
        gap: 4px;
        align-items: center;
        pointer-events: auto;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        z-index: 999999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .narrify-control-bar.visible {
        opacity: 1;
      }
      .narrify-cb-btn {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: ${text};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        padding: 0;
      }
      .narrify-cb-btn:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .narrify-cb-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .narrify-cb-btn:disabled:hover {
        background: transparent;
      }
      .narrify-cb-btn svg {
        width: 18px;
        height: 18px;
      }
      .narrify-cb-play {
        width: 40px;
        height: 40px;
        background: ${primary};
        border-radius: 50%;
      }
      .narrify-cb-play:hover {
        background: ${primary};
        opacity: 0.85;
      }
      .narrify-cb-play svg {
        width: 20px;
        height: 20px;
      }
      .narrify-cb-exit {
        color: #f87171;
      }
      .narrify-cb-exit:hover {
        background: rgba(248, 113, 113, 0.2);
      }
      .narrify-cb-sep {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        margin: 0 4px;
      }
      .narrify-cb-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        font-family: system-ui, -apple-system, sans-serif;
        white-space: nowrap;
        padding: 0 4px;
        user-select: none;
      }
    `;
  }

  // SVG Icons
  private getSvgPlay(): string {
    return `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6,4 20,12 6,20"/></svg>`;
  }

  private getSvgPause(): string {
    return `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/></svg>`;
  }

  private getSvgPrev(): string {
    return `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="18,4 8,12 18,20"/><rect x="6" y="4" width="2" height="16"/></svg>`;
  }

  private getSvgNext(): string {
    return `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6,4 16,12 6,20"/><rect x="16" y="4" width="2" height="16"/></svg>`;
  }

  private getSvgReplay(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`;
  }

  private getSvgExit(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  }

  show(): void {
    if (this.container) {
      this.container.style.display = 'flex';
      // Trigger fade in
      requestAnimationFrame(() => {
        this.container?.classList.add('visible');
      });
    }
  }

  hide(): void {
    if (this.container) {
      this.container.classList.remove('visible');
      setTimeout(() => {
        if (this.container) this.container.style.display = 'none';
      }, 300);
    }
  }

  update(state: { playing: boolean; stepIndex: number; totalSteps: number }): void {
    this.playing = state.playing;

    // Update play/pause icon
    if (this.playPauseBtn) {
      this.playPauseBtn.innerHTML = state.playing ? this.getSvgPause() : this.getSvgPlay();
      this.playPauseBtn.title = state.playing ? 'Pause' : 'Play';
    }

    // Update step label
    if (this.stepLabel) {
      this.stepLabel.textContent = `Step ${state.stepIndex + 1} of ${state.totalSteps}`;
    }

    // Disable prev on first step
    if (this.prevBtn) {
      this.prevBtn.disabled = state.stepIndex === 0;
    }

    // Disable next on last step
    if (this.nextBtn) {
      this.nextBtn.disabled = state.stepIndex >= state.totalSteps - 1;
    }
  }

  onPlayPause(cb: () => void): void {
    this.onPlayPauseCb = cb;
  }

  onNext(cb: () => void): void {
    this.onNextCb = cb;
  }

  onPrevious(cb: () => void): void {
    this.onPreviousCb = cb;
  }

  onReplay(cb: () => void): void {
    this.onReplayCb = cb;
  }

  onExit(cb: () => void): void {
    this.onExitCb = cb;
  }

  destroy(): void {
    if (this.container) {
      this.container.remove();
    }
  }
}

/**
 * ProgressBar
 * Thin progress bar showing tour completion with step dots and click-to-seek
 */

import type { ThemeConfig } from '@narrify/shared';

export interface ProgressBarOptions {
  position: 'top' | 'bottom';
  clickToSeek: boolean;
  theme: ThemeConfig;
}

export class ProgressBar {
  private config: ProgressBarOptions;
  private shadowRoot: ShadowRoot;
  private container: HTMLDivElement | null = null;
  private fill: HTMLDivElement | null = null;
  private dotsContainer: HTMLDivElement | null = null;

  // State
  private currentStep = 0;
  private totalSteps = 1;

  // Callbacks
  private onSeekCb: ((stepIndex: number) => void) | null = null;

  constructor(config: ProgressBarOptions, shadowRoot: ShadowRoot) {
    this.config = config;
    this.shadowRoot = shadowRoot;
    this.createUI();
  }

  private createUI(): void {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    // Create container
    this.container = document.createElement('div');
    this.container.className = `narrify-progress-bar narrify-progress-${this.config.position}`;
    this.container.style.display = 'none';

    // Track (background)
    const track = document.createElement('div');
    track.className = 'narrify-progress-track';

    // Fill (foreground)
    this.fill = document.createElement('div');
    this.fill.className = 'narrify-progress-fill';
    track.appendChild(this.fill);

    // Dots container
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.className = 'narrify-progress-dots';

    this.container.appendChild(track);
    this.container.appendChild(this.dotsContainer);

    // Click-to-seek on the track
    if (this.config.clickToSeek) {
      track.style.cursor = 'pointer';
      track.addEventListener('click', (e) => this.handleTrackClick(e, track));
    }

    this.shadowRoot.appendChild(this.container);
  }

  private handleTrackClick(e: MouseEvent, track: HTMLDivElement): void {
    if (!this.onSeekCb || this.totalSteps <= 0) return;

    const rect = track.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const stepIndex = Math.round(ratio * (this.totalSteps - 1));
    const clamped = Math.max(0, Math.min(this.totalSteps - 1, stepIndex));
    this.onSeekCb(clamped);
  }

  private getStyles(): string {
    const { primary } = this.config.theme;

    return `
      .narrify-progress-bar {
        position: fixed;
        left: 0;
        width: 100%;
        height: 16px;
        pointer-events: auto;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .narrify-progress-bar.visible {
        opacity: 1;
      }
      .narrify-progress-top {
        top: 0;
      }
      .narrify-progress-bottom {
        bottom: 0;
      }
      .narrify-progress-track {
        position: relative;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.15);
        overflow: visible;
      }
      .narrify-progress-fill {
        height: 100%;
        width: 0%;
        background: ${primary};
        border-radius: 0 2px 2px 0;
        transition: width 0.4s ease;
      }
      .narrify-progress-dots {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 16px;
        display: flex;
        align-items: center;
        pointer-events: none;
      }
      .narrify-progress-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: translateX(-50%);
        transition: background 0.3s ease, transform 0.3s ease;
        pointer-events: auto;
        cursor: pointer;
      }
      .narrify-progress-dot.active {
        background: ${primary};
        transform: translateX(-50%) scale(1.4);
      }
      .narrify-progress-dot.completed {
        background: ${primary};
      }
    `;
  }

  private renderDots(): void {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    for (let i = 0; i < this.totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = 'narrify-progress-dot';

      if (i === this.currentStep) {
        dot.classList.add('active');
      } else if (i < this.currentStep) {
        dot.classList.add('completed');
      }

      // Position dot along the bar
      const pct = this.totalSteps > 1
        ? (i / (this.totalSteps - 1)) * 100
        : 50;
      dot.style.left = `${pct}%`;

      // Click-to-seek on individual dots
      if (this.config.clickToSeek) {
        dot.addEventListener('click', () => this.onSeekCb?.(i));
      }

      this.dotsContainer.appendChild(dot);
    }
  }

  show(): void {
    if (this.container) {
      this.container.style.display = 'flex';
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

  update(stepIndex: number, totalSteps: number): void {
    this.currentStep = stepIndex;
    this.totalSteps = totalSteps;

    // Update fill width
    if (this.fill && totalSteps > 0) {
      const pct = ((stepIndex + 1) / totalSteps) * 100;
      this.fill.style.width = `${pct}%`;
    }

    // Re-render dots
    this.renderDots();
  }

  onSeek(cb: (stepIndex: number) => void): void {
    this.onSeekCb = cb;
  }

  destroy(): void {
    if (this.container) {
      this.container.remove();
    }
  }
}

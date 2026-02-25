/**
 * CaptionOverlay
 * Shows the current step's narration script as visible text captions
 */

import type { ThemeConfig } from '@narrify/shared';

export interface CaptionOverlayConfig {
  position: 'top' | 'bottom' | 'floating';
  fontSize: 'sm' | 'md' | 'lg';
  theme: ThemeConfig;
}

export class CaptionOverlay {
  private config: CaptionOverlayConfig;
  private shadowRoot: ShadowRoot;
  private container: HTMLDivElement | null = null;
  private titleEl: HTMLDivElement | null = null;
  private textEl: HTMLDivElement | null = null;
  private visible = true;

  constructor(config: CaptionOverlayConfig, shadowRoot: ShadowRoot) {
    this.config = config;
    this.shadowRoot = shadowRoot;
    this.createUI();
  }

  private createUI(): void {
    // Inject component styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    // Create caption container
    this.container = document.createElement('div');
    this.container.className = `narrify-caption-overlay narrify-caption-${this.config.position}`;
    this.container.style.display = 'none';

    // Title element
    this.titleEl = document.createElement('div');
    this.titleEl.className = 'narrify-caption-title';

    // Text element
    this.textEl = document.createElement('div');
    this.textEl.className = 'narrify-caption-text';

    this.container.appendChild(this.titleEl);
    this.container.appendChild(this.textEl);
    this.shadowRoot.appendChild(this.container);
  }

  private getStyles(): string {
    const { text, primary } = this.config.theme;
    const fontSizeMap = { sm: '14px', md: '18px', lg: '22px' };
    const titleSizeMap = { sm: '12px', md: '14px', lg: '16px' };
    const fontSize = fontSizeMap[this.config.fontSize];
    const titleSize = titleSizeMap[this.config.fontSize];

    return `
      .narrify-caption-overlay {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(12px);
        color: ${text};
        padding: 14px 28px;
        border-radius: 12px;
        max-width: 700px;
        width: max-content;
        text-align: center;
        pointer-events: auto;
        font-family: system-ui, -apple-system, sans-serif;
        z-index: 999999;
        opacity: 0;
        transition: opacity 0.35s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      }
      .narrify-caption-overlay.visible {
        opacity: 1;
      }
      .narrify-caption-top {
        top: 24px;
      }
      .narrify-caption-bottom {
        bottom: 80px;
      }
      .narrify-caption-floating {
        top: 50%;
        transform: translate(-50%, -50%);
      }
      .narrify-caption-title {
        font-size: ${titleSize};
        font-weight: 600;
        color: ${primary};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }
      .narrify-caption-title:empty {
        display: none;
      }
      .narrify-caption-text {
        font-size: ${fontSize};
        line-height: 1.5;
        color: ${text};
      }
    `;
  }

  show(title: string, text: string): void {
    if (!this.container || !this.visible) return;

    // Fade out, update, fade in
    this.container.classList.remove('visible');

    setTimeout(() => {
      if (!this.container || !this.titleEl || !this.textEl) return;

      this.titleEl.textContent = title;
      this.textEl.textContent = text;
      this.container.style.display = 'block';

      requestAnimationFrame(() => {
        this.container?.classList.add('visible');
      });
    }, 200);
  }

  hide(): void {
    if (!this.container) return;
    this.container.classList.remove('visible');
    setTimeout(() => {
      if (this.container) this.container.style.display = 'none';
    }, 350);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!visible) {
      this.hide();
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.remove();
    }
  }
}

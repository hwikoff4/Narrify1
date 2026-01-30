/**
 * SpotlightOverlay
 * Highlights elements during tour with animated spotlight effect
 */

import type { ThemeConfig } from '@narrify/shared';

export class SpotlightOverlay {
  private overlay: HTMLDivElement | null = null;
  private spotlight: HTMLDivElement | null = null;
  private theme: ThemeConfig;
  private currentElement: HTMLElement | null = null;

  constructor(theme: ThemeConfig) {
    this.theme = theme;
  }

  /**
   * Show overlay
   */
  show(): void {
    if (this.overlay) return;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'narrify-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.theme.background};
      z-index: 999998;
      pointer-events: none;
    `;

    // Create spotlight
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'narrify-spotlight';
    this.spotlight.style.cssText = `
      position: absolute;
      border: 3px solid ${this.theme.primary};
      border-radius: 8px;
      box-shadow: 0 0 0 9999px ${this.theme.background};
      pointer-events: none;
      transition: all 0.3s ease;
      opacity: 0;
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.spotlight);

    // Fade in
    setTimeout(() => {
      if (this.overlay) this.overlay.style.opacity = '1';
      if (this.spotlight) this.spotlight.style.opacity = '1';
    }, 10);
  }

  /**
   * Hide overlay
   */
  hide(): void {
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        if (this.overlay) {
          document.body.removeChild(this.overlay);
          this.overlay = null;
        }
      }, 300);
    }

    if (this.spotlight) {
      this.spotlight.style.opacity = '0';
      setTimeout(() => {
        if (this.spotlight) {
          document.body.removeChild(this.spotlight);
          this.spotlight = null;
        }
      }, 300);
    }

    this.currentElement = null;
  }

  /**
   * Highlight element
   */
  highlight(element: HTMLElement): void {
    if (!this.spotlight) return;

    this.currentElement = element;

    // Get element position
    const rect = element.getBoundingClientRect();
    const padding = 8;

    // Position spotlight
    this.spotlight.style.top = `${rect.top - padding}px`;
    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;

    // Scroll element into view if needed
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Update position after scroll
      setTimeout(() => {
        this.highlight(element);
      }, 300);
    }

    // Allow clicks on highlighted element
    this.spotlight.style.pointerEvents = 'none';
  }

  /**
   * Update spotlight position (for dynamic content)
   */
  updatePosition(): void {
    if (this.currentElement) {
      this.highlight(this.currentElement);
    }
  }

  /**
   * Destroy overlay
   */
  destroy(): void {
    this.hide();
  }
}

/**
 * HoverExplorer
 * Enables hover-to-explain mode for marked elements
 */

import type { HoverExploreConfig, ExplainableElement } from '@narrify/shared';
import type { VoicePlayer } from './VoicePlayer';
import type { VisionAI } from './VisionAI';

export class HoverExplorer {
  private config: HoverExploreConfig;
  private voicePlayer: VoicePlayer;
  private visionAI: VisionAI;
  private isActive: boolean = false;
  private currentTooltip: HTMLDivElement | null = null;
  private hoverTimeout: number | null = null;
  private explainableElements: Map<Element, ExplainableElement> = new Map();

  constructor(
    config: HoverExploreConfig,
    voicePlayer: VoicePlayer,
    visionAI: VisionAI
  ) {
    this.config = config;
    this.voicePlayer = voicePlayer;
    this.visionAI = visionAI;

    // Index explainable elements
    this.indexElements();
  }

  /**
   * Index all explainable elements on the page
   */
  private indexElements(): void {
    this.explainableElements.clear();

    if (this.config.markedElementsOnly) {
      // Find elements with marker attribute
      const markedElements = document.querySelectorAll(
        `[${this.config.markerAttribute}]`
      );

      markedElements.forEach(element => {
        const title = element.getAttribute(`${this.config.markerAttribute}-title`) || '';
        const explanation = element.getAttribute(`${this.config.markerAttribute}-hint`) || '';
        const priority = parseInt(element.getAttribute(`${this.config.markerAttribute}-priority`) || '0');

        this.explainableElements.set(element, {
          selector: this.getSelector(element),
          title,
          explanation,
          priority,
        });

        // Add visual indicator
        (element as HTMLElement).style.cursor = 'help';
        (element as HTMLElement).style.outline = '2px solid transparent';
        (element as HTMLElement).style.outlineOffset = '2px';
      });
    }

    // Also add configured elements
    if (this.config.elements) {
      this.config.elements.forEach(elementConfig => {
        const elements = document.querySelectorAll(elementConfig.selector);
        elements.forEach(element => {
          this.explainableElements.set(element, elementConfig);
          (element as HTMLElement).style.cursor = 'help';
        });
      });
    }
  }

  /**
   * Activate hover explore mode
   */
  activate(): void {
    if (this.isActive) return;

    this.isActive = true;

    // Re-index elements (in case DOM changed)
    this.indexElements();

    // Highlight all explainable elements
    this.explainableElements.forEach((_, element) => {
      (element as HTMLElement).style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
    });

    // Attach hover listeners
    this.explainableElements.forEach((config, element) => {
      element.addEventListener('mouseenter', this.handleMouseEnter.bind(this, element, config));
      element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    });
  }

  /**
   * Deactivate hover explore mode
   */
  deactivate(): void {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove highlights
    this.explainableElements.forEach((_, element) => {
      (element as HTMLElement).style.outline = '2px solid transparent';
    });

    // Remove hover listeners
    this.explainableElements.forEach((config, element) => {
      element.removeEventListener('mouseenter', this.handleMouseEnter.bind(this, element, config));
      element.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    });

    // Hide tooltip
    this.hideTooltip();
  }

  /**
   * Handle mouse enter
   */
  private handleMouseEnter(element: Element, config: ExplainableElement): void {
    // Clear any existing timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    // Set timeout before showing tooltip
    this.hoverTimeout = window.setTimeout(() => {
      this.showTooltip(element, config);
    }, this.config.triggerDelay);
  }

  /**
   * Handle mouse leave
   */
  private handleMouseLeave(): void {
    // Clear timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // Hide tooltip after a short delay
    setTimeout(() => {
      this.hideTooltip();
    }, 200);
  }

  /**
   * Show tooltip for element
   */
  private async showTooltip(element: Element, config: ExplainableElement): Promise<void> {
    // Create tooltip
    this.currentTooltip = document.createElement('div');
    this.currentTooltip.className = 'narrify-hover-tooltip';
    this.currentTooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 300px;
      z-index: 9999999;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    // Position tooltip
    const rect = element.getBoundingClientRect();
    this.currentTooltip.style.left = `${rect.left}px`;
    this.currentTooltip.style.top = `${rect.bottom + 8}px`;

    // Set content
    const title = config.title ? `<strong>${config.title}</strong><br>` : '';
    this.currentTooltip.innerHTML = `${title}${config.explanation || 'Loading...'}`;

    document.body.appendChild(this.currentTooltip);

    // Speak explanation if enabled
    if (this.config.speakOnHover && config.explanation) {
      this.voicePlayer.speak(config.explanation);
    }
  }

  /**
   * Hide tooltip
   */
  private hideTooltip(): void {
    if (this.currentTooltip) {
      document.body.removeChild(this.currentTooltip);
      this.currentTooltip = null;
    }

    // Stop speaking
    this.voicePlayer.stop();
  }

  /**
   * Get CSS selector for element
   */
  private getSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = Array.from(element.classList).join('.');
      return `.${classes}`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Refresh indexed elements (call when DOM changes)
   */
  refresh(): void {
    this.indexElements();
    if (this.isActive) {
      this.activate();
    }
  }

  /**
   * Get all explainable elements
   */
  getElements(): ExplainableElement[] {
    return Array.from(this.explainableElements.values());
  }

  /**
   * Destroy hover explorer
   */
  destroy(): void {
    this.deactivate();
    this.explainableElements.clear();
  }
}

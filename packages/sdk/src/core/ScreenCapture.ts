/**
 * ScreenCapture
 * Captures viewport screenshots for Vision AI
 */

import html2canvas from 'html2canvas';

export interface ScreenCaptureConfig {
  maxSize: number; // Max KB
}

export class ScreenCapture {
  private config: ScreenCaptureConfig;

  constructor(config: ScreenCaptureConfig) {
    this.config = config;
  }

  /**
   * Capture current viewport as base64 image
   */
  async captureViewport(): Promise<string> {
    try {
      const canvas = await html2canvas(document.body, {
        width: window.innerWidth,
        height: window.innerHeight,
        x: window.scrollX,
        y: window.scrollY,
        scale: 0.5, // Reduce size
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Convert to base64
      let quality = 0.7;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Reduce quality until size is under limit
      while (this.getBase64Size(dataUrl) > this.config.maxSize * 1024 && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      return dataUrl;
    } catch (error) {
      console.error('[ScreenCapture] Failed to capture viewport:', error);
      throw error;
    }
  }

  /**
   * Capture specific element
   */
  async captureElement(element: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(element, {
        scale: 0.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      let quality = 0.7;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Reduce quality until size is under limit
      while (this.getBase64Size(dataUrl) > this.config.maxSize * 1024 && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      return dataUrl;
    } catch (error) {
      console.error('[ScreenCapture] Failed to capture element:', error);
      throw error;
    }
  }

  /**
   * Get DOM structure as JSON (for additional context)
   */
  getDOMStructure(maxDepth: number = 3): any {
    const serializeNode = (node: Element, depth: number): any => {
      if (depth > maxDepth) return null;

      const obj: any = {
        tag: node.tagName.toLowerCase(),
        id: node.id || undefined,
        classes: node.className || undefined,
        text: node.textContent?.substring(0, 100) || undefined,
      };

      // Include data attributes that might be relevant
      Array.from(node.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
          obj[attr.name] = attr.value;
        }
      });

      // Recursively serialize children
      if (node.children.length > 0 && depth < maxDepth) {
        obj.children = Array.from(node.children)
          .slice(0, 10) // Limit children
          .map(child => serializeNode(child, depth + 1))
          .filter(Boolean);
      }

      return obj;
    };

    return serializeNode(document.body, 0);
  }

  /**
   * Get base64 size in bytes
   */
  private getBase64Size(base64: string): number {
    // Remove data URL prefix
    const base64String = base64.split(',')[1] || base64;
    // Calculate size (base64 is ~4/3 of binary size)
    return (base64String.length * 3) / 4;
  }
}

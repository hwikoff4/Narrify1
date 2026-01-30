/**
 * VisionAI
 * Interfaces with Claude Vision API for screen-aware conversation
 */

import type { AIRequest, AIResponse, TourContext } from '@narrify/shared';

export interface VisionAIConfig {
  apiKey: string;
  apiEndpoint?: string;
}

export class VisionAI {
  private config: VisionAIConfig;

  constructor(config: VisionAIConfig) {
    this.config = {
      apiEndpoint: '/api/narrify-ai',
      ...config,
    };
  }

  /**
   * Ask a question with visual context
   */
  async ask(
    screenshot: string,
    question: string,
    context: TourContext | null,
    systemPrompt: string,
    knowledgeBase?: string
  ): Promise<AIResponse> {
    try {
      const request: AIRequest = {
        screenshot,
        question,
        context: context!,
        systemPrompt,
        knowledgeBase,
      };

      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Narrify-Key': this.config.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[VisionAI] Failed to get response:', error);
      throw error;
    }
  }

  /**
   * Ask without visual context (text-only)
   */
  async askText(
    question: string,
    context: TourContext | null,
    systemPrompt: string,
    knowledgeBase?: string
  ): Promise<AIResponse> {
    try {
      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Narrify-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          screenshot: null,
          question,
          context,
          systemPrompt,
          knowledgeBase,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data: AIResponse = await response.json();
      return data;
    } catch (error) {
      console.error('[VisionAI] Failed to get response:', error);
      throw error;
    }
  }

  /**
   * Generate explanation for an element
   */
  async explainElement(
    screenshot: string,
    elementDescription: string,
    context: TourContext | null
  ): Promise<string> {
    const systemPrompt = 'You are explaining UI elements to users. Be concise and helpful.';
    const question = `What is this element and what does it do? ${elementDescription}`;

    const response = await this.ask(screenshot, question, context, systemPrompt);
    return response.answer;
  }

  /**
   * Locate an element on the screen using vision
   */
  async locateElement(
    screenshot: string,
    elementDescription: string,
    selectorHint?: string,
    tourContext?: {
      tourId: string;
      stepIndex: number;
      stepDescription: string;
    }
  ): Promise<ElementLocation> {
    try {
      const visionEndpoint = this.config.apiEndpoint!.replace('/narrify-ai', '/vision-locate');

      const response = await fetch(visionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Narrify-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          screenshot,
          elementDescription,
          selectorHint,
          tourContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vision locate API error: ${response.statusText}`);
      }

      const data: ElementLocation = await response.json();
      return data;
    } catch (error) {
      console.error('[VisionAI] Failed to locate element:', error);
      // Return fallback result with hint if available
      return {
        found: false,
        selector: selectorHint,
        confidence: selectorHint ? 0.5 : 0,
        fallbackToHint: !!selectorHint,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/validate`, {
        method: 'GET',
        headers: {
          'X-Narrify-Key': this.config.apiKey,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export interface ElementLocation {
  found: boolean;
  selector?: string;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  visualDescription?: string;
  fallbackToHint: boolean;
  error?: string;
}

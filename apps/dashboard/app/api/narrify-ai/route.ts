/**
 * Narrify AI API Route
 * Handles Claude Vision API calls for screen-aware conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { AIRequest, AIResponse } from '@narrify/shared';
import { createClient } from '@/lib/supabase/server';

interface ApiKeyData {
  id: string;
  active: boolean;
  client_id: string;
  usage_count: number;
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('X-Narrify-Key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      );
    }

    // Validate API key against database
    const supabase = await createClient();
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, active, client_id, usage_count')
      .eq('key', apiKey)
      .single();

    const apiKeyData = keyData as unknown as ApiKeyData | null;

    if (keyError || !apiKeyData || !apiKeyData.active) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      );
    }

    // Update API key usage
    const currentUsageCount = apiKeyData.usage_count || 0;
    const supabaseForUpdate = await createClient();
    await supabaseForUpdate
      .from('api_keys')
      // @ts-ignore - Supabase type inference may break after type assertion
      .update({
        usage_count: currentUsageCount + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', apiKeyData.id);

    // Parse request
    const body: AIRequest = await request.json();
    const { screenshot, question, context, systemPrompt, knowledgeBase } = body;

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    // Build context message
    let contextText = '';
    if (context) {
      contextText = `
Current screen context:
- Page: ${context.pageTitle}
- Feature: ${context.currentStep?.title}
- Step ${context.stepIndex + 1} of ${context.totalSteps}
`;
    }

    if (knowledgeBase) {
      contextText += `\n\nAdditional context:\n${knowledgeBase}`;
    }

    // Build message content
    const messageContent: any[] = [];

    // Add screenshot if provided
    if (screenshot) {
      const base64Data = screenshot.split(',')[1] || screenshot;
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Data,
        },
      });
    }

    // Add text
    messageContent.push({
      type: 'text',
      text: `${systemPrompt}

${contextText}

User's question: "${question}"

${screenshot ? 'Look at the screenshot and answer the user\'s question specifically about what they\'re seeing.' : 'Answer the user\'s question based on the context provided.'} Be concise, helpful, and specific.`,
    });

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    });

    // Extract answer
    const answer = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    const aiResponse: AIResponse = {
      answer,
      confidence: 0.9,
      sources: [],
    };

    return NextResponse.json(aiResponse);
  } catch (error: any) {
    console.error('[Narrify AI API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Validate API key endpoint
  const apiKey = request.headers.get('X-Narrify-Key');
  if (!apiKey) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  // Validate against database
  const supabase = await createClient();
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('id, active')
    .eq('key', apiKey)
    .single();

  const apiKeyData = keyData as unknown as { id: string; active: boolean } | null;

  if (keyError || !apiKeyData || !apiKeyData.active) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}

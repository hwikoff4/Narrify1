import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

interface VisionLocateRequest {
  screenshot: string;
  elementDescription: string;
  selectorHint?: string;
  tourContext?: {
    tourId: string;
    stepIndex: number;
    stepDescription: string;
  };
}

interface ApiKeyData {
  id: string;
  active: boolean;
  client_id: string;
  usage_count: number;
}

interface ElementLocation {
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

export async function POST(request: NextRequest) {
  try {
    // Validate API key from request header
    const apiKey = request.headers.get('X-Narrify-Key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required in X-Narrify-Key header' },
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
      // @ts-ignore - Supabase type inference may break after type assertion on line 57
      .update({
        usage_count: currentUsageCount + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', apiKeyData.id);

    const body: VisionLocateRequest = await request.json();
    const { screenshot, elementDescription, selectorHint, tourContext } = body;

    if (!screenshot || !elementDescription) {
      return NextResponse.json(
        { error: 'Screenshot and elementDescription are required' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    // Extract base64 data from screenshot
    const base64Data = screenshot.includes(',')
      ? screenshot.split(',')[1]
      : screenshot;

    // Construct vision prompt for element location
    const systemPrompt = `You are a vision AI that helps locate UI elements on web pages.
Your task is to analyze screenshots and precisely locate elements based on descriptions.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "found": true/false,
  "selector": "CSS selector string or null",
  "coordinates": {"x": number, "y": number, "width": number, "height": number} or null,
  "confidence": 0-1,
  "visualDescription": "what you see",
  "reasoning": "why you chose this element"
}

Do not include any explanatory text before or after the JSON. Only output the JSON object.`;

    const userPrompt = `Analyze this screenshot and locate the following element:
"${elementDescription}"

${selectorHint ? `The developer provided this CSS selector hint: ${selectorHint}` : ''}
${tourContext ? `Context: This is step ${tourContext.stepIndex + 1} of tour "${tourContext.tourId}". Step description: ${tourContext.stepDescription}` : ''}

Look for the element that best matches the description. Provide:
1. A CSS selector that uniquely identifies the element (use classes, IDs, data attributes, or structure)
2. The approximate coordinates (x, y, width, height in pixels from top-left)
3. Your confidence level (0-1)
4. A visual description of what you see

If you cannot find the element with high confidence, set found to false and explain why.`;

    // Call Claude Vision API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      system: systemPrompt,
    });

    // Extract response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse Claude's JSON response
    let result: ElementLocation;
    try {
      // Try to extract JSON from response (in case Claude adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      const parsed = JSON.parse(jsonStr);

      result = {
        found: parsed.found || false,
        selector: parsed.selector || selectorHint || undefined,
        coordinates: parsed.coordinates || undefined,
        confidence: parsed.confidence || 0,
        visualDescription: parsed.visualDescription || parsed.reasoning || undefined,
        fallbackToHint: !parsed.found && !!selectorHint,
      };
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      // Fallback to hint if vision parsing fails
      result = {
        found: false,
        selector: selectorHint,
        confidence: selectorHint ? 0.5 : 0,
        fallbackToHint: !!selectorHint,
        error: 'Vision parsing failed, using selector hint',
      };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Vision locate error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

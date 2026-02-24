/**
 * Analytics API Route
 * Accepts analytics events from the SDK and stores them in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ApiKeyData {
  id: string;
  active: boolean;
  client_id: string;
  usage_count: number;
}

interface AnalyticsEventBody {
  type: string;
  tourId?: string;
  stepId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
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
      // @ts-ignore - Supabase type inference may break after type assertion
      .update({
        usage_count: currentUsageCount + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', apiKeyData.id);

    // Parse request body
    const body: AnalyticsEventBody = await request.json();
    const { type, tourId, stepId, sessionId, metadata } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    // Insert analytics event
    const supabaseForInsert = await createClient();
    const { error: insertError } = await supabaseForInsert
      .from('analytics_events')
      // @ts-ignore - Supabase type inference
      .insert({
        client_id: apiKeyData.client_id,
        type,
        tour_id: tourId || null,
        step_id: stepId || null,
        session_id: sessionId || null,
        metadata: metadata || null,
        timestamp: new Date().toISOString(),
      });

    if (insertError) {
      console.error('[Analytics API] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to store analytics event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Narrify Voice API Route
 * Handles ElevenLabs TTS generation
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface VoiceRequest {
  text: string;
  voiceId: string;
  speed: number;
  language: string;
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

    // TODO: Validate API key against database
    // const isValid = await validateApiKey(apiKey);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    // }

    // Parse request
    const body: VoiceRequest = await request.json();
    const { text, voiceId, speed, language } = body;

    // Map language to ElevenLabs voice
    const elevenLabsVoiceId = getElevenLabsVoiceId(voiceId, language);

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();

    // Track usage
    // await trackApiUsage(apiKey, 'voice', text.length);

    // Return audio
    return new NextResponse(audioBlob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[Narrify Voice API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Map language and voice preference to ElevenLabs voice ID
 */
function getElevenLabsVoiceId(voiceId: string, language: string): string {
  // Use default voice for now
  // In production, map to client's preferred voice
  const defaultVoices: Record<string, string> = {
    'en': 'EXAVITQu4vr4xnSDxMaL', // Bella (English)
    'es': 'VR6AewLTigWG4xSOukaG', // Spanish voice
    'fr': 'ThT5KcBeYPX3keUQqHPh', // French voice
    'de': 'SOYHLrjzK2X1ezoPC6cr', // German voice
  };

  const lang = language.split('-')[0];
  return defaultVoices[lang] || defaultVoices['en'];
}

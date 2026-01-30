import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'demo-mode',
});

interface GenerateTourRequest {
  mode: 'url' | 'screenshots';
  url?: string;
  screenshots?: string[];
  contextText?: string;
  contextDocuments?: string[];
  tourName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { mode, url, screenshots, contextText, contextDocuments, tourName }: GenerateTourRequest = await req.json();

    if (mode === 'url' && !url) {
      return NextResponse.json(
        { error: 'URL is required for URL mode' },
        { status: 400 }
      );
    }

    if (mode === 'screenshots' && (!screenshots || screenshots.length === 0)) {
      return NextResponse.json(
        { error: 'At least one screenshot is required for screenshot mode' },
        { status: 400 }
      );
    }

    let prompt: string;
    let messageContent: any[];

    if (mode === 'url') {
      // URL Mode: Fetch and scrape the website
      console.log('Fetching URL:', url);
      const response = await fetch(url!, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NarrifyBot/1.0)',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${response.statusText}` },
          { status: 400 }
        );
      }

      const html = await response.text();

      prompt = `You are a UX expert creating an interactive product tour. Analyze this webpage HTML and generate a comprehensive onboarding tour.

WEBSITE HTML:
${html.substring(0, 50000)} ${html.length > 50000 ? '...(truncated)' : ''}

TASK:
Generate a tour with 4-8 steps that highlights the most important features and UI elements. For each step:
1. Find key interactive elements (buttons, forms, navigation, features)
2. Write a clear, concise title
3. Provide an accurate CSS selector (prefer IDs, then classes, then data attributes)
4. Write engaging narration script (2-3 sentences) explaining what the element does

RESPONSE FORMAT (JSON):
{
  "tourName": "${tourName || 'Generated Tour'}",
  "description": "Brief tour description",
  "pages": [{
    "url": "${url}",
    "title": "Page Title",
    "steps": [
      {
        "title": "Welcome",
        "selector": "#main-header",
        "script": "Welcome to our platform! Let me show you around and highlight the key features you'll use every day.",
        "position": "center"
      }
    ]
  }]
}

GUIDELINES:
- Use specific, working CSS selectors that exist in the HTML
- Keep narration conversational and helpful
- Focus on high-value features users need for onboarding
- Position: use "center" for welcome/overview, "top/bottom/left/right" for specific elements
- Ensure selectors are unique and won't select multiple elements

Return ONLY the JSON, no markdown formatting.`;

      messageContent = [{
        type: 'text',
        text: prompt,
      }];
    } else {
      // Screenshot Mode: Use Claude Vision API
      console.log('Analyzing screenshots with Claude Vision...');

      // Build additional context section
      let additionalContext = '';
      if (contextText || (contextDocuments && contextDocuments.length > 0)) {
        additionalContext = '\n\nADDITIONAL CONTEXT PROVIDED BY USER:\n';

        if (contextText) {
          additionalContext += `\nUser Description:\n${contextText}\n`;
        }

        if (contextDocuments && contextDocuments.length > 0) {
          additionalContext += '\nDocumentation:\n';
          contextDocuments.forEach((doc, index) => {
            additionalContext += `\nDocument ${index + 1}:\n${doc}\n`;
          });
        }

        additionalContext += '\nUse this context to better understand the software features and generate more accurate, helpful tour steps.\n';
      }

      prompt = `You are a UX expert creating an interactive product tour. Analyze these screenshots of a software application and generate a comprehensive onboarding tour.${additionalContext}

TASK:
Generate a tour with 4-8 steps that highlights the most important features and UI elements visible in the screenshots. For each step:
1. Identify key interactive elements (buttons, forms, navigation, features)
2. Write a clear, concise title
3. Provide a descriptive CSS selector (use generic selectors like .button, .nav-menu, #header, etc.)
4. Write engaging narration script (2-3 sentences) explaining what the element does and how users should interact with it

RESPONSE FORMAT (JSON):
{
  "tourName": "${tourName || 'Generated Tour'}",
  "description": "Brief tour description based on what you see",
  "pages": [{
    "url": "/",
    "title": "Main Screen",
    "steps": [
      {
        "title": "Welcome",
        "selector": "body",
        "script": "Welcome to the application! Let me show you around and highlight the key features you'll use every day.",
        "position": "center"
      }
    ]
  }]
}

GUIDELINES:
- Create generic but descriptive CSS selectors based on what you see in the screenshots
- Keep narration conversational and helpful
- Focus on high-value features users need for onboarding
- Position: use "center" for welcome/overview, "top/bottom/left/right" for specific elements
- Identify the most important UI elements visible across all screenshots
- If multiple screens are shown, organize steps in a logical flow
${contextText || (contextDocuments && contextDocuments.length > 0) ? '- Use the additional context provided to enhance your understanding and generate more accurate tour steps' : ''}

Return ONLY the JSON, no markdown formatting.`;

      messageContent = [
        {
          type: 'text',
          text: prompt,
        },
        ...screenshots!.map((screenshot) => {
          // Extract media type from data URL: data:image/png;base64,xxxxx
          const mediaTypeMatch = screenshot.match(/data:(image\/[^;]+);base64,/);
          const mediaType = (mediaTypeMatch ? mediaTypeMatch[1] : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

          return {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: mediaType,
              data: screenshot.split(',')[1], // Remove data:image/...;base64, prefix
            },
          };
        }),
      ];
    }

    console.log('Calling Claude API...');

    // Demo mode: return mock data if no API key
    if (process.env.ANTHROPIC_API_KEY === 'demo-mode' || !process.env.ANTHROPIC_API_KEY) {
      const mockTour = {
        tourName: tourName || 'Generated Tour',
        description: mode === 'url'
          ? 'An AI-generated tour of your website'
          : 'An AI-generated tour based on your screenshots',
        pages: [{
          url: mode === 'url' ? url : '/',
          title: mode === 'url' ? 'Homepage' : 'Main Screen',
          steps: [
            {
              title: 'Welcome',
              selector: 'body',
              script: mode === 'url'
                ? 'Welcome to this website! This tour will guide you through the key features and help you get started.'
                : 'Welcome to the application! This tour will guide you through the key features visible in your screenshots.',
              position: 'center',
            },
            {
              title: 'Main Navigation',
              selector: 'nav, header',
              script: 'Here\'s the main navigation menu. Use this to explore different sections of the ' + (mode === 'url' ? 'site' : 'application') + '.',
              position: 'top',
            },
            {
              title: 'Primary Action',
              selector: 'button, .btn, .button',
              script: 'This is a key action button. Click here to perform the main action on this page.',
              position: 'center',
            },
          ],
        }],
      };

      return NextResponse.json(mockTour);
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let tourData;
    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      tourData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse AI response');
    }

    return NextResponse.json(tourData);
  } catch (error: any) {
    console.error('Error generating tour:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate tour' },
      { status: 500 }
    );
  }
}

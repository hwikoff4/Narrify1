/**
 * API Key Validation Utilities
 *
 * Use these functions in your public API endpoints to validate API keys
 * and enforce domain restrictions.
 */

import { createClient } from '@/lib/supabase/client';

export interface ApiKeyValidationResult {
  valid: boolean;
  error?: string;
  clientId?: string;
  keyId?: string;
}

/**
 * Validates an API key and checks domain restrictions
 *
 * @param apiKey - The API key from the request
 * @param requestOrigin - The Origin header from the request (e.g., "https://example.com")
 * @returns Validation result with client ID if valid
 *
 * @example
 * ```typescript
 * // In your API route handler:
 * export async function GET(request: Request) {
 *   const apiKey = request.headers.get('X-API-Key');
 *   const origin = request.headers.get('Origin');
 *
 *   const validation = await validateApiKey(apiKey, origin);
 *   if (!validation.valid) {
 *     return new Response(validation.error, { status: 401 });
 *   }
 *
 *   // Continue with your API logic...
 * }
 * ```
 */
export async function validateApiKey(
  apiKey: string | null,
  requestOrigin: string | null
): Promise<ApiKeyValidationResult> {
  // Check if API key is provided
  if (!apiKey) {
    return {
      valid: false,
      error: 'API key is required. Please provide your API key in the X-API-Key header.',
    };
  }

  // Validate API key format
  if (!apiKey.startsWith('nr_live_')) {
    return {
      valid: false,
      error: 'Invalid API key format.',
    };
  }

  try {
    const supabase = createClient();

    // Look up the API key in the database
    const { data: keyData, error } = await supabase
      .from('api_keys')
      .select('id, client_id, active, domains, usage_count, usage_limit')
      .eq('key', apiKey)
      .single();

    if (error || !keyData) {
      return {
        valid: false,
        error: 'Invalid API key.',
      };
    }

    // Check if key is active
    if (!keyData.active) {
      return {
        valid: false,
        error: 'This API key has been deactivated.',
      };
    }

    // Check usage limits
    if (keyData.usage_limit && keyData.usage_count >= keyData.usage_limit) {
      return {
        valid: false,
        error: 'API key usage limit exceeded.',
      };
    }

    // Check domain restrictions (if domains are configured)
    if (keyData.domains && keyData.domains.length > 0) {
      if (!requestOrigin) {
        return {
          valid: false,
          error: 'Domain restriction enabled but no Origin header provided.',
        };
      }

      // Extract domain from origin (remove protocol and port)
      const originDomain = extractDomain(requestOrigin);

      // Check if the origin domain matches any allowed domain
      const domainMatches = keyData.domains.some((allowedDomain: string) => {
        return matchesDomain(originDomain, allowedDomain);
      });

      if (!domainMatches) {
        return {
          valid: false,
          error: `This API key is restricted to specific domains. Current origin: ${originDomain}`,
        };
      }
    }

    // Update last_used_at and increment usage_count
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: (keyData.usage_count || 0) + 1,
      })
      .eq('id', keyData.id);

    return {
      valid: true,
      clientId: keyData.client_id,
      keyId: keyData.id,
    };
  } catch (err) {
    console.error('API key validation error:', err);
    return {
      valid: false,
      error: 'An error occurred while validating the API key.',
    };
  }
}

/**
 * Extracts domain from a full URL or origin
 * @example
 * extractDomain("https://example.com:8080") // returns "example.com"
 * extractDomain("http://subdomain.example.com") // returns "subdomain.example.com"
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    // If URL parsing fails, try to extract domain manually
    return url.replace(/^https?:\/\//, '').split(':')[0].split('/')[0];
  }
}

/**
 * Checks if a request domain matches an allowed domain pattern
 * Supports exact matches and subdomain matching
 *
 * @example
 * matchesDomain("example.com", "example.com") // true
 * matchesDomain("subdomain.example.com", "example.com") // true
 * matchesDomain("example.com", "subdomain.example.com") // false
 * matchesDomain("other.com", "example.com") // false
 */
function matchesDomain(requestDomain: string, allowedDomain: string): boolean {
  // Exact match
  if (requestDomain === allowedDomain) {
    return true;
  }

  // Check if requestDomain is a subdomain of allowedDomain
  if (requestDomain.endsWith('.' + allowedDomain)) {
    return true;
  }

  return false;
}

/**
 * Middleware helper for Next.js API routes
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const apiKey = request.headers.get('X-API-Key');
 *   const origin = request.headers.get('Origin');
 *
 *   const validation = await validateApiKey(apiKey, origin);
 *   if (!validation.valid) {
 *     return apiKeyErrorResponse(validation.error);
 *   }
 *
 *   // Your API logic here...
 * }
 * ```
 */
export function apiKeyErrorResponse(error?: string): Response {
  return new Response(
    JSON.stringify({
      error: error || 'Unauthorized',
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

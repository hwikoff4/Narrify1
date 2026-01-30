# API Key Security Implementation Guide

## Overview

This guide explains how Narrify's client-side API keys work and how to implement domain validation in your public API endpoints.

## Why Client-Side API Keys Are Safe

Your API keys are designed to be embedded in client-side code (like the `<script>` tag in your website). This is safe because:

1. **Read-Only Access**: API keys only grant permission to:
   - Fetch published tours
   - Track analytics/usage stats
   - No ability to create, edit, or delete content

2. **Scoped Access**: Each API key is scoped to a single client account
   - Cannot access other clients' data
   - Cannot modify account settings
   - Cannot access billing information

3. **Domain Restrictions**: Keys can be restricted to specific domains
   - Prevents unauthorized use on other websites
   - Automatically validated on every request

4. **Usage Tracking**: All API key usage is logged
   - Monitor the "Last Used" date
   - Track request counts
   - Detect suspicious patterns

## How to Implement API Key Validation

When you create public API endpoints (for the embed code to use), you should validate API keys using the provided utility functions.

### Step 1: Import the Validation Function

```typescript
import { validateApiKey, apiKeyErrorResponse } from '@/lib/api-key-validation';
```

### Step 2: Add Validation to Your API Route

```typescript
// Example: app/api/tours/route.ts
export async function GET(request: Request) {
  // Extract API key and origin from request
  const apiKey = request.headers.get('X-API-Key');
  const origin = request.headers.get('Origin');

  // Validate the API key
  const validation = await validateApiKey(apiKey, origin);

  if (!validation.valid) {
    return apiKeyErrorResponse(validation.error);
  }

  // validation.clientId contains the authenticated client's ID
  const clientId = validation.clientId;

  // Continue with your API logic...
  // Only return tours that belong to this client
  const tours = await getToursByClientId(clientId);

  return new Response(JSON.stringify(tours), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
    },
  });
}
```

### Step 3: Handle CORS Preflight Requests

For browser-based requests, you'll need to handle OPTIONS requests:

```typescript
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

## What the Validation Function Does

The `validateApiKey()` function:

1. ✅ Checks if API key is provided
2. ✅ Validates API key format (must start with `nr_live_`)
3. ✅ Looks up the key in the database
4. ✅ Verifies the key is active (not deactivated)
5. ✅ Checks usage limits (if configured)
6. ✅ Validates domain restrictions (if configured)
7. ✅ Updates `last_used_at` timestamp
8. ✅ Increments `usage_count`
9. ✅ Returns the client ID for scoping data access

## Domain Validation Details

### How Domain Matching Works

- **Exact Match**: `example.com` matches `example.com`
- **Subdomain Match**: `subdomain.example.com` matches if `example.com` is allowed
- **No Reverse Match**: If `subdomain.example.com` is allowed, `example.com` will NOT match

### Example Domain Configurations

```typescript
// Allow only one domain
domains: ["example.com"]
// Matches: example.com, www.example.com, api.example.com
// Does NOT match: other.com

// Allow multiple domains
domains: ["example.com", "staging.example.com", "localhost"]
// Matches all three domains and their subdomains

// Allow localhost for development
domains: ["example.com", "localhost"]
// Matches: example.com, www.example.com, localhost:3000
```

### Empty Domain List

If `domains` is empty or null:
- The API key will work from ANY domain
- Less secure, but useful for testing
- Users are warned in the UI when no domains are configured

## Security Best Practices

### For API Implementation:

1. **Always Validate Origin**: Check the `Origin` header when domains are configured
2. **Use HTTPS in Production**: Require HTTPS for all API requests
3. **Implement Rate Limiting**: Prevent abuse even with valid keys
4. **Log Suspicious Activity**: Track and alert on unusual patterns
5. **Scope Data Access**: Always filter data by `clientId` from validation result

### For Users:

1. **Configure Domains**: Add domain whitelist for each key
2. **Deactivate Unused Keys**: Turn off keys you're not using
3. **Delete Old Keys**: Remove keys when no longer needed
4. **Monitor Last Used**: Check for unexpected usage
5. **Rotate Keys Regularly**: Generate new keys periodically

## Example: Complete API Endpoint

```typescript
// app/api/public/tours/route.ts
import { validateApiKey, apiKeyErrorResponse } from '@/lib/api-key-validation';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
  // Step 1: Validate API key
  const apiKey = request.headers.get('X-API-Key');
  const origin = request.headers.get('Origin');

  const validation = await validateApiKey(apiKey, origin);
  if (!validation.valid) {
    return apiKeyErrorResponse(validation.error);
  }

  // Step 2: Fetch data scoped to this client
  const supabase = createClient();
  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .eq('client_id', validation.clientId)
    .eq('published', true); // Only return published tours

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch tours' }),
      { status: 500 }
    );
  }

  // Step 3: Return response with CORS headers
  return new Response(JSON.stringify(tours), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

## Testing

### Test with curl:

```bash
# Valid request
curl -H "X-API-Key: nr_live_your_key_here" \
     -H "Origin: https://example.com" \
     https://your-api.com/api/public/tours

# Invalid key
curl -H "X-API-Key: invalid_key" \
     https://your-api.com/api/public/tours

# Wrong domain (if domain restrictions are enabled)
curl -H "X-API-Key: nr_live_your_key_here" \
     -H "Origin: https://wrong-domain.com" \
     https://your-api.com/api/public/tours
```

### Test in Browser Console:

```javascript
fetch('https://your-api.com/api/public/tours', {
  headers: {
    'X-API-Key': 'nr_live_your_key_here'
  }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Troubleshooting

### "Domain restriction enabled but no Origin header provided"
- The API key has domains configured but the request didn't include an Origin header
- This can happen with server-to-server requests
- Solution: Either remove domain restrictions or include Origin header

### "This API key is restricted to specific domains"
- The Origin header doesn't match any allowed domains
- Solution: Add the requesting domain to the key's whitelist

### "This API key has been deactivated"
- The key was manually deactivated in the dashboard
- Solution: Reactivate the key or generate a new one

### "API key usage limit exceeded"
- The key has hit its usage limit
- Solution: Increase the limit or generate a new key

## Questions?

If you have questions about API key security or implementation, please contact support@narrify.io

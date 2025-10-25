# Developer Guide: Solid Pods Integration

## Architecture

```
┌─────────────────────────────────────────┐
│          Vue 3 Components               │
│  (Dashboard, Profile, Bookmarks, etc.)  │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│        Pinia Store (Session)            │
│     (Reactive State Management)         │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Service Layer                   │
│  solidAuth | solidProfile | solid...    │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│      @inrupt/solid-client               │
│   (Pod Communication via HTTPS)         │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         User's Solid Pod                │
│     (RDF/Turtle Data Storage)           │
└─────────────────────────────────────────┘
```

## Core Services

### 1. Authentication (`solidAuth.ts`)

```typescript
import { solidAuth } from '@/services/solidAuth'

// Login
await solidAuth.login('https://solidcommunity.net')

// Check status
if (solidAuth.isLoggedIn()) {
  const webId = solidAuth.getWebId()
}

// Logout
await solidAuth.logout()
```

### 2. Profile (`solidProfile.ts`)

```typescript
import { solidProfile } from '@/services/solidProfile'

// Get profile
const profile = await solidProfile.getProfile()

// Save profile
await solidProfile.saveProfile({
  name: 'Alice',
  bio: 'Developer',
  interests: ['coding', 'music']
})
```

### 3. Bookmarks (`solidBookmarks.ts`)

```typescript
import { solidBookmarks } from '@/services/solidBookmarks'

// Get all
const bookmarks = await solidBookmarks.getBookmarks()

// Add
await solidBookmarks.addBookmark({
  title: 'Example',
  url: 'https://example.com'
})

// Export/Import
const json = await solidBookmarks.exportToJSON()
await solidBookmarks.importFromJSON(json)
```

### 4. Auto-Sync (`solidAutoSync.ts`)

```typescript
import { solidAutoSync } from '@/services/solidAutoSync'

// Start auto-sync (30s interval)
solidAutoSync.start()

// Stop
solidAutoSync.stop()

// Manual sync
await solidAutoSync.syncAll()

// Configure
solidAutoSync.setConfig({
  enabled: true,
  interval: 60000, // 1 minute
  direction: 'bidirectional'
})
```

## Error Handling

All services use `executeSolidOperation` with:
- Automatic retry (3x with exponential backoff)
- Timeout protection (30s default)
- Error classification
- Circuit breaker pattern

```typescript
import { executeSolidOperation } from '@/utils/solidErrorHandler'

const result = await executeSolidOperation(
  async () => {
    // Your Solid operation
  },
  {
    operationName: 'My Operation',
    retryConfig: { maxRetries: 3 },
    timeoutMs: 15000
  }
)
```

## Data Format

### Pod Structure

```
https://alice.solidcommunity.net/
├── profile/
│   └── card#me (WebID)
└── toplocs/
    ├── bookmarks (RDF dataset)
    ├── settings (RDF dataset)
    └── avatar.png
```

### RDF/Turtle Example

```turtle
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix vcard: <http://www.w3.org/2006/vcard/ns#> .

<#me>
    foaf:name "Alice" ;
    vcard:note "Developer" ;
    foaf:topic_interest <https://schema.org/coding> .
```

## Testing

### Unit Tests

```typescript
// tests/unit/solidAuth.test.ts
import { describe, it, expect } from 'vitest'
import { solidAuth } from '@/services/solidAuth'

describe('solidAuth', () => {
  it('validates provider URL', () => {
    // Test implementation
  })
})
```

### E2E Tests

```typescript
// tests/e2e/solid-login.spec.ts
import { test, expect } from '@playwright/test'

test('full login flow', async ({ page }) => {
  await page.goto('/solid-dashboard.html')
  await page.click('text=Login')
  // ... test steps
})
```

## Security Best Practices

1. **Always validate URLs**:
```typescript
import { validatePodUrl } from '@/utils/solidUrlValidator'

const result = validatePodUrl(userInput)
if (!result.valid) throw new Error(result.error)
```

2. **Use CSP headers** (see `docs/solid-security.md`)

3. **Never store tokens in localStorage**

4. **Validate all user input**

## Performance

### Bundle Size
- Core services: ~3 KB gz
- @inrupt/solid-client: ~45 KB gz
- Total Solid module: ~48 KB gz

### Optimization
```typescript
// Lazy load Solid modules
const solidModule = () => import('@/services/solidAuth')

// Code splitting in Vite
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'solid': ['@inrupt/solid-client']
        }
      }
    }
  }
}
```

## Deployment

### Environment Variables

```env
VITE_SOLID_DEFAULT_PROVIDER=https://solidcommunity.net
VITE_SOLID_CLIENT_NAME=TopLocs News Plugin
```

### Production Checklist

- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] URL validation enabled
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Security audit completed

## Resources

- [Solid Specification](https://solidproject.org/TR/protocol)
- [@inrupt/solid-client Docs](https://docs.inrupt.com/developer-tools/javascript/client-libraries/)
- [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer)

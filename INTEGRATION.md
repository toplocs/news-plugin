# TopLocs News Plugin - Integration Guide

## Quick Start

### 1. Load Plugin in TopLocs Core

```typescript
// In TopLocs main app
import { loadRemote } from '@module-federation/runtime'

const newsPlugin = await loadRemote('news-plugin/PluginConfig')

// Register plugin
app.use(newsPlugin.default)
```

### 2. Add Plugin Route

```typescript
// router/index.ts
{
  path: '/news',
  component: () => loadRemote('news-plugin/NewsLayout'),
  meta: { requiresAuth: false }
}
```

### 3. Configure Module Federation

```typescript
// vite.config.ts in TopLocs Core
federation({
  name: 'toplocs-core',
  remotes: {
    'news-plugin': 'https://toplocs.github.io/news-plugin/plugin.js'
  },
  shared: ['vue', 'vue-router']
})
```

---

## Gun.js Integration

### Shared P2P Network

```typescript
// Both Core and Plugin use same Gun instance
import Gun from 'gun'

const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gun-us.herokuapp.com/gun'
  ]
})

// Plugin namespace
gun.get('news_plugin')
  .get('articles') // Articles
  .get('chats')    // Chat messages
  .get('users')    // User profiles
```

---

## State Management

### Plugin Store Integration

```typescript
// In TopLocs Core, access plugin store
import { useNewsStore } from 'news-plugin'

const newsStore = useNewsStore()
console.log(newsStore.articles)
```

### Parent → Plugin Communication

```typescript
// Emit event from core
window.dispatchEvent(new CustomEvent('toplocs:user-login', {
  detail: { userId: '123', token: 'abc' }
}))

// Listen in plugin
window.addEventListener('toplocs:user-login', (event) => {
  console.log('User logged in:', event.detail)
})
```

---

## Authentication Integration

### Pass User Context

```typescript
// In TopLocs Core
<NewsPlugin :current-user-id="currentUser.id" />

// Plugin receives and uses
const props = defineProps<{
  currentUserId: string
}>()
```

---

## Deployment Instructions

### Deploy to GitHub Pages

```bash
# 1. Commit changes
git add .
git commit -m "Phase 3: Production ready"

# 2. Push to main (triggers GitHub Actions)
git push origin main

# 3. Enable GitHub Pages
# Go to: Settings → Pages → Source: gh-pages branch

# 4. URL will be: https://toplocs.github.io/news-plugin
```

### Manual Deploy

```bash
pnpm build
pnpm gh-pages -d dist
```

---

## Testing Integration

### Local Test

```bash
# Terminal 1: TopLocs Core
cd ../tribelike
pnpm dev  # Runs on :3000

# Terminal 2: News Plugin
cd news-plugin
pnpm dev  # Runs on :5174

# Test Module Federation locally
```

### Production Test

```bash
# Point Core to production plugin
remotes: {
  'news-plugin': 'https://toplocs.github.io/news-plugin/plugin.js'
}
```

---

## Troubleshooting

### Plugin Not Loading

```javascript
// Check Module Federation config
console.log(__FEDERATION__)

// Check Gun.js connection
gun.on('hi', peer => console.log('Connected:', peer))
```

### State Not Syncing

```javascript
// Verify Gun.js subscription
gun.get('news_plugin').on(data => {
  console.log('Gun data:', data)
})
```

### CORS Issues

```javascript
// Ensure proper headers in production
headers: {
  'Access-Control-Allow-Origin': '*',
  'Cross-Origin-Embedder-Policy': 'require-corp'
}
```

---

## Production Checklist

- [ ] GitHub Actions workflow enabled
- [ ] Environment variables configured
- [ ] Production build tested
- [ ] Plugin URL accessible
- [ ] Module Federation working
- [ ] Gun.js peers reachable
- [ ] Performance metrics met
- [ ] Documentation updated

---

**Status:** ✅ Ready for Production

**Deployed URL:** https://toplocs.github.io/news-plugin/
**Plugin Entry:** https://toplocs.github.io/news-plugin/plugin.js

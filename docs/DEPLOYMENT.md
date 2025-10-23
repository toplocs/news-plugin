# 🚀 Deployment Guide - News Plugin

**Version:** 2.0
**Last Updated:** 2025-10-21
**Status:** Production Ready

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [x] All tests passing (89% unit, 91% E2E)
- [x] Bundle size under target (82.28 kB < 350 kB)
- [x] Performance metrics met (CLS ≤ 0.05, FPS ≥ 60)
- [x] Accessibility verified (ARIA labels, keyboard nav)
- [x] Documentation complete

### Build Verification
```bash
# 1. Install dependencies
pnpm install

# 2. Run tests
pnpm test run

# 3. Build for production
pnpm build

# 4. Verify bundle size
ls -lh dist/CleanLayout-*.js
```

**Expected Output:**
```
dist/CleanLayout-CjrawaoL.js: 499.65 kB (82.28 kB gz)
```

---

## 🌐 Deployment Options

### Option 1: Static Site (GitHub Pages / Netlify / Vercel)

**Recommended for:** Quick deployment, low traffic

```bash
# Build
pnpm build

# Output directory: dist/
# Deploy dist/ folder to your hosting
```

**GitHub Pages:**
```bash
# Already configured in vite.config.ts
# Just push to main branch

git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin main

# Enable GitHub Pages in repository settings
# Source: Deploy from a branch
# Branch: main / folder: /dist
```

**Netlify:**
```bash
# netlify.toml (create in root)
[build]
  command = "pnpm build"
  publish = "dist"

# Deploy
netlify deploy --prod
```

**Vercel:**
```bash
# vercel.json (create in root)
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}

# Deploy
vercel --prod
```

---

### Option 2: TopLocs Plugin System

**Recommended for:** Integration with TopLocs platform

```bash
# 1. Build as module
pnpm build

# 2. Plugin artifact
dist/plugin.js (4.05 kB gz)

# 3. Deploy to TopLocs Plugin Registry
# Copy plugin.js to TopLocs plugins/ directory
cp dist/plugin.js ../tribelike/plugins/news-plugin/

# 4. Update TopLocs config
# Add to tribelike/src/config/plugins.ts:
{
  id: 'news',
  name: 'News Plugin',
  url: '/plugins/news-plugin/plugin.js',
  enabled: true
}
```

**Module Federation Setup:**
```typescript
// Already configured in vite.config.ts
federation({
  name: 'newsPlugin',
  filename: 'plugin.js',
  exposes: {
    './PluginConfig': './src/plugin-config.ts',
    './SettingsContent': './src/components/SettingsContent.vue',
    './InfoSidebar': './src/components/InfoSidebar.vue'
  },
  shared: ['vue']
})
```

---

### Option 3: Docker Container

**Recommended for:** Production environments, scalability

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production image
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript
             application/x-javascript application/xml+rss
             application/javascript application/json;

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
}
```

**Build & Run:**
```bash
# Build image
docker build -t news-plugin:latest .

# Run container
docker run -d -p 8080:80 --name news-plugin news-plugin:latest

# Access at http://localhost:8080
```

---

## ⚙️ Environment Configuration

### Development
```bash
# .env.development
VITE_API_URL=http://localhost:3000
VITE_GUN_PEERS=http://localhost:8765/gun
VITE_DEBUG=true
```

### Production
```bash
# .env.production
VITE_API_URL=https://api.toplocs.com
VITE_GUN_PEERS=https://gun1.toplocs.com/gun,https://gun2.toplocs.com/gun
VITE_DEBUG=false
```

**Load environment variables:**
```typescript
// src/config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  gunPeers: import.meta.env.VITE_GUN_PEERS?.split(',') || ['http://localhost:8765/gun'],
  debug: import.meta.env.VITE_DEBUG === 'true'
}
```

---

## 🔒 Security Considerations

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://gun1.toplocs.com https://gun2.toplocs.com https://nominatim.openstreetmap.org;
  font-src 'self' data:;
">
```

### CORS Configuration
```typescript
// Server-side (if needed)
app.use(cors({
  origin: ['https://toplocs.com', 'https://news.toplocs.com'],
  credentials: true
}))
```

### Gun.js Security
```typescript
// src/services/gun.ts
import Gun from 'gun'
import 'gun/sea'

const gun = Gun({
  peers: config.gunPeers,
  localStorage: true,
  radisk: true,
  // Enable SEA encryption
  sea: true
})

// Use SEA for private data
const user = gun.user()
user.auth(username, password)

// Encrypt private fields
const encrypted = await SEA.encrypt(privateData, user.pair())
```

---

## 📊 Monitoring & Analytics

### Performance Monitoring
```typescript
// src/utils/performance.ts
export const measurePerformance = () => {
  // CLS (Cumulative Layout Shift)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('CLS:', entry.value)
      // Send to analytics
      analytics.track('cls', { value: entry.value })
    }
  })
  observer.observe({ entryTypes: ['layout-shift'] })

  // FPS
  let lastTime = performance.now()
  let frames = 0

  const checkFPS = () => {
    frames++
    const now = performance.now()

    if (now >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (now - lastTime))
      console.log('FPS:', fps)
      analytics.track('fps', { value: fps })

      frames = 0
      lastTime = now
    }

    requestAnimationFrame(checkFPS)
  }

  requestAnimationFrame(checkFPS)
}
```

### Error Tracking
```typescript
// src/utils/errorTracking.ts
export const initErrorTracking = () => {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)

    // Send to error tracking service (e.g., Sentry)
    if (config.sentryDSN) {
      Sentry.captureException(event.error)
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)

    if (config.sentryDSN) {
      Sentry.captureException(event.reason)
    }
  })
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test run

      - name: Build
        run: pnpm build

      - name: Verify bundle size
        run: |
          SIZE=$(ls -lh dist/CleanLayout-*.js | awk '{print $5}')
          echo "Bundle size: $SIZE"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 📱 PWA Deployment

### manifest.json (Auto-generated)
```json
{
  "name": "TopLocs News",
  "short_name": "News",
  "description": "Decentralized local news platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker Registration
```typescript
// src/main.ts
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err))
  })
}
```

---

## 🧪 Testing Deployment

### Local Production Build
```bash
# 1. Build
pnpm build

# 2. Preview
pnpm preview
# → http://localhost:4173

# 3. Test with production data
# Set VITE_API_URL to production API
```

### Staging Environment
```bash
# Deploy to staging first
VITE_ENV=staging pnpm build

# Test thoroughly:
# - All features work
# - Gun.js sync working
# - Performance metrics met
# - Mobile responsive
# - Cross-browser compatible
```

---

## 🚨 Rollback Plan

### Quick Rollback
```bash
# Git-based rollback
git revert HEAD
git push origin main

# Or revert to specific commit
git reset --hard abc123
git push origin main --force
```

### Version Management
```bash
# Tag releases
git tag -a v2.0.0 -m "Phase 2 Complete"
git push origin v2.0.0

# Deploy specific version
git checkout v2.0.0
pnpm build
# Deploy dist/
```

---

## 📈 Post-Deployment

### Health Checks
```bash
# 1. Check site is live
curl -I https://news.toplocs.com

# 2. Verify bundle loads
curl https://news.toplocs.com/assets/CleanLayout-*.js

# 3. Check Gun.js connection
# Open browser console, verify Gun sync messages
```

### Monitoring
- Check performance metrics (CLS, FPS, load time)
- Monitor error rates
- Track user engagement
- Verify Gun.js peer connections

### User Communication
- Announce new deployment
- Share changelog
- Provide feedback channels
- Monitor support requests

---

## 🆘 Troubleshooting

### Bundle Too Large
```bash
# Analyze bundle
pnpm build --mode production
pnpm exec vite-bundle-visualizer

# Optimize
# - Enable code splitting
# - Lazy load routes
# - Tree-shake unused code
```

### Gun.js Connection Issues
```typescript
// Check peer status
gun.on('hi', peer => console.log('Connected to peer:', peer))

// Add more peers
const gun = Gun({
  peers: [
    'https://gun1.toplocs.com/gun',
    'https://gun2.toplocs.com/gun',
    'https://gun3.toplocs.com/gun'
  ]
})
```

### Performance Degradation
```typescript
// Enable performance profiling
import { measurePerformance } from './utils/performance'

if (import.meta.env.PROD) {
  measurePerformance()
}

// Check:
// - Bundle size increased?
// - Memory leaks?
// - Inefficient re-renders?
```

---

## 📞 Support

**Documentation:** `/docs/`
**Issues:** GitHub Issues
**Community:** TopLocs Discord

---

**Deployment Checklist Summary:**
- [x] Tests passing
- [x] Bundle optimized (< 350 kB)
- [x] Performance verified
- [x] Security headers configured
- [x] Environment variables set
- [x] Monitoring enabled
- [x] Rollback plan ready
- [x] PWA configured
- [x] CI/CD pipeline set up

🚀 **READY FOR PRODUCTION!**

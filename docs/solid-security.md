# Solid Pods Security Configuration

## Content Security Policy (CSP) Headers

For production deployment, configure these CSP headers in your web server:

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/your-site
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # CSP Headers for Solid Pods
    add_header Content-Security-Policy "
        default-src 'self';
        connect-src 'self'
            https://*.solidcommunity.net
            https://*.inrupt.net
            https://*.solidweb.org
            wss://*.solidcommunity.net
            wss://*.inrupt.net;
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    " always;

    # HTTPS Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # ... rest of config
}
```

### Apache Configuration

```apache
# /etc/apache2/sites-available/your-site.conf
<VirtualHost *:443>
    ServerName your-domain.com

    # CSP Headers
    Header always set Content-Security-Policy "default-src 'self'; connect-src 'self' https://*.solidcommunity.net https://*.inrupt.net wss://*.solidcommunity.net; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-ancestors 'none';"

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    # ... rest of config
</VirtualHost>
```

### Vite Dev Server (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        connect-src 'self'
          https://*.solidcommunity.net
          https://*.inrupt.net
          wss://*.solidcommunity.net
          ws://localhost:*;
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
      `.replace(/\n/g, ' ').trim()
    }
  }
})
```

## URL Validation

All Pod URLs are validated using `solidUrlValidator.ts`:

```typescript
import { validatePodUrl, validateWebId } from '@/utils/solidUrlValidator'

// Validate Pod URL
const result = validatePodUrl('https://alice.solidcommunity.net/')
if (!result.valid) {
  console.error('Invalid Pod URL:', result.error)
}

// Validate WebID
const webIdResult = validateWebId('https://alice.solidcommunity.net/profile/card#me')
```

### Validation Rules

1. **Protocol**: Only `https:` allowed
2. **No Script Injection**: Blocks `<script`, `javascript:`, `data:`
3. **No Path Traversal**: Blocks `..` in paths
4. **Suspicious Patterns**: Detects encoded attacks (`%3Cscript`, `%00`)
5. **WebID Format**: Must contain `/profile` path

## CORS Configuration

Solid Pods use CORS for cross-origin requests. Ensure your Pod provider supports:

```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Authentication Security

### Best Practices

1. **Use HTTPS Only**: Never use HTTP for Solid authentication
2. **Session Expiry**: Implement automatic logout after inactivity
3. **Token Storage**: Tokens stored in memory, not localStorage
4. **CSRF Protection**: Validate redirect URLs
5. **WebID Verification**: Always verify WebID format

### Implementation

```typescript
// In solidAuth.ts
async login(providerUrl: string, redirectUrl?: string) {
  // Validate provider URL
  const validation = validatePodUrl(providerUrl)
  if (!validation.valid) {
    throw new Error(`Invalid provider URL: ${validation.error}`)
  }

  // Validate redirect URL
  if (redirectUrl) {
    const redirectValidation = validatePodUrl(redirectUrl)
    if (!redirectValidation.valid) {
      throw new Error(`Invalid redirect URL: ${redirectValidation.error}`)
    }
  }

  // Proceed with login
  await login({
    oidcIssuer: validation.sanitized,
    redirectUrl: redirectUrl || window.location.href,
    clientName: 'TopLocs News Plugin'
  })
}
```

## Data Encryption

### Pod Data

- Profile data stored in RDF/Turtle format
- Private fields can be ACL-protected
- Sensitive data should be encrypted before storage

### Local Data

- Temporary data in memory only
- No sensitive data in localStorage
- Clear data on logout

## Security Checklist

- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] URL validation on all inputs
- [ ] CORS configured correctly
- [ ] Session management implemented
- [ ] Error messages don't leak information
- [ ] Regular security audits
- [ ] Dependencies up to date

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email security@toplocs.org
3. Include detailed steps to reproduce
4. Allow 90 days for fix before disclosure

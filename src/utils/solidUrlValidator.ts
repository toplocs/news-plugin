/**
 * Solid Pod URL Validation Utilities
 * Validates and sanitizes Pod URLs for security
 */

const ALLOWED_PROTOCOLS = ['https:']
const KNOWN_POD_PROVIDERS = [
  'solidcommunity.net',
  'inrupt.net',
  'solidweb.org',
  'teamid.live'
]

export interface ValidationResult {
  valid: boolean
  error?: string
  sanitized?: string
}

/**
 * Validate Pod URL
 */
export function validatePodUrl(urlString: string): ValidationResult {
  try {
    const url = new URL(urlString)

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return {
        valid: false,
        error: `Invalid protocol. Only ${ALLOWED_PROTOCOLS.join(', ')} allowed`
      }
    }

    // Check for suspicious patterns
    if (hasSuspiciousPatterns(url)) {
      return {
        valid: false,
        error: 'URL contains suspicious patterns'
      }
    }

    // Sanitize URL
    const sanitized = sanitizeUrl(url)

    return {
      valid: true,
      sanitized
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format'
    }
  }
}

/**
 * Validate WebID
 */
export function validateWebId(webId: string): ValidationResult {
  const urlValidation = validatePodUrl(webId)
  if (!urlValidation.valid) return urlValidation

  // WebID should typically end with /profile/card#me or similar
  if (!webId.includes('/profile')) {
    return {
      valid: false,
      error: 'WebID must contain /profile path'
    }
  }

  return urlValidation
}

/**
 * Check if URL is from a known Pod provider
 */
export function isKnownProvider(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return KNOWN_POD_PROVIDERS.some(provider => url.hostname.includes(provider))
  } catch {
    return false
  }
}

/**
 * Sanitize URL
 */
function sanitizeUrl(url: URL): string {
  // Remove fragments except for #me (used in WebID)
  if (url.hash && url.hash !== '#me') {
    url.hash = ''
  }

  // Normalize path
  url.pathname = url.pathname.replace(/\/+/g, '/')

  return url.toString()
}

/**
 * Check for suspicious patterns
 */
function hasSuspiciousPatterns(url: URL): boolean {
  const suspicious = [
    // Script injection attempts
    /<script/i,
    /javascript:/i,
    /data:/i,
    // Path traversal
    /\.\./,
    // Encoded attacks
    /%3Cscript/i,
    /%00/
  ]

  const fullUrl = url.toString()
  return suspicious.some(pattern => pattern.test(fullUrl))
}

/**
 * Validate Pod path
 */
export function validatePodPath(path: string): ValidationResult {
  // Path should start with /
  if (!path.startsWith('/')) {
    return {
      valid: false,
      error: 'Path must start with /'
    }
  }

  // Check for path traversal
  if (path.includes('..')) {
    return {
      valid: false,
      error: 'Path traversal not allowed'
    }
  }

  // Sanitize
  const sanitized = path.replace(/\/+/g, '/')

  return {
    valid: true,
    sanitized
  }
}

/**
 * Build safe Pod URL
 */
export function buildPodUrl(podRoot: string, path: string): ValidationResult {
  const rootValidation = validatePodUrl(podRoot)
  if (!rootValidation.valid) return rootValidation

  const pathValidation = validatePodPath(path)
  if (!pathValidation.valid) return pathValidation

  try {
    const url = new URL(pathValidation.sanitized!, rootValidation.sanitized!)
    return {
      valid: true,
      sanitized: url.toString()
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to build URL'
    }
  }
}

/**
 * Geocode Service - Verifies locations using OpenStreetMap Nominatim API
 *
 * Features:
 * - Location verification (convert name → coordinates)
 * - Reverse geocoding (convert coordinates → name + hierarchy)
 * - Location hierarchy extraction (city → state → country → continent)
 * - Rate limiting (1 request per second as per Nominatim guidelines)
 * - Response caching to minimize API calls
 */

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  address: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    continent?: string
    country_code?: string
  }
  osm_type: string
  osm_id: number
}

export interface GeocodeResult {
  verified: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  hierarchy?: {
    city?: string
    state?: string
    country?: string
    continent?: string
  }
  displayName?: string
  osmId?: number
}

class GeocodeService {
  private apiUrl = 'https://nominatim.openstreetmap.org'
  private cache: Map<string, GeocodeResult> = new Map()
  private rateLimitQueue: Array<() => void> = []
  private isProcessing = false
  private lastRequestTime = 0
  private minRequestInterval = 1000 // 1 second (Nominatim requirement)

  /**
   * Geocode a location name (forward geocoding)
   * @param locationName - Name of the location to geocode
   * @param countryCode - Optional country code to narrow search (e.g., 'de', 'us')
   * @returns GeocodeResult with verification status and data
   */
  async geocodeLocation(
    locationName: string,
    countryCode?: string
  ): Promise<GeocodeResult> {
    // Check cache first
    const cacheKey = `${locationName}|${countryCode || ''}`
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Cache hit for location: ${locationName}`)
      return this.cache.get(cacheKey)!
    }

    // Build query parameters
    const params = new URLSearchParams({
      q: locationName,
      format: 'json',
      addressdetails: '1',
      limit: '1'
    })

    if (countryCode) {
      params.append('countrycodes', countryCode)
    }

    try {
      const data = await this.makeRateLimitedRequest<NominatimResult[]>(
        `${this.apiUrl}/search?${params.toString()}`
      )

      if (!data || data.length === 0) {
        console.warn(`⚠️ Location not found: ${locationName}`)
        const result: GeocodeResult = { verified: false }
        this.cache.set(cacheKey, result)
        return result
      }

      const firstResult = data[0]
      const result = this.parseNominatimResult(firstResult)

      // Cache the result
      this.cache.set(cacheKey, result)

      console.log(`✅ Location verified: ${locationName}`, result)
      return result
    } catch (error) {
      console.error('Geocoding failed:', error)
      return { verified: false }
    }
  }

  /**
   * Reverse geocode coordinates to location name and hierarchy
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns GeocodeResult with location hierarchy
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    // Check cache first
    const cacheKey = `reverse|${lat},${lng}`
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Cache hit for coordinates: ${lat}, ${lng}`)
      return this.cache.get(cacheKey)!
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1'
    })

    try {
      const data = await this.makeRateLimitedRequest<NominatimResult>(
        `${this.apiUrl}/reverse?${params.toString()}`
      )

      if (!data) {
        console.warn(`⚠️ Reverse geocoding failed for: ${lat}, ${lng}`)
        return { verified: false }
      }

      const result = this.parseNominatimResult(data)

      // Cache the result
      this.cache.set(cacheKey, result)

      console.log(`✅ Reverse geocoded: ${lat}, ${lng}`, result)
      return result
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return { verified: false }
    }
  }

  /**
   * Batch geocode multiple locations
   * @param locations - Array of location names to geocode
   * @param countryCode - Optional country code for all locations
   * @returns Array of GeocodeResults
   */
  async geocodeMultiple(
    locations: string[],
    countryCode?: string
  ): Promise<Map<string, GeocodeResult>> {
    const results = new Map<string, GeocodeResult>()

    for (const location of locations) {
      const result = await this.geocodeLocation(location, countryCode)
      results.set(location, result)
    }

    return results
  }

  /**
   * Verify if a location exists and get its data
   * @param locationName - Name of the location
   * @param expectedCountry - Optional expected country for validation
   * @returns True if location exists and matches expected country
   */
  async verifyLocation(
    locationName: string,
    expectedCountry?: string
  ): Promise<boolean> {
    const result = await this.geocodeLocation(locationName)

    if (!result.verified) {
      return false
    }

    // If expected country is provided, validate it
    if (expectedCountry && result.hierarchy?.country) {
      const country = result.hierarchy.country.toLowerCase()
      const expected = expectedCountry.toLowerCase()
      return country.includes(expected) || expected.includes(country)
    }

    return true
  }

  /**
   * Get continent from country code or name
   * @param countryCode - ISO country code (e.g., 'DE', 'US')
   * @returns Continent name
   */
  private getContinentFromCountryCode(countryCode: string): string | undefined {
    const continents: Record<string, string> = {
      // Europe
      DE: 'Europe', FR: 'Europe', GB: 'Europe', IT: 'Europe', ES: 'Europe',
      NL: 'Europe', BE: 'Europe', AT: 'Europe', CH: 'Europe', PL: 'Europe',
      SE: 'Europe', NO: 'Europe', DK: 'Europe', FI: 'Europe', PT: 'Europe',
      GR: 'Europe', CZ: 'Europe', HU: 'Europe', RO: 'Europe', IE: 'Europe',

      // North America
      US: 'North America', CA: 'North America', MX: 'North America',

      // South America
      BR: 'South America', AR: 'South America', CL: 'South America',
      CO: 'South America', PE: 'South America', VE: 'South America',

      // Asia
      CN: 'Asia', JP: 'Asia', IN: 'Asia', KR: 'Asia', TH: 'Asia',
      VN: 'Asia', ID: 'Asia', MY: 'Asia', SG: 'Asia', PH: 'Asia',
      TR: 'Asia', SA: 'Asia', AE: 'Asia', IL: 'Asia', IQ: 'Asia',

      // Africa
      ZA: 'Africa', EG: 'Africa', NG: 'Africa', KE: 'Africa', ET: 'Africa',
      GH: 'Africa', TN: 'Africa', MA: 'Africa', DZ: 'Africa', UG: 'Africa',

      // Oceania
      AU: 'Oceania', NZ: 'Oceania', FJ: 'Oceania', PG: 'Oceania'
    }

    return continents[countryCode.toUpperCase()]
  }

  /**
   * Parse Nominatim API result into GeocodeResult
   * @param result - Raw Nominatim result
   * @returns Parsed GeocodeResult
   */
  private parseNominatimResult(result: NominatimResult): GeocodeResult {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    // Extract city from various possible fields
    const city = result.address.city ||
                 result.address.town ||
                 result.address.village

    // Get continent from country code
    const continent = result.address.country_code
      ? this.getContinentFromCountryCode(result.address.country_code)
      : result.address.continent

    return {
      verified: true,
      coordinates: { lat, lng },
      hierarchy: {
        city,
        state: result.address.state,
        country: result.address.country,
        continent
      },
      displayName: result.display_name,
      osmId: result.osm_id
    }
  }

  /**
   * Make a rate-limited request to Nominatim API
   * Ensures 1 second between requests as per Nominatim usage policy
   * @param url - Full URL to request
   * @returns Response data
   */
  private async makeRateLimitedRequest<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.rateLimitQueue.push(async () => {
        try {
          // Ensure minimum time between requests
          const now = Date.now()
          const timeSinceLastRequest = now - this.lastRequestTime
          if (timeSinceLastRequest < this.minRequestInterval) {
            await this.sleep(this.minRequestInterval - timeSinceLastRequest)
          }

          // Make the request
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'TopLocs News Plugin (Contact: info@toplocs.com)'
            }
          })

          this.lastRequestTime = Date.now()

          if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`)
          }

          const data = await response.json()
          resolve(data)
        } catch (error) {
          reject(error)
        }
      })

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processQueue()
      }
    })
  }

  /**
   * Process the rate limit queue
   */
  private async processQueue() {
    if (this.rateLimitQueue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true
    const nextRequest = this.rateLimitQueue.shift()

    if (nextRequest) {
      await nextRequest()
    }

    // Process next item
    this.processQueue()
  }

  /**
   * Sleep helper for rate limiting
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear()
    console.log('🗑️ Geocode cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const geocodeService = new GeocodeService()

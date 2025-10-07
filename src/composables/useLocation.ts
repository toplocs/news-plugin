import { ref, computed } from 'vue'

interface Location {
  lat: number
  lng: number
  name?: string
  accuracy?: number
}

const currentLocation = ref<Location | null>(null)
const locationError = ref<string | null>(null)
const isLoadingLocation = ref(false)

/**
 * Location Composable - Manages user location
 */
export function useLocation() {
  /**
   * Get current location using browser Geolocation API
   */
  const getCurrentLocation = async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      locationError.value = 'Geolocation wird von Ihrem Browser nicht unterstützt'
      return null
    }

    isLoadingLocation.value = true
    locationError.value = null

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }

          // Try to get location name from reverse geocoding
          const name = await reverseGeocode(location.lat, location.lng)
          if (name) {
            location.name = name
          }

          currentLocation.value = location
          isLoadingLocation.value = false
          resolve(location)
        },
        (error) => {
          let errorMessage = 'Standort konnte nicht ermittelt werden'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Standortzugriff wurde verweigert'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Standortinformationen nicht verfügbar'
              break
            case error.TIMEOUT:
              errorMessage = 'Zeitüberschreitung bei Standortabfrage'
              break
          }

          locationError.value = errorMessage
          isLoadingLocation.value = false
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      )
    })
  }

  /**
   * Reverse geocode coordinates to location name
   * Uses Nominatim (OpenStreetMap) API
   */
  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=de`

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TopLocs News Plugin'
        }
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      // Try to get city or town name
      const address = data.address
      const name =
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.neighbourhood ||
        data.display_name

      return name
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      return null
    }
  }

  /**
   * Calculate distance between two coordinates (in km)
   * Using Haversine formula
   */
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRad = (deg: number): number => {
    return (deg * Math.PI) / 180
  }

  /**
   * Set location manually
   */
  const setLocation = (location: Location) => {
    currentLocation.value = location
  }

  /**
   * Clear location
   */
  const clearLocation = () => {
    currentLocation.value = null
    locationError.value = null
  }

  const hasLocation = computed(() => currentLocation.value !== null)

  return {
    currentLocation,
    locationError,
    isLoadingLocation,
    hasLocation,
    getCurrentLocation,
    setLocation,
    clearLocation,
    calculateDistance
  }
}

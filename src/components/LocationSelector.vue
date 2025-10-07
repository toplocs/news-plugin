<template>
  <div class="location-selector">
    <button
      @click="toggleDropdown"
      class="location-btn"
      :class="{ active: showDropdown }"
    >
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        class="icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span v-if="currentLocation && currentLocation.name">
        {{ currentLocation.name }}
      </span>
      <span v-else class="placeholder">Standort wählen</span>
    </button>

    <!-- Dropdown -->
    <div v-if="showDropdown" class="dropdown">
      <div class="dropdown-content">
        <!-- Current Location -->
        <button
          @click="handleGetCurrentLocation"
          class="dropdown-item"
          :disabled="isLoadingLocation"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
          <span v-if="isLoadingLocation">Wird ermittelt...</span>
          <span v-else>Aktueller Standort</span>
        </button>

        <!-- Predefined Locations -->
        <div class="divider">Beliebte Orte</div>

        <button
          v-for="location in popularLocations"
          :key="location.name"
          @click="handleSelectLocation(location)"
          class="dropdown-item"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <span>{{ location.name }}</span>
        </button>

        <!-- Error Message -->
        <div v-if="locationError" class="error-msg">
          {{ locationError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocation } from '../composables/useLocation'

const emit = defineEmits<{
  'location-change': [location: { lat: number; lng: number; name?: string } | null]
}>()

const { currentLocation, locationError, isLoadingLocation, getCurrentLocation, setLocation } =
  useLocation()

const showDropdown = ref(false)

const popularLocations = [
  { name: 'Berlin Mitte', lat: 52.52, lng: 13.405 },
  { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
  { name: 'München', lat: 48.1351, lng: 11.582 },
  { name: 'Köln', lat: 50.9375, lng: 6.9603 },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 }
]

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleGetCurrentLocation = async () => {
  const location = await getCurrentLocation()
  if (location) {
    emit('location-change', location)
    showDropdown.value = false
  }
}

const handleSelectLocation = (location: { name: string; lat: number; lng: number }) => {
  setLocation(location)
  emit('location-change', location)
  showDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.location-selector')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.location-selector {
  position: relative;
}

.location-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.location-btn:hover,
.location-btn.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

.icon {
  color: #6366f1;
}

.placeholder {
  color: #94a3b8;
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 250px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
}

.dropdown-content {
  padding: 0.5rem;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: #f8fafc;
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
}

.dropdown-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-item svg {
  color: #6366f1;
  flex-shrink: 0;
}

.divider {
  padding: 0.5rem 0.75rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-msg {
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-size: 0.875rem;
}
</style>

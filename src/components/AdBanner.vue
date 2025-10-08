<template>
  <div v-if="ad" class="ad-banner" :class="{ clickable: !isClicked }">
    <!-- Ad Content -->
    <a
      :href="ad.targetUrl"
      target="_blank"
      rel="noopener noreferrer sponsored"
      class="ad-link"
      @click="handleClick"
    >
      <!-- Ad Image -->
      <div class="ad-image">
        <img :src="ad.imageUrl" :alt="ad.title" />
      </div>

      <!-- Ad Text -->
      <div class="ad-content">
        <div class="ad-label">Anzeige</div>
        <h3 class="ad-title">{{ ad.title }}</h3>
        <p class="ad-description">{{ ad.description }}</p>

        <!-- Match Indicator -->
        <div v-if="matchScore > 0.5" class="match-indicator">
          <span class="match-icon">✨</span>
          <span class="match-text">{{ (matchScore * 100).toFixed(0) }}% Match mit deinen Interessen</span>
        </div>
      </div>
    </a>

    <!-- Revenue Indicator (transparent to user) -->
    <div v-if="showRevenue && userRevenue > 0" class="revenue-indicator">
      <span class="revenue-icon">💰</span>
      <span class="revenue-text">+{{ formatCurrency(userRevenue) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adMatchingService, type Ad } from '../services/adMatchingService'
import { useRevenue } from '../stores/useRevenue'

const props = defineProps<{
  userInterests?: string[]
  articleId?: string
  channelId?: string
  showRevenue?: boolean  // Show revenue earned (for testing)
}>()

const revenue = useRevenue()

// State
const ad = ref<Ad | null>(null)
const isClicked = ref(false)
const matchScore = ref(0)
const userRevenue = ref(0)

// Computed
const formatCurrency = (amount: number): string => {
  return '€' + amount.toFixed(4)
}

// Find and display best matching ad
const loadAd = () => {
  const interests = props.userInterests || []
  const bestAd = adMatchingService.findBestAd(interests, props.articleId)

  if (bestAd) {
    ad.value = bestAd
    matchScore.value = calculateMatch(interests, bestAd.interests)

    // Track impression
    const placement = revenue.trackImpression(
      bestAd,
      interests,
      props.articleId,
      props.channelId
    )

    userRevenue.value = placement.distribution.user

    console.log(`📺 Ad shown: ${bestAd.title} | Match: ${(matchScore.value * 100).toFixed(0)}%`)
  }
}

const calculateMatch = (userInterests: string[], adInterests: string[]): number => {
  if (userInterests.length === 0 || adInterests.length === 0) return 0

  const matches = userInterests.filter(interest =>
    adInterests.some(adInt =>
      adInt.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(adInt.toLowerCase())
    )
  ).length

  return matches / Math.max(userInterests.length, adInterests.length)
}

const handleClick = () => {
  if (!ad.value) return

  isClicked.value = true

  // Track click
  const interests = props.userInterests || []
  const placement = revenue.trackClick(
    ad.value,
    interests,
    props.articleId,
    props.channelId
  )

  userRevenue.value += placement.distribution.user

  console.log(`🖱️ Ad clicked: ${ad.value.title} | Revenue: ${formatCurrency(placement.distribution.user)}`)
}

// Load ad on mount
onMounted(() => {
  loadAd()
})
</script>

<style scoped>
.ad-banner {
  position: relative;
  width: 100%;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.ad-banner.clickable:hover {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.ad-link {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
}

/* Ad Image */
.ad-image {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: rgba(100, 116, 139, 0.2);
}

.ad-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ad-banner.clickable:hover .ad-image img {
  transform: scale(1.05);
}

/* Ad Content */
.ad-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.ad-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.ad-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.ad-description {
  font-size: 0.9375rem;
  color: #cbd5e1;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

/* Match Indicator */
.match-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: #a5b4fc;
  align-self: flex-start;
}

.match-icon {
  font-size: 1rem;
}

/* Revenue Indicator */
.revenue-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: #10b981;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.revenue-icon {
  font-size: 1rem;
}

/* Mobile */
@media (max-width: 640px) {
  .ad-link {
    flex-direction: column;
  }

  .ad-image {
    width: 100%;
    height: 150px;
  }

  .revenue-indicator {
    top: 0.5rem;
    right: 0.5rem;
  }
}

/* Compact variant */
.ad-banner.compact {
  background: rgba(30, 41, 59, 0.3);
}

.ad-banner.compact .ad-link {
  padding: 0.75rem;
  gap: 0.75rem;
}

.ad-banner.compact .ad-image {
  width: 120px;
  height: 80px;
}

.ad-banner.compact .ad-title {
  font-size: 1rem;
}

.ad-banner.compact .ad-description {
  font-size: 0.875rem;
}
</style>

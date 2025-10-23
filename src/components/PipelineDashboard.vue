<template>
  <div class="pipeline-dashboard bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-indigo-500/30 shadow-2xl p-6 mb-6" role="region" aria-label="News Pipeline Dashboard">
    <!-- Initial Loading State -->
    <div v-if="isInitialLoad" class="initial-loading-state" role="status" aria-live="polite">
      <div class="spinner-lg" aria-hidden="true"></div>
      <p class="text-indigo-300 text-lg font-medium mt-4">Initializing Pipeline...</p>
      <p class="text-slate-400 text-sm mt-2">Setting up RSS feeds and NLP processors</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="text-4xl animate-pulse">📊</div>
        <div>
          <h2 class="text-2xl font-bold text-white">News Pipeline Dashboard</h2>
          <p class="text-indigo-300 text-sm">Real-time analytics & insights</p>
        </div>
      </div>
      <div v-if="status" class="flex items-center gap-2 px-4 py-2 rounded-lg" :class="statusClass">
        <div v-if="isProcessing" class="spinner-xs"></div>
        <span class="font-medium">{{ status }}</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <!-- Fetched -->
      <div class="stat-card bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
        <div class="text-blue-300 text-sm font-medium mb-1">RSS Fetched</div>
        <div class="text-3xl font-bold text-white">{{ stats.fetched }}</div>
        <div class="text-blue-400 text-xs mt-1">from {{ activeSources }} sources</div>
      </div>

      <!-- Processed -->
      <div class="stat-card bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
        <div class="text-purple-300 text-sm font-medium mb-1">NLP Processed</div>
        <div class="text-3xl font-bold text-white">{{ stats.processed }}</div>
        <div class="text-purple-400 text-xs mt-1">{{ processingRate }}% success</div>
      </div>

      <!-- Stored -->
      <div class="stat-card bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
        <div class="text-green-300 text-sm font-medium mb-1">Gun.js Stored</div>
        <div class="text-3xl font-bold text-white">{{ stats.stored }}</div>
        <div class="text-green-400 text-xs mt-1">P2P synced</div>
      </div>

      <!-- Failed -->
      <div class="stat-card bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl p-4">
        <div class="text-red-300 text-sm font-medium mb-1">Failed</div>
        <div class="text-3xl font-bold text-white">{{ stats.failed }}</div>
        <div class="text-red-400 text-xs mt-1">{{ errorRate }}% error rate</div>
      </div>
    </div>

    <!-- Pipeline Flow Visualization -->
    <div class="pipeline-flow mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div class="text-white font-medium mb-3 flex items-center gap-2">
        <span>🔄</span>
        <span>Pipeline Flow</span>
      </div>
      <div class="flex items-center gap-2 overflow-x-auto">
        <!-- RSS -->
        <div class="flow-step flex-shrink-0">
          <div class="flow-box bg-blue-600/30 border-blue-500/50">
            <div class="text-2xl mb-1">📰</div>
            <div class="text-sm font-medium">RSS Fetch</div>
            <div class="text-xs text-blue-300">{{ stats.fetched }} articles</div>
          </div>
        </div>

        <div class="flow-arrow">→</div>

        <!-- NLP -->
        <div class="flow-step flex-shrink-0">
          <div class="flow-box bg-purple-600/30 border-purple-500/50">
            <div class="text-2xl mb-1">🧠</div>
            <div class="text-sm font-medium">NLP Extract</div>
            <div class="text-xs text-purple-300">{{ extractedTopics.length }} topics</div>
          </div>
        </div>

        <div class="flow-arrow">→</div>

        <!-- Topic Match -->
        <div class="flow-step flex-shrink-0">
          <div class="flow-box bg-indigo-600/30 border-indigo-500/50">
            <div class="text-2xl mb-1">🎯</div>
            <div class="text-sm font-medium">Topic Match</div>
            <div class="text-xs text-indigo-300">{{ matchedTopics.length }} matched</div>
          </div>
        </div>

        <div class="flow-arrow">→</div>

        <!-- Gun.js -->
        <div class="flow-step flex-shrink-0">
          <div class="flow-box bg-green-600/30 border-green-500/50">
            <div class="text-2xl mb-1">💾</div>
            <div class="text-sm font-medium">Gun.js Store</div>
            <div class="text-xs text-green-300">{{ stats.stored }} stored</div>
          </div>
        </div>

        <div class="flow-arrow">→</div>

        <!-- Feed -->
        <div class="flow-step flex-shrink-0">
          <div class="flow-box bg-pink-600/30 border-pink-500/50">
            <div class="text-2xl mb-1">📱</div>
            <div class="text-sm font-medium">Your Feed</div>
            <div class="text-xs text-pink-300">personalized</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Topic Cloud -->
    <div v-if="extractedTopics.length > 0" class="topic-cloud mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div class="text-white font-medium mb-3 flex items-center gap-2">
        <span>🏷️</span>
        <span>Extracted Topics</span>
        <span class="text-indigo-300 text-sm">({{ extractedTopics.length }} total)</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="topic in extractedTopics.slice(0, 20)"
          :key="topic.name"
          class="topic-tag px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-110 cursor-pointer"
          :style="getTopicStyle(topic.count)"
        >
          {{ topic.name }} <span class="opacity-70">({{ topic.count }})</span>
        </div>
      </div>
    </div>

    <!-- Activity Feed -->
    <div v-if="activities.length > 0" class="activity-feed p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <div class="text-white font-medium mb-3 flex items-center gap-2">
        <span>⚡</span>
        <span>Recent Activity</span>
      </div>
      <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        <div
          v-for="(activity, index) in activities.slice(0, 10)"
          :key="index"
          class="activity-item flex items-start gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
        >
          <div class="text-xl flex-shrink-0">{{ activity.icon }}</div>
          <div class="flex-1 min-w-0">
            <div class="text-white text-sm">{{ activity.message }}</div>
            <div class="text-slate-400 text-xs">{{ formatTime(activity.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
    </div><!-- Close dashboard content wrapper -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface PipelineStats {
  fetched: number
  processed: number
  stored: number
  failed: number
}

export interface Activity {
  icon: string
  message: string
  timestamp: number
}

const props = defineProps<{
  stats: PipelineStats
  status?: string
  extractedTopics?: Array<{ name: string; count: number }>
  matchedTopics?: Array<{ id: string; name: string }>
  activities?: Activity[]
  activeSources?: number
}>()

const isInitialLoad = computed(() => {
  // Show initial loading if no stats and no status
  return props.stats.fetched === 0 &&
         props.stats.processed === 0 &&
         props.stats.stored === 0 &&
         !props.status
})

const isProcessing = computed(() => {
  return props.status && props.status !== 'Ready!' && props.status !== 'Error!'
})

const statusClass = computed(() => {
  if (props.status === 'Ready!') return 'bg-green-600/20 border border-green-500/30 text-green-300'
  if (props.status === 'Error!') return 'bg-red-600/20 border border-red-500/30 text-red-300'
  return 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300'
})

const processingRate = computed(() => {
  if (props.stats.fetched === 0) return 0
  return Math.round((props.stats.processed / props.stats.fetched) * 100)
})

const errorRate = computed(() => {
  if (props.stats.fetched === 0) return 0
  return Math.round((props.stats.failed / props.stats.fetched) * 100)
})

const extractedTopics = computed(() => props.extractedTopics || [])
const matchedTopics = computed(() => props.matchedTopics || [])
const activities = computed(() => props.activities || [])

const getTopicStyle = (count: number) => {
  // Scale: 1-5 = small, 6-10 = medium, 11+ = large
  const opacity = Math.min(0.5 + (count * 0.05), 1)
  const scale = Math.min(1 + (count * 0.02), 1.5)

  if (count >= 10) {
    return {
      background: `rgba(99, 102, 241, ${opacity})`,
      fontSize: `${scale * 0.875}rem`,
      border: '1px solid rgba(99, 102, 241, 0.5)'
    }
  } else if (count >= 5) {
    return {
      background: `rgba(168, 85, 247, ${opacity})`,
      fontSize: `${scale * 0.875}rem`,
      border: '1px solid rgba(168, 85, 247, 0.5)'
    }
  } else {
    return {
      background: `rgba(59, 130, 246, ${opacity})`,
      fontSize: `${scale * 0.875}rem`,
      border: '1px solid rgba(59, 130, 246, 0.5)'
    }
  }
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 1000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  return `${Math.floor(diff / 3600000)}h ago`
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.flow-box {
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid;
  text-align: center;
  min-width: 120px;
  backdrop-filter: blur(10px);
  transition: transform 0.2s;
}

.flow-box:hover {
  transform: scale(1.05);
}

.flow-arrow {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.topic-tag {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Loading State */
.initial-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner-lg {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-xs {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.7);
}

.activity-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

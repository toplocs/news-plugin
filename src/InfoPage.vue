<template>
  <PluginInfoPage
    :plugin-config="pluginConfig"
    icon="📰"
    :about="about"
    :features="features"
    :endpoints="endpoints"
    :development="development"
    :slot-descriptions="slotDescriptions"
  />
</template>

<script setup lang="ts">
import { PluginInfoPage } from '@toplocs/plugin-sdk'
import pluginConfig from './index'
import './assets/animations.css'

const about = `
The News Plugin brings local journalism and community news discovery to TopLocs. It enables communities to aggregate, share, and discover local news from multiple sources, with AI-powered semantic search and location-based filtering. Perfect for staying informed about what's happening in your community.
`

const features = [
  {
    icon: '📍',
    title: 'Location-Based News',
    description: 'Discover news relevant to your location with radius-based filtering and multi-location support'
  },
  {
    icon: '🔍',
    title: 'Semantic Search',
    description: 'AI-powered search that understands context and meaning, not just keywords'
  },
  {
    icon: '🗞️',
    title: 'Multi-Source Aggregation',
    description: 'Aggregate news from RSS feeds, APIs, and community sources automatically'
  },
  {
    icon: '🔄',
    title: 'P2P Sync',
    description: 'Real-time synchronization across all community members using Gun.js'
  },
  {
    icon: '🎯',
    title: 'Interest Matching',
    description: 'Get news tailored to your interests and community topics'
  },
  {
    icon: '✍️',
    title: 'Community Publishing',
    description: 'Members can publish and share local news stories within the community'
  }
]

// Compute base URL from current location
const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')
const isDevelopment = window.location.hostname === 'localhost'

const endpoints = {
  plugin: `${baseUrl}/plugin.js`,
  landing: baseUrl,
  demo: 'https://toplocs.github.io/tribelike/'
}

const development = {
  stack: ['Vue 3', 'TypeScript', 'Gun.js', 'Tailwind CSS', 'Vector Search'],
  setup: `pnpm install && pnpm dev`,
  urls: [
    { label: 'GitHub Repository', url: 'https://github.com/toplocs/news-plugin' },
    { label: isDevelopment ? 'Local Development' : 'Plugin Landing Page', url: baseUrl }
  ]
}

const slotDescriptions = {
  'Topic → Info → Sidebar': 'Sidebar: Displays recent news and trending stories for the topic',
  'Topic → Settings → Content': 'Content: News feed preferences and source configuration',
  'Location → Info → Sidebar': 'Sidebar: Location-specific news and local events',
  'Location → Settings → Content': 'Content: Location-based news settings and radius filters'
}
</script>

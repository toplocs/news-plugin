# News-Plugin Konzept für TopLocs/Tribelike

**Version:** 2.0
**Datum:** 7. Oktober 2025
**Status:** Konzept-Phase → Ready for Implementation
**Integration:** Full TopLocs Topics/Locations/Relations System

---

## 🎯 Vision

Ein **vollständig integriertes** dezentrales News-Plugin, das TopLocs-Usern personalisierte Nachrichten basierend auf ihren **bestehenden Topics** und **Locations** liefert. News werden automatisch gescraped, intelligent gegen TopLocs Entities gemappt, und neue Topics/Locations werden durch ein **Auto-Promote System** organisch entdeckt.

### Kernprinzipien

1. ✅ **Keine Duplikate** - Nutzt bestehende TopLocs Topics/Locations
2. ✅ **Relations-basiert** - Liest User-Interessen aus Profile Relations
3. ✅ **Auto-Discovery** - Neue Entities werden automatisch vorgeschlagen
4. ✅ **Pure P2P** - Gun.js für alle Daten, minimaler Relay
5. ✅ **Multi-Profile** - Verschiedene Feeds für Work/Hobby/Family

---

## 📊 TopLocs System Integration

### Bestehende Infrastruktur

TopLocs hat bereits ein **vollständiges Interest/Location System**:

```javascript
// Topics (Interessen)
gun.get('topic/{topic-id}/{space}')          // z.B. 'ai', 'climate-change'
gun.get('topics/titles').get('AI')           // Title-Index

// Locations (Orte)
gun.get('location/{location-id}')            // z.B. 'berlin', 'san-francisco'
gun.get('locations/names').get('Berlin')     // Name-Index

// Profile Relations
gun.get('relations/{profile-id}/like/{topic-id}')      // User likes Topic
gun.get('relations/{profile-id}/live/{location-id}')   // User lives in Location

// Universal Relations System
gun.get('{profile-id}').get('relations').map()  // Alle Relations eines Profils
```

**Relation-Types:**
- **Profile → Topic**: `like`, `love`, `learn`, `teach`
- **Profile → Location**: `visit`, `live`, `going`, `work`

### Multi-Profile System

User können **mehrere Profile** haben (Work, Hobby, Family):
```javascript
gun.get('profile/work-profile-id').get('relations')
  → like: ['topic-ai', 'topic-business']
  → live: ['location-sf']

gun.get('profile/hobby-profile-id').get('relations')
  → love: ['topic-photography', 'topic-travel']
  → visit: ['location-bali', 'location-paris']
```

**Konsequenz für News-Plugin:**
- Jedes Profil hat eigenen personalisierten Feed
- "Work"-Profil zeigt Tech/Business News
- "Hobby"-Profil zeigt Photography/Travel News

---

## 🏗️ News-Plugin Architektur (TopLocs-Integriert)

### System-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│  News-Scraping Service (Optional, Community-betrieben)      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. RSS/API Aggregation                              │  │
│  │  2. NLP Topic/Location Extraction                    │  │
│  │  3. Matching gegen TopLocs Topics/Locations          │  │
│  │  4. Auto-Promote: neue Topics/Locations vorschlagen  │  │
│  │  5. Publizieren in Gun.js P2P Graph                  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼ (Gun.js Relay)
┌─────────────────────────────────────────────────────────────┐
│  Gun.js P2P Network                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  gun.get('news_plugin/articles/{id}')                │  │
│  │    → topics: ['topic-ai', 'topic-ml']  (TopLocs IDs)│  │
│  │    → locations: ['location-sf']        (TopLocs IDs)│  │
│  │                                                       │  │
│  │  gun.get('news_plugin/by_topic/{topic-id}')         │  │
│  │    → set({ articleId, relevance })                   │  │
│  │                                                       │  │
│  │  gun.get('news_plugin/by_location/{location-id}')   │  │
│  │    → set({ articleId, relevance })                   │  │
│  │                                                       │  │
│  │  gun.get('news_plugin/suggested_topics/{name}')     │  │
│  │    → { count, articles, confidence }                 │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  News-Plugin (Vue 3 + TypeScript)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Lese Profile Relations                           │  │
│  │     → topics: ['topic-ai', 'topic-ml']               │  │
│  │     → locations: ['location-sf', 'location-usa']     │  │
│  │                                                       │  │
│  │  2. Lade News für diese Topics/Locations             │  │
│  │     gun.get('news_plugin/by_topic/topic-ai')         │  │
│  │     gun.get('news_plugin/by_location/location-sf')   │  │
│  │                                                       │  │
│  │  3. Personalisierter Feed (nach Relevance sortiert)  │  │
│  │                                                       │  │
│  │  4. 3-Column Layout (HeaderBar, Feed, Sidebars)      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Datenmodell (TopLocs-Integriert)

### 1. News Article (mit TopLocs Referenzen)

```javascript
gun.get('news_plugin/articles/{article-id}').put({
  id: 'article-uuid',
  url: 'https://example.com/article',
  title: 'Breakthrough in Quantum Computing',
  description: 'Article description...',
  content: 'Full article content...',

  source: {
    id: 'source-id',
    name: 'TechCrunch',
    url: 'https://techcrunch.com'
  },

  imageUrl: 'https://example.com/image.jpg',
  publishedAt: 1696752000000,
  scrapedAt: 1696752100000,

  // ✅ WICHTIG: Referenzen zu bestehenden TopLocs Entities!
  topics: ['topic-quantum-computing', 'topic-ai'],      // ← TopLocs Topic-IDs
  locations: ['location-sf', 'location-usa'],           // ← TopLocs Location-IDs

  // Auto-Promote: Vorgeschlagene neue Entities
  suggestedTopics: [
    {
      name: 'quantum-annealing',
      confidence: 0.87,
      count: 3  // wie oft dieser Tag vorkam
    }
  ],
  suggestedLocations: [
    {
      name: 'Buenos Aires',
      lat: -34.6037,
      lng: -58.3816,
      verified: true,      // ✅ Geodaten-verifiziert
      osm_id: 'R1224652',
      count: 2
    }
  ],

  // Metadata
  language: 'en',
  sentiment: 0.7,

  // P2P
  publisher: 'scraper-service-pub-key',
  verified: true,

  createdAt: 1696752100000,
  updatedAt: 1696752100000
})
```

### 2. Topic-Index (für schnelles Filtern)

```javascript
// Index: Topic → Articles
gun.get('news_plugin/by_topic')
   .get('topic-ai')                    // ← bestehende TopLocs Topic-ID
   .set({
     articleId: 'article-uuid',
     relevance: 0.92,                  // NLP Confidence Score
     publishedAt: 1696752000000
   })

// Query: Alle News für Topic "AI"
gun.get('news_plugin/by_topic')
   .get('topic-ai')
   .map()
   .once((index) => {
     // Lade Article
     gun.get('news_plugin/articles').get(index.articleId).once(...)
   })
```

### 3. Location-Index

```javascript
// Index: Location → Articles
gun.get('news_plugin/by_location')
   .get('location-berlin')             // ← bestehende TopLocs Location-ID
   .set({
     articleId: 'article-uuid',
     relevance: 0.88,
     publishedAt: 1696752000000
   })
```

### 4. Suggested Topics (Auto-Promote System)

```javascript
gun.get('news_plugin/suggested_topics')
   .get('quantum-annealing')           // Slug (normalized name)
   .put({
     name: 'Quantum Annealing',        // Display Name
     slug: 'quantum-annealing',
     count: 5,                         // Häufigkeit über alle Articles
     firstSeen: 1696700000000,
     lastSeen: 1696752000000,
     articleIds: ['article-1', 'article-2', ...],
     totalConfidence: 4.3,             // Summe aller NLP Scores
     avgConfidence: 0.86,              // Durchschnitt
     status: 'pending',                // 'pending' | 'approved' | 'rejected'
     topicId: null                     // Wird gesetzt nach Auto-Promote
   })
```

### 5. Suggested Locations (mit Geodaten-Verification)

```javascript
gun.get('news_plugin/suggested_locations')
   .get('buenos-aires')
   .put({
     name: 'Buenos Aires',
     slug: 'buenos-aires',

     // Geodaten (von Nominatim/OSM API)
     lat: -34.6037,
     lng: -58.3816,
     type: 'city',
     osm_id: 'R1224652',
     verified: true,                   // ✅ Extern verifiziert

     // Hierarchie
     parent: 'location-argentina',     // ← wird auch auto-created
     ancestors: ['location-argentina', 'location-south-america'],

     count: 8,
     firstSeen: 1696700000000,
     lastSeen: 1696752000000,
     articleIds: ['article-3', 'article-4', ...],
     totalConfidence: 7.6,
     avgConfidence: 0.95,              // Höher bei verified=true
     status: 'pending',
     locationId: null
   })
```

### 6. News Source

```javascript
gun.get('news_plugin/sources/{source-id}').put({
  id: 'source-techcrunch',
  name: 'TechCrunch',
  url: 'https://techcrunch.com',
  rssUrl: 'https://techcrunch.com/feed',

  // Default-Kategorien (für initial tagging)
  defaultTopics: ['topic-technology', 'topic-startups'],

  language: 'en',
  credibility: 0.85,
  active: true,

  addedBy: 'user-pub-key',
  addedAt: 1696700000000
})
```

---

## 🤖 Auto-Promote System

### Konzept

**Problem:** News enthalten Topics/Locations, die noch nicht in TopLocs existieren.

**Lösung:** 3-Tier System mit **Frequency-Based Auto-Creation**

### Tier 1: Pending (neu entdeckt)

```javascript
// Scraper findet "Quantum Annealing" (existiert nicht in TopLocs)
{
  suggestedTopics: [{
    name: 'quantum-annealing',
    confidence: 0.87,
    count: 1  // ← erstes Vorkommen
  }]
}
```

### Tier 2: Tracking (Häufigkeit wird gezählt)

```javascript
// Nach 5 Artikeln mit "Quantum Annealing"
gun.get('news_plugin/suggested_topics/quantum-annealing')
  → count: 5
  → avgConfidence: 0.86
  → timespan: 7 days
  → sources: ['TechCrunch', 'Wired', 'MIT News']
```

### Tier 3: Auto-Promote (automatische Topic-Creation)

```javascript
// Threshold erreicht (count >= 10)
async function checkAutoPromote(suggestion) {
  if (suggestion.count >= 10 &&
      suggestion.avgConfidence >= 0.8 &&
      suggestion.timeSpan >= 7 * 86400000 &&
      suggestion.uniqueSources >= 3) {

    // ✅ Create real TopLocs Topic
    const topicId = await createTopic({
      title: suggestion.name,
      description: `Auto-created from ${suggestion.count} news articles`,
      space: 'global',
      source: 'news_plugin_auto_promote',
      verified: false
    })

    // Update all articles
    await promoteSuggestedTopic(suggestion.slug, topicId)

    // Mark as promoted
    gun.get('news_plugin/suggested_topics')
       .get(suggestion.slug)
       .put({ status: 'approved', topicId })

    return topicId
  }
}
```

### Auto-Promote Thresholds

#### Topics (Subjektiv → Höherer Threshold)

```javascript
const TOPIC_THRESHOLDS = {
  count: 10,                    // Min. 10 Artikel
  avgConfidence: 0.8,           // NLP Score >= 0.8
  timeSpan: 7 * 86400000,       // Min. 7 Tage
  uniqueSources: 3,             // Min. 3 verschiedene Quellen

  // Verhindert:
  // - Flash-in-the-pan Topics
  // - Single-Source Bias
  // - Low-Quality NLP Matches
}
```

#### Locations (Faktisch → Niedriger Threshold)

```javascript
const LOCATION_THRESHOLDS = {
  verified: {
    count: 3,                   // ✅ Nur 3 Artikel (wenn verifiziert)
    avgConfidence: 0.95,        // Höher (extern bestätigt)
    timeSpan: 0,                // Sofort (kein Warten)
    uniqueSources: 2
  },
  unverified: {
    count: 15,                  // ❌ 15 Artikel (wenn nicht verifiziert)
    avgConfidence: 0.85,
    timeSpan: 14 * 86400000,    // 14 Tage
    uniqueSources: 5
  }
}

// Geodaten-Verification via Nominatim API
async function verifyLocation(name) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${name}&format=json`
  )
  const data = await response.json()

  if (data.length > 0) {
    return {
      name: data[0].display_name,
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      osm_id: data[0].osm_id,
      type: data[0].type,
      verified: true,           // ✅
      confidence: 1.0
    }
  }

  return null
}
```

### Location-Hierarchie Auto-Creation

```javascript
// Location "San Francisco" → auch "California" und "USA" anlegen
async function createLocationWithHierarchy(locationData) {
  const { lat, lng, name } = locationData

  // 1. Query Nominatim für Hierarchie
  const details = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  ).then(r => r.json())

  // 2. Extrahiere Hierarchie
  const hierarchy = {
    city: details.address.city,           // San Francisco
    state: details.address.state,         // California
    country: details.address.country,     // United States
    continent: getContinent(details)      // North America
  }

  // 3. Create Locations in TopLocs (falls nicht existieren)
  const locationIds = []

  for (const [type, name] of Object.entries(hierarchy)) {
    if (!name) continue

    let location = await findLocation(name)

    if (!location) {
      const coords = await geocode(name)  // Get lat/lng

      location = await createLocation({
        name,
        type,
        lat: coords.lat,
        lng: coords.lng,
        verified: true,
        source: 'news_plugin_hierarchy'
      })
    }

    locationIds.push(location.id)
  }

  // 4. Create Relations (City → State → Country)
  await createLocationRelation('location-sf', 'child', 'location-california')
  await createLocationRelation('location-california', 'child', 'location-usa')

  return locationIds
}
```

---

## 📰 News-Scraping Service

### Technologie-Stack

- **Runtime**: Node.js (TypeScript) oder Python
- **RSS Parser**: `rss-parser` (Node) oder `feedparser` (Python)
- **NLP**:
  - **spaCy** (Python) - Named Entity Recognition
  - **Hugging Face Transformers** - Zero-shot Topic Classification
- **Gun.js**: Gun.js SDK für P2P-Integration
- **Geodaten**: Nominatim API (OpenStreetMap)
- **Scheduler**: `node-cron` (Node) oder `celery` (Python)

### Workflow

```
1. RSS Aggregation
   ├─ Fetch from configured sources
   ├─ Parse RSS/Atom feeds
   └─ Extract article metadata

2. Content Processing
   ├─ Fetch full article (optional, via newspaper3k/readability)
   ├─ Clean HTML
   └─ Extract main text

3. NLP Topic Matching
   ├─ Extract keywords/phrases
   ├─ Match gegen TopLocs Topics (fuzzy matching)
   │  → gun.get('topics/titles').get('AI')
   ├─ If match: Add to topics[]
   ├─ If no match: Add to suggestedTopics[]
   └─ Track frequency for auto-promote

4. NLP Location Extraction
   ├─ Named Entity Recognition (GPE, LOC)
   ├─ Verify gegen Nominatim API
   ├─ Match gegen TopLocs Locations
   ├─ If verified & match: Add to locations[]
   ├─ If verified & no match: Add to suggestedLocations[] (low threshold)
   └─ If not verified: Add to suggestedLocations[] (high threshold)

5. Auto-Promote Check
   ├─ Increment count for suggested entities
   ├─ Check thresholds (topics: 10, locations: 3 if verified)
   ├─ If threshold met: Create TopLocs Entity
   └─ Update articles with new Entity ID

6. Deduplication
   ├─ Check URL fingerprint
   ├─ Check title similarity (Levenshtein)
   └─ Skip if duplicate

7. Gun.js Publishing
   ├─ Write article to gun.get('news_plugin/articles/{id}')
   ├─ Update topic indexes
   ├─ Update location indexes
   └─ Trigger P2P sync
```

### Code-Beispiel (Node.js/TypeScript)

```typescript
import Gun from 'gun'
import Parser from 'rss-parser'
import { encode as geohash } from 'ngeohash'

const gun = Gun({ peers: ['http://localhost:8765/gun'] })
const parser = new Parser()

interface TopLocsTopic {
  id: string
  title: string
  slug: string
}

async function scrapeAndTag() {
  const sources = await getActiveSources()

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.rssUrl)

      for (const item of feed.items) {
        // 1. Basic Article Data
        const article = {
          id: crypto.randomUUID(),
          url: item.link!,
          title: item.title!,
          description: item.contentSnippet || '',
          publishedAt: new Date(item.pubDate!).getTime(),
          scrapedAt: Date.now(),
          source: {
            id: source.id,
            name: source.name
          }
        }

        // 2. NLP Tagging
        const nlpResult = await analyzeArticle(article)

        // 3. Match gegen TopLocs Topics
        const matchedTopics: string[] = []
        const suggestedTopics: any[] = []

        for (const keyword of nlpResult.keywords) {
          // Fuzzy match gegen TopLocs Topics
          const topic = await findTopic(keyword)

          if (topic) {
            matchedTopics.push(topic.id)
          } else {
            suggestedTopics.push({
              name: keyword,
              confidence: nlpResult.topicScores[keyword] || 0.8
            })

            // Track für Auto-Promote
            await incrementSuggestedTopic(keyword, article.id)

            // Check Auto-Promote
            const suggestion = await getSuggestedTopic(keyword)
            if (await shouldAutoPromoteTopic(suggestion)) {
              const newTopicId = await createTopLocsTopic(suggestion)
              matchedTopics.push(newTopicId)
            }
          }
        }

        // 4. Location Extraction & Verification
        const matchedLocations: string[] = []
        const suggestedLocations: any[] = []

        for (const locationName of nlpResult.locations) {
          // Verify mit Nominatim
          const geoData = await verifyLocation(locationName)

          if (geoData && geoData.verified) {
            // Match gegen TopLocs Locations
            const location = await findLocation(locationName)

            if (location) {
              matchedLocations.push(location.id)
            } else {
              suggestedLocations.push(geoData)

              // Track für Auto-Promote
              await incrementSuggestedLocation(locationName, geoData, article.id)

              // Check Auto-Promote (niedrigerer Threshold!)
              const suggestion = await getSuggestedLocation(locationName)
              if (await shouldAutoPromoteLocation(suggestion)) {
                const locationIds = await createTopLocsLocationWithHierarchy(suggestion)
                matchedLocations.push(...locationIds)
              }
            }
          } else {
            suggestedLocations.push({
              name: locationName,
              confidence: 0.7,
              verified: false
            })
          }
        }

        // 5. Publish to Gun.js
        article.topics = matchedTopics
        article.locations = matchedLocations
        article.suggestedTopics = suggestedTopics
        article.suggestedLocations = suggestedLocations

        gun.get('news_plugin/articles')
           .get(article.id)
           .put(article)

        // 6. Update Indexes
        for (const topicId of matchedTopics) {
          gun.get('news_plugin/by_topic')
             .get(topicId)
             .set({
               articleId: article.id,
               relevance: 0.9,
               publishedAt: article.publishedAt
             })
        }

        for (const locationId of matchedLocations) {
          gun.get('news_plugin/by_location')
             .get(locationId)
             .set({
               articleId: article.id,
               relevance: 0.85,
               publishedAt: article.publishedAt
             })
        }

        console.log(`✅ Published: ${article.title}`)
      }
    } catch (err) {
      console.error(`❌ Error scraping ${source.name}:`, err)
    }
  }
}

// Run every hour
setInterval(scrapeAndTag, 3600000)
```

---

## 🎨 UI/UX Integration (aus news-plugin-reza)

### 3-Column Responsive Layout

```
┌─────────────────────────────────────────────────────────────┐
│                       HeaderBar                              │
│  (Gradient from indigo-600 → violet-600)                    │
├──────────────┬──────────────────────┬──────────────────────┤
│              │                      │                       │
│ SidebarLeft  │     FeedView         │    UserSidebar       │
│  (25% lg)    │     (50% lg)         │     (25% lg)         │
│              │                      │                       │
│ • Settings   │ • News Cards         │ • Notifications      │
│ • Interests  │ • Infinite Scroll    │ • Unread Badge       │
│ • Sources    │ • ArticleDetail      │ • User List          │
│              │                      │                       │
└──────────────┴──────────────────────┴──────────────────────┘

Breakpoints:
• lg (1024px+):  3 Columns
• md (768px):    2 Columns (Settings + Feed) | UserSidebar als OffcanvasDrawer
• sm (640px):    1 Column (Feed only) | Sidebars als BottomSheet
```

### Komponenten aus news-plugin-reza

#### 1. Layout-Komponenten

```vue
<!-- HeaderBar.vue -->
<template>
  <header class="h-16 bg-gradient-to-r from-indigo-600 to-violet-600">
    <div class="flex items-center justify-between px-6">
      <h1 class="text-2xl font-bold text-white">TopLocs News</h1>
      <UnreadBadge :count="unreadCount" />
    </div>
  </header>
</template>
```

```vue
<!-- FeedView.vue -->
<template>
  <div class="feed-view overflow-y-auto">
    <!-- News Cards -->
    <div class="grid gap-4 p-4">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        @click="showDetail(article)"
      />
    </div>

    <!-- Infinite Scroll Trigger -->
    <div ref="scrollTrigger" class="h-20"></div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <Loading />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const scrollTrigger = ref(null)
const { stop } = useIntersectionObserver(
  scrollTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore && !loading) {
      loadMore()
    }
  },
  {
    rootMargin: '200px',  // Trigger 200px before bottom
    threshold: 0.1
  }
)
</script>
```

#### 2. UnreadBadge Component

```vue
<!-- UnreadBadge.vue -->
<template>
  <div class="relative w-4 h-4">
    <Transition name="badge">
      <div
        v-if="count > 0"
        class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse"
      >
        {{ displayCount }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  count: number
}>()

const displayCount = computed(() =>
  props.count > 99 ? '99+' : props.count.toString()
)
</script>

<style scoped>
.badge-enter-active,
.badge-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.badge-enter-from {
  transform: scale(0);
  opacity: 0;
}

.badge-leave-to {
  transform: scale(1.2);
  opacity: 0;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(236, 72, 153, 0);
  }
}
</style>
```

#### 3. ArticleCard Component

```vue
<!-- ArticleCard.vue -->
<template>
  <div class="article-card group cursor-pointer">
    <!-- Image -->
    <div v-if="article.imageUrl" class="aspect-video overflow-hidden rounded-t-xl">
      <img
        :src="article.imageUrl"
        :alt="article.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        loading="lazy"
      />
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Topics -->
      <div class="flex flex-wrap gap-2 mb-2">
        <span
          v-for="topicId in article.topics.slice(0, 3)"
          :key="topicId"
          class="px-2 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-xs text-white font-medium"
        >
          {{ getTopicName(topicId) }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-slate-100 mb-2 line-clamp-2">
        {{ article.title }}
      </h3>

      <!-- Meta -->
      <div class="flex items-center gap-2 text-sm text-slate-400">
        <span>{{ article.source.name }}</span>
        <span>•</span>
        <span>{{ formatDate(article.publishedAt) }}</span>
        <span v-if="article.locations.length > 0">•</span>
        <span v-if="article.locations.length > 0" class="flex items-center gap-1">
          <MapPinIcon class="w-4 h-4" />
          {{ getLocationName(article.locations[0]) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  article: NewsArticle
}>()

// Lade Topic/Location Names aus Gun.js
async function getTopicName(topicId: string) {
  const topic = await gun.get(`topic/${topicId}/global`).then()
  return topic?.title || topicId
}

async function getLocationName(locationId: string) {
  const location = await gun.get(`location/${locationId}`).then()
  return location?.name || locationId
}
</script>

<style scoped>
.article-card {
  @apply bg-slate-800/50 rounded-xl overflow-hidden;
  @apply border border-slate-700/50;
  @apply hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20;
  @apply transition-all duration-200;
}
</style>
```

#### 4. ArticleDetail Modal

```vue
<!-- ArticleDetail.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="close"
      >
        <div class="relative w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          <!-- Close Button -->
          <button
            @click="close"
            class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 transition-colors"
          >
            <XMarkIcon class="w-6 h-6 text-slate-300" />
          </button>

          <!-- Hero Image -->
          <div class="relative h-96">
            <img
              v-if="article.imageUrl"
              :src="article.imageUrl"
              :alt="article.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>

            <!-- Title on Image -->
            <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>

              <!-- Meta -->
              <div class="flex items-center gap-4 text-sm">
                <span>{{ article.source.name }}</span>
                <span>•</span>
                <span>{{ formatDate(article.publishedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8">
            <!-- Topics & Locations -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span
                v-for="topicId in article.topics"
                :key="topicId"
                class="px-3 py-1.5 rounded-full bg-indigo-600/30 text-indigo-300 text-sm"
              >
                {{ getTopicName(topicId) }}
              </span>
              <span
                v-for="locationId in article.locations"
                :key="locationId"
                class="px-3 py-1.5 rounded-full bg-purple-600/30 text-purple-300 text-sm"
              >
                📍 {{ getLocationName(locationId) }}
              </span>
            </div>

            <!-- Description -->
            <p class="text-xl text-slate-300 mb-6 leading-relaxed">
              {{ article.description }}
            </p>

            <!-- Full Content -->
            <div class="prose prose-invert max-w-none">
              <p class="text-slate-300 leading-relaxed whitespace-pre-line">
                {{ article.content }}
              </p>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex gap-3">
              <a
                :href="article.url"
                target="_blank"
                class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Read Full Article
              </a>
              <button
                @click="bookmark"
                class="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                🔖 Bookmark
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

### Design System

```css
/* Gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-header: linear-gradient(to right, #4f46e5, #7c3aed);
--gradient-accent: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);

/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Animations */
.hover-scale {
  @apply transition-transform duration-200;
}

.hover-scale:hover {
  @apply scale-105;
}

/* Performance */
.gpu-accelerated {
  will-change: transform;
  transform: translateZ(0);
}
```

---

## 🔄 Personalisierter Feed (Relations-basiert)

### Feed-Generierung

```typescript
// useNewsFeed.ts
import { ref, computed, onMounted } from 'vue'
import gun from '../gun'
import { useProfile } from '@/composables/profileProvider'

export function useNewsFeed() {
  const { profile } = useProfile()
  const articles = ref<NewsArticle[]>([])
  const loading = ref(false)

  async function loadPersonalizedFeed() {
    loading.value = true
    articles.value = []

    // 1. Lese Profile Relations
    const interests = { topics: [], locations: [] }

    gun.get(profile.value.id)
       .get('relations')
       .map()
       .once((relation) => {
         if (!relation) return

         // Topic Relations (like, love, learn, teach)
         if (['like', 'love', 'learn', 'teach'].includes(relation.type)) {
           interests.topics.push(relation.two)  // Topic-ID
         }

         // Location Relations (visit, live, going, work)
         if (['visit', 'live', 'going', 'work'].includes(relation.type)) {
           interests.locations.push(relation.two)  // Location-ID
         }
       })

    // 2. Lade News für diese Topics
    for (const topicId of interests.topics) {
      gun.get('news_plugin/by_topic')
         .get(topicId)
         .map()
         .once((index) => {
           if (!index) return

           // Lade Article
           gun.get('news_plugin/articles')
              .get(index.articleId)
              .once((article) => {
                if (!article) return

                // Relevance Score hinzufügen
                article.relevance = index.relevance
                article.matchedVia = 'topic'
                article.matchedTopicId = topicId

                articles.value.push(article)
              })
         })
    }

    // 3. Lade News für diese Locations
    for (const locationId of interests.locations) {
      gun.get('news_plugin/by_location')
         .get(locationId)
         .map()
         .once((index) => {
           if (!index) return

           gun.get('news_plugin/articles')
              .get(index.articleId)
              .once((article) => {
                if (!article) return

                article.relevance = index.relevance
                article.matchedVia = 'location'
                article.matchedLocationId = locationId

                articles.value.push(article)
              })
         })
    }

    // 4. Deduplizieren & Sortieren
    const uniqueArticles = deduplicateByArticleId(articles.value)
    const sortedArticles = sortByRelevanceAndDate(uniqueArticles)

    articles.value = sortedArticles
    loading.value = false
  }

  onMounted(() => {
    loadPersonalizedFeed()
  })

  return {
    articles,
    loading,
    reload: loadPersonalizedFeed
  }
}

function sortByRelevanceAndDate(articles: NewsArticle[]) {
  return articles.sort((a, b) => {
    // 1. Sortiere nach Relevance (höher = besser)
    if (a.relevance !== b.relevance) {
      return b.relevance - a.relevance
    }

    // 2. Bei gleicher Relevance: neuere Artikel zuerst
    return b.publishedAt - a.publishedAt
  })
}
```

### Multi-Profile Support

```typescript
// Verschiedene Feeds für verschiedene Profile
const workProfile = {
  id: 'profile-work',
  relations: {
    topics: ['topic-ai', 'topic-business', 'topic-technology'],
    locations: ['location-sf', 'location-silicon-valley']
  }
}

const hobbyProfile = {
  id: 'profile-hobby',
  relations: {
    topics: ['topic-photography', 'topic-travel', 'topic-cooking'],
    locations: ['location-bali', 'location-paris', 'location-tokyo']
  }
}

// Feed für "Work"-Profil → Tech/Business News aus SF
const workFeed = await loadPersonalizedFeed(workProfile.id)

// Feed für "Hobby"-Profil → Photography/Travel News aus Bali
const hobbyFeed = await loadPersonalizedFeed(hobbyProfile.id)
```

---

## 📊 Performance-Optimierungen

### 1. Selective Subscriptions (aus news-plugin-reza)

```typescript
// ❌ BAD: Subscribe to ALL articles
gun.get('news_plugin/articles').map().on(...)

// ✅ GOOD: Subscribe nur zu relevanten Topics/Locations
const userTopics = ['topic-ai', 'topic-ml']

for (const topicId of userTopics) {
  gun.get('news_plugin/by_topic')
     .get(topicId)
     .map()
     .on((index) => {
       // Nur Articles für diesen Topic
     })
}
```

### 2. Virtual Scrolling

```vue
<template>
  <RecycleScroller
    :items="articles"
    :item-size="200"
    key-field="id"
    class="feed-scroller"
  >
    <template #default="{ item }">
      <ArticleCard :article="item" />
    </template>
  </RecycleScroller>
</template>
```

### 3. Image Optimization

```vue
<img
  :src="article.imageUrl"
  :srcset="`
    ${article.imageUrl}?w=400 400w,
    ${article.imageUrl}?w=800 800w,
    ${article.imageUrl}?w=1200 1200w
  `"
  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
  loading="lazy"
  decoding="async"
/>
```

### 4. Debounced Updates

```typescript
import { useDebounceFn } from '@vueuse/core'

const updateFilters = useDebounceFn((filters) => {
  // Expensive operation
  reloadFeed(filters)
}, 300)
```

### 5. Code Splitting

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          gun: ['gun'],
          ui: ['@heroicons/vue'],
          utils: ['@vueuse/core']
        }
      }
    }
  }
})
```

---

## 🧪 Testing

### Unit Tests

```typescript
// useNewsFeed.test.ts
import { describe, it, expect } from 'vitest'
import { useNewsFeed } from '../composables/useNewsFeed'

describe('useNewsFeed', () => {
  it('loads articles for profile topics', async () => {
    const profile = {
      id: 'profile-test',
      relations: [
        { type: 'like', two: 'topic-ai' },
        { type: 'love', two: 'topic-ml' }
      ]
    }

    const { articles, loadPersonalizedFeed } = useNewsFeed()

    await loadPersonalizedFeed(profile.id)

    expect(articles.value).toHaveLength(10)
    expect(articles.value.every(a =>
      a.topics.includes('topic-ai') || a.topics.includes('topic-ml')
    )).toBe(true)
  })

  it('auto-promotes topic after threshold', async () => {
    const suggestion = {
      slug: 'quantum-computing',
      count: 10,
      avgConfidence: 0.85,
      timeSpan: 7 * 86400000,
      uniqueSources: 3
    }

    const result = await shouldAutoPromoteTopic(suggestion)
    expect(result).toBe(true)

    const topicId = await createTopLocsTopic(suggestion)
    expect(topicId).toBeTruthy()
  })
})
```

---

## 🚀 Roadmap

### Phase 1: MVP (4-6 Wochen)
- ✅ NewsArticle Type mit topics[]/locations[]
- ✅ Gun.js Schema (by_topic, by_location)
- ✅ Basic Scraper (RSS + NLP)
- ✅ Topic/Location Matching
- ✅ Frequency Tracking (suggested_topics, suggested_locations)

### Phase 2: Layout & UI (2-3 Wochen)
- ✅ 3-Column Layout (HeaderBar, Sidebars, Feed)
- ✅ UnreadBadge Component
- ✅ ArticleCard + ArticleDetail
- ✅ Infinite Scroll (Intersection Observer)
- ✅ Responsive Breakpoints

### Phase 3: Auto-Promote (2-3 Wochen)
- ✅ Threshold-basierte Topic Creation (count >= 10)
- ✅ Threshold-basierte Location Creation (count >= 3 if verified)
- ✅ Geodaten-Verification (Nominatim API)
- ✅ Location-Hierarchie (City → State → Country)
- ✅ Community Curation UI

### Phase 4: Polish & Performance (2-3 Wochen)
- ✅ Virtual Scrolling (RecycleScroller)
- ✅ Image Optimization (srcset, lazy)
- ✅ Code Splitting
- ✅ E2E Tests (Playwright)
- ✅ Dokumentation finalisieren

### Phase 5: Advanced Features (Future)
- [ ] ML-based Topic/Location Matching
- [ ] Push Notifications
- [ ] Offline Support (Service Worker)
- [ ] Full-Text Search
- [ ] User Feedback Loop (correct/incorrect tags)
- [ ] Browser Extension

---

## 📁 Finale Projektstruktur

```
news-plugin/
├── NEWS_PLUGIN_KONZEPT.md              # Dieses Dokument
├── docs/
│   ├── ARCHITECTURE.md                 # System-Architektur
│   ├── FEATURES.md                     # Feature-Liste
│   ├── INTEGRATION.md                  # TopLocs Integration
│   ├── AUTO_PROMOTE.md                 # Auto-Promote System
│   ├── UI_COMPONENTS.md                # UI-Komponenten
│   ├── GUN_SCHEMA.md                   # Gun.js Datenmodell
│   ├── SCRAPER_SERVICE.md              # Scraper Details
│   ├── ROADMAP.md                      # Implementierungs-Plan
│   └── API_REFERENCE.md                # API Docs
├── scraper/                            # Scraping Service
│   ├── src/
│   │   ├── scraper.ts                  # Main Scraper
│   │   ├── nlp.ts                      # NLP Tagging
│   │   ├── topicMatcher.ts             # TopLocs Topic Matching
│   │   ├── locationVerifier.ts         # Geodaten-Verification
│   │   ├── autoPromote.ts              # Auto-Promote Logic
│   │   └── gun.ts                      # Gun.js Client
│   ├── package.json
│   └── Dockerfile
├── src/                                # Plugin (Vue 3)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── HeaderBar.vue
│   │   │   ├── SidebarLeft.vue
│   │   │   ├── FeedView.vue
│   │   │   ├── UserSidebar.vue
│   │   │   ├── BottomSheet.vue
│   │   │   └── OffcanvasDrawer.vue
│   │   ├── notifications/
│   │   │   └── UnreadBadge.vue
│   │   ├── articles/
│   │   │   ├── ArticleCard.vue
│   │   │   ├── ArticleDetail.vue
│   │   │   └── ArticleList.vue
│   │   └── curation/
│   │       ├── SuggestedTopicsPanel.vue
│   │       └── SuggestedLocationsPanel.vue
│   ├── composables/
│   │   ├── useNewsFeed.ts              # Personalisierter Feed
│   │   ├── useTopicMatching.ts         # Topic Matching
│   │   ├── useLocationVerification.ts  # Location Verification
│   │   └── useAutoPromote.ts           # Auto-Promote Logic
│   ├── types/
│   │   └── news.ts                     # TypeScript Types
│   ├── gun.ts                          # Gun.js Config
│   ├── config.ts                       # Plugin Config
│   └── main.ts                         # Entry Point
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## ✅ Zusammenfassung

### Was ist neu (Version 2.0)?

1. **✅ Vollständige TopLocs Integration**
   - News referenzieren bestehende Topics/Locations (IDs)
   - User-Interessen aus Profile Relations
   - Multi-Profile Support (Work, Hobby, Family)

2. **✅ Auto-Promote System**
   - Topics: Threshold 10 Artikel, 7 Tage, 3 Quellen
   - Locations: Threshold 3 Artikel (wenn verifiziert), sofort
   - Geodaten-Verification via Nominatim API
   - Location-Hierarchie Auto-Creation (City → State → Country)

3. **✅ UI/UX aus news-plugin-reza**
   - 3-Column Responsive Layout
   - UnreadBadge Component
   - ArticleCard mit Gradient Design
   - ArticleDetail Hero-Image Modal
   - Infinite Scroll (Intersection Observer)

4. **✅ Performance-Optimierungen**
   - Virtual Scrolling (RecycleScroller)
   - Selective Subscriptions (nur relevante Topics/Locations)
   - Image Optimization (srcset, lazy loading)
   - Code Splitting (manualChunks)
   - Debounced Updates

5. **✅ Keine Duplikate**
   - Keine eigenen Category/Tags Schemas
   - Keine Duplikation von Location-Daten (lat/lng)
   - Keine Duplikation von User-Interessen

---

**Status:** ✅ Ready for Implementation
**Nächster Schritt:** Review mit GPT-5 → Implementation Start (Phase 1)

**Version:** 2.0
**Author:** Claude + Reza
**Date:** 2025-10-07

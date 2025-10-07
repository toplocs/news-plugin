# API Reference

## Composables

### `useNewsFeed()`

```typescript
const { articles, loading, reload } = useNewsFeed()

// Load personalized feed basierend auf Profile Relations
await loadPersonalizedFeed(profileId)
```

### `useTopicMatching()`

```typescript
// Match NLP keywords gegen TopLocs Topics
const { matchTopic } = useTopicMatching()
const topicId = await matchTopic('artificial intelligence')
```

### `useLocationVerification()`

```typescript
// Verify Location mit Nominatim API
const { verifyLocation } = useLocationVerification()
const geoData = await verifyLocation('San Francisco')
// → { lat, lng, verified: true, osm_id }
```

### `useAutoPromote()`

```typescript
// Check & Execute Auto-Promote
const { shouldPromote, promote } = useAutoPromote()

if (await shouldPromote('quantum-computing', 'topic')) {
  const topicId = await promote('quantum-computing')
}
```

## Gun.js Queries

```typescript
// Load articles for topic
gun.get('news_plugin/by_topic/topic-ai')
   .map()
   .once((index) => { /* ... */ })

// Track suggested topic
gun.get('news_plugin/suggested_topics/quantum-computing')
   .put({ count: 5, avgConfidence: 0.86 })
```

## Types

→ Siehe [../NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md#-datenmodell-toplocs-integriert)

# Gun.js Datenmodell

→ Siehe Details: [../NEWS_PLUGIN_KONZEPT.md](../NEWS_PLUGIN_KONZEPT.md#-datenmodell-toplocs-integriert)

## Schema Overview

```
gun.get('news_plugin/articles/{id}')
  → topics: string[]           # TopLocs Topic-IDs
  → locations: string[]        # TopLocs Location-IDs
  → suggestedTopics: [...]
  → suggestedLocations: [...]

gun.get('news_plugin/by_topic/{topic-id}')
  → set({ articleId, relevance, publishedAt })

gun.get('news_plugin/by_location/{location-id}')
  → set({ articleId, relevance, publishedAt })

gun.get('news_plugin/suggested_topics/{slug}')
  → { count, confidence, status, topicId }

gun.get('news_plugin/suggested_locations/{slug}')
  → { count, verified, lat, lng, locationId }
```

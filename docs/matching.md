# Matching & Discovery Algorithm

## Interest-Based Matching

### Score Calculation

```typescript
calculateArticleScore(article: NewsArticle): number {
  // 1. Keyword Matching (exact + fuzzy)
  const keywordScore = matchKeywords(article.topics, userInterests)
  
  // 2. Recency Bonus
  const ageInDays = (Date.now() - article.publishedAt) / MS_PER_DAY
  const recencyBonus = ageInDays < 1 ? 0.2 : ageInDays < 7 ? 0.1 : 0.05
  
  // 3. Final Score
  return Math.min(1.0, keywordScore + recencyBonus)
}
```

### Filtering

```typescript
filterArticlesByInterests(articles, minScore = 0.15): NewsArticle[] {
  return articles
    .map(a => ({ article: a, score: calculateScore(a) }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article)
}
```

**No Fallback:** If no articles match, show empty state (Phase 2 fix)

## User Matching

### Match Score Components

```typescript
interface MatchScore {
  interestOverlap: number    // 40% weight
  locationProximity: number  // 30% weight
  activityMatch: number      // 20% weight
  trustScore: number         // 10% weight
}
```

### Algorithm

```typescript
calculateUserMatch(user1, user2): number {
  const interests = calculateInterestOverlap(user1.interests, user2.interests)
  const location = calculateDistance(user1.location, user2.location)
  const activity = calculateActivityMatch(user1.behavior, user2.behavior)
  const trust = getTrustScore(user1, user2)
  
  return (
    interests * 0.4 +
    (1 - location / MAX_DISTANCE) * 0.3 +
    activity * 0.2 +
    trust * 0.1
  )
}
```

## Behavioral Learning

### Tracking

```typescript
// Click tracking
trackArticleClick(article) => {
  addOrUpdateInterest(article.topics, source: 'behavioral')
}

// Reading time
trackReadTime(article, seconds) => {
  increaseConfidence(article.topics, weight: seconds / 60)
}
```

### Confidence Updates

```typescript
// Initial: 0.3 (low)
// After 1 click: 0.5 (medium)
// After 3+ clicks: 0.8+ (high)
// After 5+ with long read times: 0.95 (very high)
```

---

**Performance:** All calculations < 10ms, optimized with caching

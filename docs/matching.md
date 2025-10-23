# 🎯 Discovery & Matching Logic - TopLocs News Plugin

**Version:** 2.0
**Last Updated:** 2025-10-24

---

## 🧠 Discovery System

### Hybrid Scoring Algorithm

**Components:**
1. Interest Matching (70% weight)
2. Location Proximity (30% weight)

---

## 📊 Interest Matching

### Algorithm
```typescript
const interestScore = (userInterests, articleTopics) => {
  const matches = userInterests.filter(i => 
    articleTopics.some(t => 
      t.toLowerCase().includes(i.toLowerCase())
    )
  )
  return matches.length / userInterests.length
}
```

**Example:**
```
User Interests: ['AI', 'Technology', 'Climate']
Article Topics: ['AI', 'Machine Learning']

Interest Score: 1/3 = 0.33 (33%)
```

---

## 📍 Location Proximity

### Haversine Distance Formula
```typescript
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
```

### Distance Score
```typescript
const distanceScore = (distance, maxRadius) => {
  if (distance > maxRadius) return 0
  return 1 - (distance / maxRadius)
}
```

---

## 🎯 Hybrid Score

### Combined Formula
```typescript
const hybridScore = (interests, location, weights) => {
  const interestScore = calculateInterestScore(interests)
  const locationScore = calculateLocationScore(location)
  
  return (
    interestScore * weights.interest +
    locationScore * weights.location
  )
}
```

**Default Weights:**
- Interest: 0.7 (70%)
- Location: 0.3 (30%)

**Example:**
```
Interest Score: 0.8
Location Score: 0.5

Hybrid Score = 0.8 * 0.7 + 0.5 * 0.3
             = 0.56 + 0.15
             = 0.71 (71% match!)
```


# 📋 NEXT STEPS - Effektiver & Produktiver Plan

**Datum:** 2025-10-22
**Status:** Nach Roadmap-Analyse

---

## ✅ WAS EXISTIERT (FERTIG)

### Phase 1 (Teilweise)
- ✅ NewsArticle Type (src/types/index.ts)
- ✅ Gun.js Config (src/services/gun.ts)
- ✅ RSS Service (src/services/rssService.ts) - 10+ Quellen
- ✅ Auto-Promote Service (src/services/autoPromoteService.ts)
- ✅ Geocode Service (src/services/geocodeService.ts)

### Phase 2 (Komplett)
- ✅ 3-Column Layout (NewsLayout.vue)
- ✅ HeaderBar, Sidebars, FeedView
- ✅ ArticleCard Components
- ✅ Responsive Design

### Phase 3 (Komplett)
- ✅ Auto-Promote UI (CurationDashboard.vue)
- ✅ Suggested Topics/Locations
- ✅ Community Curation

---

## ❌ WAS FEHLT (KRITISCH)

### 1. NLP Service ⚠️ **HÖCHSTE PRIORITÄT**
**Problem:** Artikel haben keine Topics/Locations!
**Fehlt:**
- `src/services/nlpService.ts` - Extrahiert Topics/Locations aus Text
- Keyword-Extraction
- Named Entity Recognition (Locations)
- Simple regex-based extraction als MVP

**Impact:** Ohne NLP können Artikel nicht personalisiert werden!

### 2. Topic Matcher ⚠️ **HOHE PRIORITÄT**
**Problem:** Extracted Topics werden nicht gegen TopLocs gemapped!
**Fehlt:**
- `src/services/topicMatcher.ts` - Matched extracted topics gegen TopLocs
- Fuzzy matching (z.B. "AI" → "topic-ai")
- Synonym-Handling

**Impact:** Artikel werden nicht den richtigen TopLocs Topics zugeordnet!

### 3. Gun.js Article Storage ⚠️ **HOHE PRIORITÄT**
**Problem:** Artikel werden nicht in Gun.js gespeichert!
**Fehlt:**
- `gun.get('news_plugin/articles/{id}').put(article)`
- `gun.get('news_plugin/by_topic/{topic-id}').set(articleRef)`
- `gun.get('news_plugin/by_location/{location-id}').set(articleRef)`

**Impact:** Keine P2P-Sync, keine Persistenz!

---

## 🎯 NEXT STEPS (PRIORISIERT)

### Step 1: NLP Service (2-3 Stunden) ⭐
**Ziel:** Extrahiere Topics & Locations aus Artikel-Text

**Tasks:**
1. Create `src/services/nlpService.ts`
2. Implement keyword extraction (simple frequency-based)
3. Implement location extraction (regex + common patterns)
4. Add to newsService.ts pipeline

**Deliverable:**
```typescript
// Input: Article text
// Output: { topics: ['AI', 'Technology'], locations: ['Berlin', 'Germany'] }
nlpService.extractEntities(articleText)
```

### Step 2: Topic Matcher (1-2 Stunden) ⭐
**Ziel:** Match extracted topics gegen TopLocs Topics

**Tasks:**
1. Create `src/services/topicMatcher.ts`
2. Fetch TopLocs topics from Gun.js
3. Implement fuzzy matching
4. Return TopLocs topic IDs

**Deliverable:**
```typescript
// Input: ['AI', 'Machine Learning']
// Output: ['topic-ai', 'topic-machine-learning']
topicMatcher.matchTopics(extractedTopics)
```

### Step 3: Gun.js Integration (2-3 Stunden) ⭐
**Ziel:** Speichere Artikel in Gun.js P2P

**Tasks:**
1. Update `newsService.ts` to store articles
2. Implement `gun.get('news_plugin/articles/{id}').put()`
3. Implement indexes (by_topic, by_location)
4. Add timestamp + publisher metadata

**Deliverable:**
```typescript
// Articles stored in Gun.js
gun.get('news_plugin/articles/article-123')
gun.get('news_plugin/by_topic/topic-ai').map() // → articles
```

### Step 4: Full Pipeline Test (1 Stunde)
**Ziel:** End-to-End Test

**Flow:**
1. RSS Service fetches articles
2. NLP Service extracts entities
3. Topic Matcher maps to TopLocs
4. Gun.js stores articles
5. UI displays personalized feed

**Test:**
```bash
# Fetch 10 articles
# Extract topics/locations
# Match to TopLocs
# Store in Gun.js
# Verify in UI
```

---

## 📊 TIMELINE

```
Total Time: 6-9 Stunden (1 Tag)

Hour 1-3:  NLP Service Implementation
Hour 4-5:  Topic Matcher Implementation
Hour 6-8:  Gun.js Integration
Hour 9:    Testing & Debugging
```

---

## 🚀 SUCCESS CRITERIA

### NLP Service
- [ ] Extracts 3-5 relevant keywords per article
- [ ] Identifies at least 1 location per article (if mentioned)
- [ ] Handles German + English articles
- [ ] Performance: < 100ms per article

### Topic Matcher
- [ ] Matches 70%+ of extracted topics to TopLocs
- [ ] Handles synonyms (e.g., "KI" → "AI")
- [ ] Fallback: creates suggested topics

### Gun.js Integration
- [ ] All articles stored with unique IDs
- [ ] by_topic index works
- [ ] by_location index works
- [ ] P2P sync verified (open in 2 tabs)

### Full Pipeline
- [ ] RSS → NLP → Match → Store works end-to-end
- [ ] User sees personalized feed based on their interests
- [ ] Articles have correct topics/locations
- [ ] Performance: Feed loads < 2s

---

## 📁 FILES TO CREATE/MODIFY

### New Files
```
src/services/nlpService.ts          (~200 lines)
src/services/topicMatcher.ts        (~150 lines)
tests/unit/nlpService.test.ts       (~100 lines)
tests/unit/topicMatcher.test.ts     (~100 lines)
```

### Modified Files
```
src/services/newsService.ts         (add NLP + Storage)
src/services/gun.ts                 (add article schemas)
src/stores/useNewsStore.ts          (read from Gun.js)
```

---

## 🎯 AFTER THIS IS DONE

**We will have:**
- ✅ Complete MVP Pipeline (RSS → NLP → Match → Store → Display)
- ✅ Personalized News Feed (based on user interests)
- ✅ P2P Article Storage (Gun.js)
- ✅ Auto-Discovery (suggested topics/locations)

**Then we can:**
- Improve NLP (better keyword extraction)
- Add more RSS sources
- Improve UI/UX
- Add real-time notifications
- Deploy to production

---

## 🎊 READY TO START?

**Command to start:**
```bash
# Step 1: Create NLP Service
# I will create src/services/nlpService.ts
```

**Focus:**
- Keep it simple (MVP first)
- Test each step
- Document as we go
- No gaming, pure News Plugin!

---

**Status:** ✅ PLAN READY
**Next:** Implement Step 1 (NLP Service)

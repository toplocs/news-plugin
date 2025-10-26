/**
 * 🧠 REAL SENTIMENT ANALYSIS SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Echte NLP & Machine Learning mit Open Source Libraries:
 * - sentiment.js → Sentiment Scores
 * - natural.js → Tokenization, Stemming, Classification
 * - compromise.js → Text Understanding
 *
 * Analysiert:
 * - Event Reviews & Comments
 * - Chat Messages
 * - User Feedback
 * - Social Media Posts
 *
 * Created: 2025-10-26
 * ═══════════════════════════════════════════════════════════════════
 */

import Sentiment from 'sentiment'
import natural from 'natural'
import nlp from 'compromise'

// Initialize libraries
const sentiment = new Sentiment()
const tokenizer = new natural.WordTokenizer()
const TfIdf = natural.TfIdf
const classifier = new natural.BayesClassifier()

export interface SentimentScore {
  score: number              // -Infinity to +Infinity
  comparative: number        // Normalized score (-1 to +1)
  tokens: string[]
  words: string[]
  positive: string[]
  negative: string[]
}

export interface TextAnalysis {
  text: string

  // Sentiment
  sentiment: SentimentScore
  emotion: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive'
  emotionScore: number       // 0-100

  // NLP Analysis
  entities: Array<{
    type: 'person' | 'place' | 'organization' | 'event' | 'other'
    text: string
    confidence: number
  }>

  keywords: Array<{
    word: string
    score: number
  }>

  topics: string[]
  language: string

  // Classification
  category: 'complaint' | 'praise' | 'question' | 'feedback' | 'neutral'
  intent: 'booking' | 'inquiry' | 'review' | 'chat' | 'other'

  // Quality Metrics
  toxicity: number           // 0-100
  spam: number               // 0-100
  quality: number            // 0-100
}

export interface EventVibeAnalysis {
  eventId: string

  // Overall Vibe
  overallVibe: number        // 0-100 (Energy Level)
  vibeDescription: string
  sentiment: 'negative' | 'neutral' | 'positive'

  // Data Sources
  reviewCount: number
  reviewSentiment: number    // Average sentiment
  chatSentiment: number      // Chat messages sentiment
  photoSentiment: number     // Photo caption sentiment

  // Detailed Analysis
  topEmotions: Array<{
    emotion: string
    percentage: number
  }>

  topKeywords: string[]
  commonComplaints: string[]
  commonPraise: string[]

  // Predictions
  predictedSatisfaction: number  // 0-100
  recommendationScore: number    // 0-100
  returnProbability: number      // 0-100

  lastUpdated: number
}

/**
 * 🧠 Sentiment Analysis Service
 */
class SentimentAnalysisService {
  private eventVibes = new Map<string, EventVibeAnalysis>()
  private tfidf = new TfIdf()

  // Toxic words list (in production: use Google Perspective API)
  private toxicWords = new Set([
    'spam', 'scam', 'fake', 'terrible', 'worst', 'horrible',
    'hate', 'awful', 'disaster', 'garbage', 'trash'
  ])

  /**
   * 📊 Analyze Text
   */
  analyzeText(text: string): TextAnalysis {
    // Basic sentiment analysis
    const sentimentResult = sentiment.analyze(text)

    // Tokenize
    const tokens = tokenizer.tokenize(text.toLowerCase())

    // Extract entities with compromise
    const doc = nlp(text)
    const entities = [
      ...doc.people().out('array').map((t: string) => ({ type: 'person' as const, text: t, confidence: 0.8 })),
      ...doc.places().out('array').map((t: string) => ({ type: 'place' as const, text: t, confidence: 0.8 })),
      ...doc.organizations().out('array').map((t: string) => ({ type: 'organization' as const, text: t, confidence: 0.7 }))
    ]

    // Extract keywords using TF-IDF
    this.tfidf.addDocument(text)
    const keywords: Array<{ word: string; score: number }> = []
    this.tfidf.listTerms(0).forEach((item: any) => {
      if (item.tfidf > 0.1) {
        keywords.push({ word: item.term, score: item.tfidf })
      }
    })

    // Detect topics
    const topics = doc.topics().out('array') as string[]

    // Calculate emotion score (0-100)
    const emotionScore = this.calculateEmotionScore(sentimentResult.comparative)

    // Classify emotion
    const emotion = this.classifyEmotion(sentimentResult.comparative)

    // Detect category
    const category = this.detectCategory(text, sentimentResult)

    // Detect intent
    const intent = this.detectIntent(text)

    // Calculate quality metrics
    const toxicity = this.calculateToxicity(text, tokens || [])
    const spam = this.calculateSpamScore(text, tokens || [])
    const quality = this.calculateQuality(text, sentimentResult, toxicity, spam)

    return {
      text,
      sentiment: sentimentResult,
      emotion,
      emotionScore,
      entities,
      keywords,
      topics,
      language: 'de', // In production: use language detection
      category,
      intent,
      toxicity,
      spam,
      quality
    }
  }

  /**
   * 🎉 Analyze Event Vibe
   */
  analyzeEventVibe(
    eventId: string,
    data: {
      reviews?: string[]
      chatMessages?: string[]
      photoCaptions?: string[]
    }
  ): EventVibeAnalysis {
    const reviews = data.reviews || []
    const chatMessages = data.chatMessages || []
    const photoCaptions = data.photoCaptions || []

    // Analyze all text sources
    const reviewAnalyses = reviews.map(r => this.analyzeText(r))
    const chatAnalyses = chatMessages.map(m => this.analyzeText(m))
    const photoAnalyses = photoCaptions.map(p => this.analyzeText(p))

    // Calculate average sentiments
    const reviewSentiment = this.averageSentiment(reviewAnalyses)
    const chatSentiment = this.averageSentiment(chatAnalyses)
    const photoSentiment = this.averageSentiment(photoAnalyses)

    // Overall sentiment (weighted)
    const overallSentimentScore =
      reviewSentiment * 0.5 +
      chatSentiment * 0.3 +
      photoSentiment * 0.2

    // Calculate vibe (0-100)
    const overallVibe = Math.round(((overallSentimentScore + 1) / 2) * 100)

    // Extract top emotions
    const allAnalyses = [...reviewAnalyses, ...chatAnalyses, ...photoAnalyses]
    const emotions = this.extractTopEmotions(allAnalyses)

    // Extract keywords
    const topKeywords = this.extractTopKeywords(allAnalyses)

    // Find complaints & praise
    const commonComplaints = this.findCommonPatterns(allAnalyses.filter(a => a.sentiment.comparative < -0.2))
    const commonPraise = this.findCommonPatterns(allAnalyses.filter(a => a.sentiment.comparative > 0.2))

    // Predictions
    const predictedSatisfaction = this.predictSatisfaction(overallVibe, allAnalyses)
    const recommendationScore = this.calculateRecommendationScore(allAnalyses)
    const returnProbability = this.calculateReturnProbability(allAnalyses)

    const vibeAnalysis: EventVibeAnalysis = {
      eventId,
      overallVibe,
      vibeDescription: this.getVibeDescription(overallVibe),
      sentiment: this.classifyOverallSentiment(overallSentimentScore),
      reviewCount: reviews.length,
      reviewSentiment,
      chatSentiment,
      photoSentiment,
      topEmotions: emotions,
      topKeywords,
      commonComplaints,
      commonPraise,
      predictedSatisfaction,
      recommendationScore,
      returnProbability,
      lastUpdated: Date.now()
    }

    this.eventVibes.set(eventId, vibeAnalysis)

    return vibeAnalysis
  }

  /**
   * 📈 Get Event Vibe
   */
  getEventVibe(eventId: string): EventVibeAnalysis | undefined {
    return this.eventVibes.get(eventId)
  }

  /**
   * 🔍 Detect Fake Reviews
   */
  detectFakeReview(review: string): {
    isFake: boolean
    confidence: number
    reasons: string[]
  } {
    const analysis = this.analyzeText(review)
    const reasons: string[] = []
    let fakeScore = 0

    // Too positive (suspiciously perfect)
    if (analysis.sentiment.comparative > 0.8) {
      fakeScore += 30
      reasons.push('Unrealistically positive')
    }

    // Generic/spam keywords
    if (analysis.spam > 70) {
      fakeScore += 40
      reasons.push('Contains spam patterns')
    }

    // Too short
    if (review.length < 20) {
      fakeScore += 20
      reasons.push('Too short for genuine review')
    }

    // No specific details
    if (analysis.entities.length === 0 && analysis.keywords.length < 3) {
      fakeScore += 30
      reasons.push('Lacks specific details')
    }

    // Toxic language in "positive" review
    if (analysis.toxicity > 50 && analysis.sentiment.comparative > 0.5) {
      fakeScore += 50
      reasons.push('Contradictory sentiment/toxicity')
    }

    return {
      isFake: fakeScore > 50,
      confidence: Math.min(100, fakeScore),
      reasons
    }
  }

  // === PRIVATE METHODS ===

  private calculateEmotionScore(comparative: number): number {
    // Map -1 to +1 → 0 to 100
    return Math.round(((comparative + 1) / 2) * 100)
  }

  private classifyEmotion(comparative: number): TextAnalysis['emotion'] {
    if (comparative < -0.6) return 'very_negative'
    if (comparative < -0.2) return 'negative'
    if (comparative > 0.6) return 'very_positive'
    if (comparative > 0.2) return 'positive'
    return 'neutral'
  }

  private detectCategory(text: string, sentimentResult: SentimentScore): TextAnalysis['category'] {
    const lowerText = text.toLowerCase()

    if (sentimentResult.comparative < -0.3) {
      if (lowerText.includes('problem') || lowerText.includes('issue') || lowerText.includes('schlecht')) {
        return 'complaint'
      }
    }

    if (sentimentResult.comparative > 0.3) {
      if (lowerText.includes('great') || lowerText.includes('amazing') || lowerText.includes('toll')) {
        return 'praise'
      }
    }

    if (lowerText.includes('?')) {
      return 'question'
    }

    if (lowerText.includes('suggest') || lowerText.includes('should') || lowerText.includes('könnte')) {
      return 'feedback'
    }

    return 'neutral'
  }

  private detectIntent(text: string): TextAnalysis['intent'] {
    const lowerText = text.toLowerCase()

    if (lowerText.includes('book') || lowerText.includes('reserve') || lowerText.includes('buchen')) {
      return 'booking'
    }

    if (lowerText.includes('when') || lowerText.includes('where') || lowerText.includes('how') || lowerText.includes('wann') || lowerText.includes('wo')) {
      return 'inquiry'
    }

    if (lowerText.includes('was') || lowerText.includes('attended') || lowerText.includes('war')) {
      return 'review'
    }

    if (lowerText.includes('hey') || lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hallo')) {
      return 'chat'
    }

    return 'other'
  }

  private calculateToxicity(text: string, tokens: string[]): number {
    if (!tokens) return 0

    let toxicCount = 0
    tokens.forEach(token => {
      if (this.toxicWords.has(token)) {
        toxicCount++
      }
    })

    return Math.min(100, (toxicCount / Math.max(tokens.length, 1)) * 300)
  }

  private calculateSpamScore(text: string, tokens: string[]): number {
    if (!tokens) return 0

    let spamScore = 0

    // Too many capital letters
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
    if (capsRatio > 0.5) spamScore += 30

    // Too many exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length
    if (exclamationCount > 3) spamScore += 20

    // Repeated words
    const uniqueTokens = new Set(tokens)
    const repetitionRatio = 1 - (uniqueTokens.size / Math.max(tokens.length, 1))
    spamScore += repetitionRatio * 50

    return Math.min(100, spamScore)
  }

  private calculateQuality(text: string, sentimentResult: SentimentScore, toxicity: number, spam: number): number {
    let quality = 100

    // Length penalty (too short)
    if (text.length < 20) quality -= 30
    if (text.length < 10) quality -= 20

    // Toxicity penalty
    quality -= toxicity * 0.5

    // Spam penalty
    quality -= spam * 0.7

    // Extreme sentiment penalty (suspiciously one-sided)
    if (Math.abs(sentimentResult.comparative) > 0.8) quality -= 10

    return Math.max(0, Math.round(quality))
  }

  private averageSentiment(analyses: TextAnalysis[]): number {
    if (analyses.length === 0) return 0

    const sum = analyses.reduce((acc, a) => acc + a.sentiment.comparative, 0)
    return sum / analyses.length
  }

  private extractTopEmotions(analyses: TextAnalysis[]): Array<{ emotion: string; percentage: number }> {
    const emotionCounts: Record<string, number> = {}

    analyses.forEach(a => {
      emotionCounts[a.emotion] = (emotionCounts[a.emotion] || 0) + 1
    })

    const total = analyses.length

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)
  }

  private extractTopKeywords(analyses: TextAnalysis[]): string[] {
    const keywordScores: Record<string, number> = {}

    analyses.forEach(a => {
      a.keywords.forEach(kw => {
        keywordScores[kw.word] = (keywordScores[kw.word] || 0) + kw.score
      })
    })

    return Object.entries(keywordScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }

  private findCommonPatterns(analyses: TextAnalysis[]): string[] {
    // Find most common keywords in negative/positive reviews
    return this.extractTopKeywords(analyses).slice(0, 5)
  }

  private predictSatisfaction(vibe: number, analyses: TextAnalysis[]): number {
    // Simple prediction based on vibe + quality
    const avgQuality = analyses.reduce((sum, a) => sum + a.quality, 0) / Math.max(analyses.length, 1)
    return Math.round(vibe * 0.7 + avgQuality * 0.3)
  }

  private calculateRecommendationScore(analyses: TextAnalysis[]): number {
    const positiveCount = analyses.filter(a => a.sentiment.comparative > 0.2).length
    const total = analyses.length

    return Math.round((positiveCount / Math.max(total, 1)) * 100)
  }

  private calculateReturnProbability(analyses: TextAnalysis[]): number {
    // Based on sentiment + quality
    const avgSentiment = this.averageSentiment(analyses)
    const avgQuality = analyses.reduce((sum, a) => sum + a.quality, 0) / Math.max(analyses.length, 1)

    const probability = ((avgSentiment + 1) / 2) * 60 + avgQuality * 0.4
    return Math.round(probability)
  }

  private getVibeDescription(vibe: number): string {
    if (vibe < 20) return '😞 Sehr negativ - Event hatte Probleme'
    if (vibe < 40) return '😐 Eher negativ - Verbesserungsbedarf'
    if (vibe < 60) return '😊 Neutral bis positiv - Solides Event'
    if (vibe < 80) return '🎉 Positiv - Gut gelaufenes Event'
    return '🔥 Sehr positiv - Exzellentes Event!'
  }

  private classifyOverallSentiment(score: number): 'negative' | 'neutral' | 'positive' {
    if (score < -0.2) return 'negative'
    if (score > 0.2) return 'positive'
    return 'neutral'
  }

  /**
   * 🧪 Generate Test Data
   */
  generateTestData(eventId: string): EventVibeAnalysis {
    const reviews = [
      'Amazing event! Best party I\'ve been to in Nürnberg! 🎉',
      'The music was great, but the venue was too crowded.',
      'Had an awesome time! Will definitely come again! ⭐⭐⭐⭐⭐',
      'Location was perfect, DJ was fantastic!',
      'Too expensive for what it was. Disappointed.',
      'Great atmosphere, friendly people, amazing vibes!',
      'Sound system could be better, but overall good event.',
      'Met so many cool people! Loved it! 😊'
    ]

    const chatMessages = [
      'This is lit! 🔥',
      'Where\'s the bar?',
      'Best night ever!',
      'Anyone up for afterparty?',
      'Love this song!',
      'Who\'s the DJ?',
      'Great crowd tonight!',
      'This event is amazing!'
    ]

    const photoCaptions = [
      'Epic night with friends! ❤️',
      'Party time! 🎊',
      'Best crew ever!',
      'Unforgettable moments',
      'Living my best life!'
    ]

    return this.analyzeEventVibe(eventId, {
      reviews,
      chatMessages,
      photoCaptions
    })
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService()

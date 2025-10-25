/**
 * 🎉 EVENT TRANSPARENCY SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Das REVOLUTIONÄRE Feature:
 * Sehe WER zu Events geht, BEVOR du ein Ticket kaufst!
 *
 * Features:
 * - Demographics (Kultur, Alter, Interessen)
 * - Participant Insights
 * - Privacy-First mit Opt-In
 * - Social Vibe Scoring
 * - Group Type Distribution
 *
 * Created: 2025-10-24
 * ═══════════════════════════════════════════════════════════════════
 */

export interface EventTransparency {
  eventId: string

  // Demographics
  demographics: Array<{
    category: 'culture' | 'nationality' | 'language' | 'age-group'
    name: string          // 'Latinos', 'Indians', 'Germans', etc.
    icon: string          // '🌎', '🇮🇳', '🇩🇪'
    count: number         // 45 people
    percentage: number    // 45%
  }>

  // Age Distribution
  ageGroups: Array<{
    range: string         // '18-25', '26-35', etc.
    count: number
    percentage: number
  }>

  // Interest Distribution
  topInterests: Array<{
    name: string          // 'Foodies', 'Music Lovers', 'Tech'
    icon: string          // '🍕', '🎵', '💻'
    count: number
    percentage: number
  }>

  // Social Vibe
  vibeScore: number       // 0.0 (ruhig) - 1.0 (party)
  vibeDescription: string // "Entspannte Atmosphäre mit lebhaften Momenten"

  // Group Types
  groupTypes: {
    solo: number          // Solo-Teilnehmer
    couples: number       // Paare
    groups: number        // Freundesgruppen
    families: number      // Familien
  }

  // Teilnehmer-Details (opt-in)
  visibleAttendees: Array<{
    id: string
    name: string
    avatar: string
    age?: number
    interests: string[]
    topInterest: string
    groupType: 'solo' | 'couple' | 'group' | 'family'
    isPublic: boolean     // Sichtbarkeit opt-in
  }>

  // Privacy Settings
  totalAttendees: number  // Total (inkl. private)
  publicAttendees: number // Nur öffentliche

  // Stats
  diversityScore: number  // 0-100 (wie divers ist die Crowd?)
  energyLevel: number     // 0-100 (wie energetisch?)
  recommendationScore: number // 0-100 (Empfehlungs-Score)
}

export interface EventWithTransparency {
  // Basic Event Info
  id: string
  name: string
  description: string
  date: number
  location: {
    lat: number
    lng: number
    name: string
    address: string
  }
  coverImage: string
  coverVideo?: string
  category: string[]

  // Organizer
  organizer: {
    id: string
    name: string
    avatar: string
    verified: boolean
    rating: number
    eventsHosted: number
  }

  // Ticket Info
  price: number
  currency: string
  ticketsTotal: number
  ticketsSold: number
  ticketsAvailable: number

  // TRANSPARENCY DATA
  transparency: EventTransparency

  // Event Chat
  chatId: string
  chatMembers: number
  chatPreview?: string

  // Status
  status: 'upcoming' | 'ongoing' | 'ended'
  isPrivate: boolean
  requiresApproval: boolean
}

export interface AttendeePrivacySettings {
  userId: string
  eventId: string

  // Sichtbarkeit
  visibility: {
    showInAttendeeList: boolean       // In Teilnehmer-Liste zeigen?
    showDemographics: boolean         // Zu Demographics beitragen?
    showInterests: boolean            // Interessen zeigen?
    showAge: boolean                  // Alter zeigen?
    allowDirectMessages: boolean      // DMs von anderen Teilnehmern?
  }

  // Was wird geteilt?
  shareWith: 'everyone' | 'ticket-holders-only' | 'approved-only' | 'nobody'

  // Automatisches Löschen
  autoDeleteAfterEvent: boolean       // Daten nach Event löschen?
  deleteDelay: number                 // In Stunden (default: 24h)
}

/**
 * 🎉 Event Transparency Service
 */
class EventTransparencyService {
  private events = new Map<string, EventWithTransparency>()
  private privacySettings = new Map<string, AttendeePrivacySettings>()

  /**
   * 🎪 Create test event with transparency data
   */
  createTestEvent(type: 'festival' | 'concert' | 'meetup' | 'party'): EventWithTransparency {
    const eventNames: Record<string, string> = {
      festival: '🎪 Summer Music Festival',
      concert: '🎵 Live Rock Concert',
      meetup: '👥 Tech Meetup Nürnberg',
      party: '🎉 Beach Party'
    }

    const event: EventWithTransparency = {
      id: `event_${Date.now()}`,
      name: eventNames[type],
      description: `Ein unvergessliches ${type} Event in Nürnberg!`,
      date: Date.now() + 86400000 * 7, // In 7 Tagen
      location: {
        lat: 49.4521,
        lng: 11.0767,
        name: 'Festival Grounds',
        address: 'Musterstraße 123, 90402 Nürnberg'
      },
      coverImage: `https://picsum.photos/seed/${type}/1200/600`,
      category: [type, 'music', 'social'],
      organizer: {
        id: 'org_123',
        name: 'Event Masters',
        avatar: '/avatars/org.png',
        verified: true,
        rating: 4.8,
        eventsHosted: 42
      },
      price: type === 'festival' ? 45 : type === 'concert' ? 25 : 0,
      currency: 'EUR',
      ticketsTotal: 200,
      ticketsSold: 100,
      ticketsAvailable: 100,
      transparency: this.generateTransparencyData(100),
      chatId: `chat_${Date.now()}`,
      chatMembers: 87,
      status: 'upcoming',
      isPrivate: false,
      requiresApproval: false
    }

    this.events.set(event.id, event)

    console.log(`[EventTransparency] Created test event: ${event.name}`)

    return event
  }

  /**
   * 📊 Generate transparency data
   */
  private generateTransparencyData(totalAttendees: number): EventTransparency {
    // Demographics
    const demographics = [
      { category: 'culture' as const, name: 'Latinos', icon: '🌎', percentage: 45 },
      { category: 'culture' as const, name: 'Inder', icon: '🇮🇳', percentage: 20 },
      { category: 'culture' as const, name: 'Deutsche', icon: '🇩🇪', percentage: 25 },
      { category: 'culture' as const, name: 'International', icon: '🌍', percentage: 10 }
    ].map(d => ({
      ...d,
      count: Math.round((totalAttendees * d.percentage) / 100)
    }))

    // Age Groups
    const ageGroups = [
      { range: '18-25', percentage: 35 },
      { range: '26-35', percentage: 45 },
      { range: '36-45', percentage: 15 },
      { range: '46+', percentage: 5 }
    ].map(a => ({
      ...a,
      count: Math.round((totalAttendees * a.percentage) / 100)
    }))

    // Top Interests
    const topInterests = [
      { name: 'Music', icon: '🎵', percentage: 67 },
      { name: 'Food', icon: '🍕', percentage: 45 },
      { name: 'Tech', icon: '💻', percentage: 34 },
      { name: 'Sports', icon: '⚽', percentage: 28 }
    ].map(i => ({
      ...i,
      count: Math.round((totalAttendees * i.percentage) / 100)
    }))

    // Group Types
    const groupTypes = {
      solo: Math.round(totalAttendees * 0.23),
      couples: Math.round(totalAttendees * 0.35 / 2), // Paare als Anzahl Paare
      groups: Math.round(totalAttendees * 0.32 / 3), // Gruppen als Anzahl Gruppen
      families: Math.round(totalAttendees * 0.10 / 4) // Familien als Anzahl Familien
    }

    // Visible Attendees (opt-in, ~30%)
    const publicCount = Math.round(totalAttendees * 0.3)
    const visibleAttendees = Array.from({ length: publicCount }, (_, i) => ({
      id: `user_${i}`,
      name: this.generateName(),
      avatar: `/avatars/${i % 10}.png`,
      age: 18 + Math.floor(Math.random() * 30),
      interests: this.generateInterests(),
      topInterest: topInterests[i % topInterests.length].name,
      groupType: this.randomGroupType() as 'solo' | 'couple' | 'group' | 'family',
      isPublic: true
    }))

    // Vibe Score (0.0 - 1.0)
    const vibeScore = 0.5 + Math.random() * 0.5 // Bias towards party

    return {
      eventId: '',
      demographics,
      ageGroups,
      topInterests,
      vibeScore,
      vibeDescription: this.getVibeDescription(vibeScore),
      groupTypes,
      visibleAttendees,
      totalAttendees,
      publicAttendees: publicCount,
      diversityScore: this.calculateDiversityScore(demographics),
      energyLevel: Math.round(vibeScore * 100),
      recommendationScore: Math.round(70 + Math.random() * 30)
    }
  }

  /**
   * 🎭 Update event demographics
   */
  updateDemographics(
    eventId: string,
    demographics: { latinos: number; indians: number; germans: number; international: number }
  ): void {
    const event = this.events.get(eventId)
    if (!event) return

    const total = demographics.latinos + demographics.indians + demographics.germans + demographics.international

    if (total !== 100) {
      throw new Error('Demographics must sum to 100%')
    }

    event.transparency.demographics = [
      { category: 'culture', name: 'Latinos', icon: '🌎', percentage: demographics.latinos, count: Math.round((event.transparency.totalAttendees * demographics.latinos) / 100) },
      { category: 'culture', name: 'Inder', icon: '🇮🇳', percentage: demographics.indians, count: Math.round((event.transparency.totalAttendees * demographics.indians) / 100) },
      { category: 'culture', name: 'Deutsche', icon: '🇩🇪', percentage: demographics.germans, count: Math.round((event.transparency.totalAttendees * demographics.germans) / 100) },
      { category: 'culture', name: 'International', icon: '🌍', percentage: demographics.international, count: Math.round((event.transparency.totalAttendees * demographics.international) / 100) }
    ]

    console.log(`[EventTransparency] Demographics updated for ${eventId}`)
  }

  /**
   * 🔒 Set privacy settings for attendee
   */
  setPrivacySettings(userId: string, eventId: string, settings: Partial<AttendeePrivacySettings>): void {
    const key = `${userId}_${eventId}`
    const existing = this.privacySettings.get(key) || this.getDefaultPrivacySettings(userId, eventId)

    this.privacySettings.set(key, {
      ...existing,
      ...settings
    })

    console.log(`[EventTransparency] Privacy settings updated for ${userId} at ${eventId}`)
  }

  /**
   * 📊 Get event transparency data
   */
  getTransparencyData(eventId: string): EventTransparency | undefined {
    const event = this.events.get(eventId)
    return event?.transparency
  }

  /**
   * 📋 Get all events
   */
  getAllEvents(): EventWithTransparency[] {
    return Array.from(this.events.values())
  }

  /**
   * 🔍 Get event by ID
   */
  getEvent(eventId: string): EventWithTransparency | undefined {
    return this.events.get(eventId)
  }

  // === HELPER METHODS ===

  private getDefaultPrivacySettings(userId: string, eventId: string): AttendeePrivacySettings {
    return {
      userId,
      eventId,
      visibility: {
        showInAttendeeList: false,        // Opt-in required!
        showDemographics: true,           // Anonyme Statistics OK
        showInterests: false,
        showAge: false,
        allowDirectMessages: false
      },
      shareWith: 'ticket-holders-only',
      autoDeleteAfterEvent: true,
      deleteDelay: 24  // 24h nach Event
    }
  }

  private getVibeDescription(score: number): string {
    if (score < 0.3) return 'Entspannte, ruhige Atmosphäre 😌'
    if (score < 0.5) return 'Angenehme Balance zwischen Entspannung und Action ⚖️'
    if (score < 0.7) return 'Lebhafte Stimmung mit viel Energie ⚡'
    return 'Intensive Party-Atmosphäre! 🎉'
  }

  private calculateDiversityScore(demographics: EventTransparency['demographics']): number {
    // Shannon Diversity Index (simplified)
    const total = demographics.reduce((sum, d) => sum + d.count, 0)
    if (total === 0) return 0

    const proportions = demographics.map(d => d.count / total)
    const diversity = -proportions.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0)

    // Normalize to 0-100
    return Math.round((diversity / Math.log(demographics.length)) * 100)
  }

  private generateName(): string {
    const firstNames = ['Max', 'Lisa', 'Tom', 'Anna', 'Paul', 'Maria', 'Tim', 'Julia', 'Ben', 'Sarah']
    const lastNames = ['Müller', 'Schmidt', 'Meyer', 'Weber', 'Wagner', 'Koch', 'Becker', 'Schulz']
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  }

  private generateInterests(): string[] {
    const allInterests = ['Music', 'Food', 'Tech', 'Sports', 'Art', 'Travel', 'Gaming', 'Reading']
    const count = 2 + Math.floor(Math.random() * 3)
    return allInterests.sort(() => Math.random() - 0.5).slice(0, count)
  }

  private randomGroupType(): string {
    const types = ['solo', 'couple', 'group', 'family']
    const weights = [0.23, 0.35, 0.32, 0.10] // Gewichtungen
    const rand = Math.random()
    let sum = 0

    for (let i = 0; i < types.length; i++) {
      sum += weights[i]
      if (rand < sum) return types[i]
    }

    return 'solo'
  }

  /**
   * 🧪 Generate test data
   */
  generateTestData(): void {
    this.createTestEvent('festival')
    this.createTestEvent('concert')
    this.createTestEvent('meetup')
    this.createTestEvent('party')

    console.log('[EventTransparency] Test data generated')
  }
}

export const eventTransparencyService = new EventTransparencyService()

// Generate test data on init
eventTransparencyService.generateTestData()

/**
 * 🏠 PRIVATE EVENTS SERVICE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Jeder kann Events erstellen:
 * - Hauspartys
 * - Private Dinners
 * - Workshops
 * - Gaming Nights
 * - Yoga Sessions
 * - etc.
 *
 * LEGAL MONETIZATION durch Trinkgeld-System!
 * (KEIN Eintritt = KEIN Gewerbe nötig!)
 *
 * Created: 2025-10-24
 * ═══════════════════════════════════════════════════════════════════
 */

export type PrivateEventType =
  | 'house-party'
  | 'private-dinner'
  | 'workshop'
  | 'gaming-night'
  | 'movie-night'
  | 'sports-session'
  | 'art-class'
  | 'music-jam'
  | 'book-club'
  | 'cooking-together'
  | 'yoga-meditation'
  | 'other'

export interface PrivateEvent {
  id: string
  type: PrivateEventType

  // Basis-Info
  title: string
  description: string
  media: Array<{
    type: 'image' | 'video'
    url: string
    thumbnail?: string
    size?: number
  }>

  // Host
  host: {
    id: string
    name: string
    avatar: string
    rating: number
    eventsHosted: number
    verified: boolean
  }

  // Location
  location: {
    type: 'home' | 'public-space' | 'rented-venue' | 'outdoor'
    address?: string          // Optional (kann versteckt sein bis Zusage)
    city: string
    lat?: number              // Optional
    lng?: number              // Optional
    exactAddressVisibleAfter: 'rsvp' | 'payment' | 'approval' | 'never'
  }

  // Timing
  date: number
  startTime: string           // '19:00'
  endTime?: string            // '23:00'
  duration?: number           // In Minuten

  // Capacity
  maxAttendees: number
  currentAttendees: number
  waitlist: number

  // Access Control
  accessControl: {
    type: 'open' | 'approval-required' | 'invite-only' | 'friend-of-friend'
    requiresApproval: boolean
    inviteOnly: boolean
    allowFriendInvites: boolean  // Gäste dürfen Freunde mitbringen?
    maxGuestsPerPerson: number   // Max. Begleiter pro Person
  }

  // MONETIZATION (DAS IST DER TRICK!)
  monetization: {
    model: 'free' | 'suggested-donation' | 'fixed-contribution' | 'tiered'

    // Trinkgeld statt Eintritt (LEGAL ohne Gewerbe!)
    suggestedDonation?: {
      amount: number
      currency: string
      description: string     // "Für Getränke & Snacks"
      optional: boolean       // Immer optional = kein Eintritt!
    }

    // Was wird bereitgestellt?
    included: string[]        // ['Drinks', 'Snacks', 'Materials']

    // Bring-Your-Own
    byo: {
      drinks: boolean
      food: boolean
      equipment: boolean
    }

    // Payment
    paymentMethods: Array<'cash' | 'paypal' | 'venmo' | 'stripe' | 'crypto'>
    paymentTiming: 'before' | 'at-event' | 'after'
  }

  // Requirements
  requirements: {
    ageRestriction?: number
    skills?: string[]         // 'Anfänger OK', 'Erfahrung nötig'
    bring?: string[]          // 'Yoga-Matte', 'Controller', etc.
    rules?: string[]          // 'Keine Schuhe', 'Pünktlich sein'
  }

  // Social
  chat: {
    chatId: string
    enabled: boolean
    availableAfter: 'rsvp' | 'approval' | 'payment'
  }

  // Attendees
  attendees: Array<{
    userId: string
    name: string
    avatar: string
    status: 'pending' | 'approved' | 'rejected' | 'confirmed'
    rsvpAt: number
    donation?: number
    bringingGuests?: number
  }>

  // Status
  status: 'draft' | 'published' | 'full' | 'cancelled' | 'ended'
  createdAt: number
  updatedAt: number
}

export interface EventDonation {
  eventId: string
  userId: string
  amount: number
  currency: string
  timestamp: number
  message?: string
  anonymous: boolean
}

/**
 * 🏠 Private Events Service
 */
class PrivateEventsService {
  private events = new Map<string, PrivateEvent>()
  private donations = new Map<string, EventDonation[]>()

  /**
   * 🆕 Create new private event
   */
  createEvent(
    type: PrivateEventType,
    data: {
      title: string
      description: string
      date: number
      startTime: string
      endTime?: string
      maxAttendees: number
      location: Partial<PrivateEvent['location']>
      monetization?: Partial<PrivateEvent['monetization']>
    }
  ): PrivateEvent {
    const event: PrivateEvent = {
      id: `priv_event_${Date.now()}`,
      type,
      title: data.title,
      description: data.description,
      media: [],
      host: {
        id: 'current_user',
        name: 'Current User',
        avatar: '/default-avatar.png',
        rating: 4.5,
        eventsHosted: 3,
        verified: false
      },
      location: {
        type: 'home',
        city: 'Nürnberg',
        exactAddressVisibleAfter: 'approval',
        ...data.location
      },
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.endTime ? this.calculateDuration(data.startTime, data.endTime) : undefined,
      maxAttendees: data.maxAttendees,
      currentAttendees: 0,
      waitlist: 0,
      accessControl: {
        type: 'open',
        requiresApproval: false,
        inviteOnly: false,
        allowFriendInvites: true,
        maxGuestsPerPerson: 2
      },
      monetization: {
        model: 'free',
        included: [],
        byo: {
          drinks: false,
          food: false,
          equipment: false
        },
        paymentMethods: ['cash'],
        paymentTiming: 'at-event',
        ...data.monetization
      },
      requirements: {},
      chat: {
        chatId: `chat_${Date.now()}`,
        enabled: true,
        availableAfter: 'rsvp'
      },
      attendees: [],
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    this.events.set(event.id, event)
    this.donations.set(event.id, [])

    console.log(`[PrivateEvents] Event created: ${event.id} - ${event.title}`)

    return event
  }

  /**
   * 📝 Update event
   */
  updateEvent(eventId: string, updates: Partial<PrivateEvent>): void {
    const event = this.events.get(eventId)
    if (!event) throw new Error('Event not found')

    Object.assign(event, updates)
    event.updatedAt = Date.now()

    console.log(`[PrivateEvents] Event updated: ${eventId}`)
  }

  /**
   * 🚀 Publish event
   */
  publishEvent(eventId: string): void {
    const event = this.events.get(eventId)
    if (!event) throw new Error('Event not found')

    event.status = 'published'
    event.updatedAt = Date.now()

    console.log(`[PrivateEvents] Event published: ${eventId}`)
  }

  /**
   * ❌ Cancel event
   */
  cancelEvent(eventId: string): void {
    const event = this.events.get(eventId)
    if (!event) throw new Error('Event not found')

    event.status = 'cancelled'
    event.updatedAt = Date.now()

    console.log(`[PrivateEvents] Event cancelled: ${eventId}`)
  }

  /**
   * ✅ RSVP to event
   */
  rsvp(eventId: string, userId: string, bringingGuests: number = 0): void {
    const event = this.events.get(eventId)
    if (!event) throw new Error('Event not found')

    if (event.currentAttendees + 1 + bringingGuests > event.maxAttendees) {
      // Add to waitlist
      event.waitlist++
      console.log(`[PrivateEvents] Added to waitlist: ${userId} for ${eventId}`)
      return
    }

    const attendee = {
      userId,
      name: 'User ' + userId,
      avatar: '/default-avatar.png',
      status: event.accessControl.requiresApproval ? 'pending' as const : 'confirmed' as const,
      rsvpAt: Date.now(),
      bringingGuests
    }

    event.attendees.push(attendee)
    event.currentAttendees += 1 + bringingGuests
    event.updatedAt = Date.now()

    console.log(`[PrivateEvents] RSVP: ${userId} for ${eventId} (+${bringingGuests} guests)`)
  }

  /**
   * ✅ Approve attendee
   */
  approveAttendee(eventId: string, userId: string): void {
    const event = this.events.get(eventId)
    if (!event) throw new Error('Event not found')

    const attendee = event.attendees.find(a => a.userId === userId)
    if (!attendee) throw new Error('Attendee not found')

    attendee.status = 'approved'
    event.updatedAt = Date.now()

    console.log(`[PrivateEvents] Approved: ${userId} for ${eventId}`)
  }

  /**
   * ❌ Reject attendee
   */
  rejectAttendee(eventId: string, userId: string): void {
    const event = this.events.get(eventId)
    if (!event) throw new Error('Event not found')

    const attendee = event.attendees.find(a => a.userId === userId)
    if (!attendee) throw new Error('Attendee not found')

    attendee.status = 'rejected'
    event.currentAttendees -= 1 + (attendee.bringingGuests || 0)
    event.updatedAt = Date.now()

    console.log(`[PrivateEvents] Rejected: ${userId} for ${eventId}`)
  }

  /**
   * 💰 Make donation (TRINKGELD!)
   */
  makeDonation(
    eventId: string,
    userId: string,
    amount: number,
    options?: {
      message?: string
      anonymous?: boolean
    }
  ): void {
    const event = this.events.get(eventId)
    if (!event) throw new Error('Event not found')

    const donation: EventDonation = {
      eventId,
      userId,
      amount,
      currency: event.monetization.suggestedDonation?.currency || 'EUR',
      timestamp: Date.now(),
      message: options?.message,
      anonymous: options?.anonymous || false
    }

    const eventDonations = this.donations.get(eventId) || []
    eventDonations.push(donation)
    this.donations.set(eventId, eventDonations)

    // Update attendee
    const attendee = event.attendees.find(a => a.userId === userId)
    if (attendee) {
      attendee.donation = amount
    }

    console.log(`[PrivateEvents] Donation: ${amount}€ from ${userId} for ${eventId}`)
  }

  /**
   * 📊 Get donation stats for event
   */
  getDonationStats(eventId: string): {
    totalAmount: number
    donationCount: number
    averageDonation: number
    highestDonation: number
    lowestDonation: number
  } {
    const donations = this.donations.get(eventId) || []

    if (donations.length === 0) {
      return {
        totalAmount: 0,
        donationCount: 0,
        averageDonation: 0,
        highestDonation: 0,
        lowestDonation: 0
      }
    }

    const amounts = donations.map(d => d.amount)
    const totalAmount = amounts.reduce((sum, a) => sum + a, 0)

    return {
      totalAmount,
      donationCount: donations.length,
      averageDonation: Math.round(totalAmount / donations.length),
      highestDonation: Math.max(...amounts),
      lowestDonation: Math.min(...amounts)
    }
  }

  /**
   * 📋 Get all events
   */
  getAllEvents(filter?: {
    type?: PrivateEventType
    status?: PrivateEvent['status']
    hostId?: string
  }): PrivateEvent[] {
    let events = Array.from(this.events.values())

    if (filter?.type) {
      events = events.filter(e => e.type === filter.type)
    }

    if (filter?.status) {
      events = events.filter(e => e.status === filter.status)
    }

    if (filter?.hostId) {
      events = events.filter(e => e.host.id === filter.hostId)
    }

    // Sort by date
    events.sort((a, b) => a.date - b.date)

    return events
  }

  /**
   * 🔍 Get event by ID
   */
  getEvent(eventId: string): PrivateEvent | undefined {
    return this.events.get(eventId)
  }

  /**
   * 📊 Get stats
   */
  getStats(): {
    totalEvents: number
    publishedEvents: number
    totalAttendees: number
    totalDonations: number
    averageDonation: number
  } {
    const events = Array.from(this.events.values())
    const publishedEvents = events.filter(e => e.status === 'published')
    const totalAttendees = events.reduce((sum, e) => sum + e.currentAttendees, 0)

    let totalDonations = 0
    let donationCount = 0

    for (const eventDonations of this.donations.values()) {
      totalDonations += eventDonations.reduce((sum, d) => sum + d.amount, 0)
      donationCount += eventDonations.length
    }

    return {
      totalEvents: events.length,
      publishedEvents: publishedEvents.length,
      totalAttendees,
      totalDonations,
      averageDonation: donationCount > 0 ? Math.round(totalDonations / donationCount) : 0
    }
  }

  // === HELPER METHODS ===

  private calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    return endMinutes - startMinutes
  }

  /**
   * 🧪 Generate test data
   */
  generateTestData(): void {
    // House Party
    const houseParty = this.createEvent('house-party', {
      title: '🏠 Villa Summer Party',
      description: 'Epische Hausparty bei mir mit Pool, BBQ und DJ! 🎉',
      date: Date.now() + 86400000 * 3, // In 3 Tagen
      startTime: '19:00',
      endTime: '02:00',
      maxAttendees: 50,
      location: {
        type: 'home',
        city: 'Nürnberg',
        exactAddressVisibleAfter: 'approval'
      },
      monetization: {
        model: 'suggested-donation',
        suggestedDonation: {
          amount: 10,
          currency: 'EUR',
          description: 'Für Getränke, Snacks & DJ',
          optional: true
        },
        included: ['Drinks', 'Snacks', 'Music'],
        byo: {
          drinks: true,
          food: false,
          equipment: false
        }
      }
    })
    houseParty.status = 'published'

    // Private Dinner
    const dinner = this.createEvent('private-dinner', {
      title: '🍽️ Indisches 4-Gänge Menü',
      description: 'Authentisches indisches Essen - ich koche für max. 8 Personen!',
      date: Date.now() + 86400000 * 5,
      startTime: '18:30',
      endTime: '22:00',
      maxAttendees: 8,
      location: {
        type: 'home',
        city: 'Nürnberg'
      },
      monetization: {
        model: 'suggested-donation',
        suggestedDonation: {
          amount: 25,
          currency: 'EUR',
          description: 'Für Zutaten & Vorbereitung',
          optional: true
        },
        included: ['4-Gänge Menü', 'Wein', 'Dessert']
      }
    })
    dinner.status = 'published'

    // Workshop
    const workshop = this.createEvent('workshop', {
      title: '🎨 Acryl-Malerei für Anfänger',
      description: 'Lerne die Basics der Acryl-Malerei in entspannter Atmosphäre',
      date: Date.now() + 86400000 * 7,
      startTime: '14:00',
      endTime: '17:00',
      maxAttendees: 12,
      location: {
        type: 'rented-venue',
        city: 'Nürnberg'
      },
      monetization: {
        model: 'suggested-donation',
        suggestedDonation: {
          amount: 15,
          currency: 'EUR',
          description: 'Für Materialien & Raummiete',
          optional: true
        },
        included: ['Leinwand', 'Farben', 'Pinsel', 'Getränke']
      }
    })
    workshop.status = 'published'

    // Add some RSVPs and donations
    this.rsvp(houseParty.id, 'user_1', 1)
    this.rsvp(houseParty.id, 'user_2', 0)
    this.rsvp(houseParty.id, 'user_3', 2)

    this.makeDonation(houseParty.id, 'user_1', 10)
    this.makeDonation(houseParty.id, 'user_2', 15)
    this.makeDonation(houseParty.id, 'user_3', 5)

    console.log('[PrivateEvents] Test data generated')
  }
}

export const privateEventsService = new PrivateEventsService()

// Generate test data on init
privateEventsService.generateTestData()

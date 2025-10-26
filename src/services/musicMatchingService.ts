/**
 * Music Matching Service - Spotify API Integration
 *
 * Analyzes users' music tastes using Spotify data and provides:
 * - Artist and genre compatibility matching
 * - Event recommendations based on music preferences
 * - Personalized event playlists
 * - Music-based user connections
 *
 * Uses Spotify Web API data structures for real integration
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SpotifyArtist {
  id: string
  name: string
  genres: string[]
  popularity: number
  uri: string
  images?: Array<{ url: string; height: number; width: number }>
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: {
    id: string
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  duration_ms: number
  popularity: number
  uri: string
}

export interface AudioFeatures {
  acousticness: number      // 0-1 (acoustic vs electronic)
  danceability: number       // 0-1 (how suitable for dancing)
  energy: number             // 0-1 (intensity and activity)
  instrumentalness: number   // 0-1 (likelihood of being instrumental)
  liveness: number           // 0-1 (presence of audience)
  loudness: number           // -60 to 0 dB
  speechiness: number        // 0-1 (presence of spoken words)
  tempo: number              // BPM
  valence: number            // 0-1 (musical positiveness)
  mode: number               // 0 = minor, 1 = major
  key: number                // 0-11 (pitch class)
}

export interface UserMusicProfile {
  userId: string
  topArtists: SpotifyArtist[]           // Top 50 artists
  topGenres: GenrePreference[]          // Genre distribution
  topTracks: SpotifyTrack[]             // Top 50 tracks
  recentlyPlayed: SpotifyTrack[]        // Last 50 tracks
  audioFeatureProfile: AudioFeatures    // Average audio features
  musicEra: string[]                    // Decades preferred (e.g., '80s', '90s', '2000s')
  musicMood: 'energetic' | 'chill' | 'balanced'
  diversity: number                      // 0-100 (how diverse their taste is)
  lastUpdated: number
}

export interface GenrePreference {
  genre: string
  count: number
  percentage: number
  representative_artists: string[]
}

export interface MusicMatchResult {
  matchedUserId: string
  compatibilityScore: number            // 0-100
  sharedArtists: SpotifyArtist[]
  sharedGenres: string[]
  audioFeaturesCompatibility: number    // 0-100
  moodCompatibility: number             // 0-100
  diversityBalance: number              // 0-100 (how well tastes complement)
  confidence: 'high' | 'medium' | 'low'
  reasons: string[]
}

export interface EventMusicMatch {
  eventId: string
  musicScore: number                    // 0-100
  matchingArtists: string[]
  matchingGenres: string[]
  recommendedPlaylist: SpotifyTrack[]
  vibeMatch: number                     // 0-100 (how well music matches event vibe)
  reasons: string[]
}

export interface PlaylistRecommendation {
  eventId: string
  eventName: string
  tracks: SpotifyTrack[]
  genres: string[]
  averageEnergy: number
  averageDanceability: number
  totalDuration: number
  createdAt: number
}

// ============================================================================
// Genre Similarity Matrix (based on music theory & listener overlap)
// ============================================================================

const GENRE_SIMILARITY: Record<string, Record<string, number>> = {
  'rock': { 'rock': 1.0, 'alternative': 0.8, 'indie': 0.7, 'metal': 0.6, 'punk': 0.7, 'grunge': 0.8 },
  'alternative': { 'alternative': 1.0, 'rock': 0.8, 'indie': 0.9, 'grunge': 0.7, 'emo': 0.6 },
  'indie': { 'indie': 1.0, 'alternative': 0.9, 'folk': 0.7, 'rock': 0.7, 'bedroom pop': 0.8 },
  'pop': { 'pop': 1.0, 'dance': 0.7, 'r&b': 0.6, 'electronic': 0.6, 'indie pop': 0.8 },
  'hip hop': { 'hip hop': 1.0, 'rap': 0.9, 'trap': 0.8, 'r&b': 0.7, 'grime': 0.6 },
  'electronic': { 'electronic': 1.0, 'house': 0.9, 'techno': 0.8, 'edm': 0.9, 'ambient': 0.6 },
  'jazz': { 'jazz': 1.0, 'blues': 0.8, 'soul': 0.7, 'funk': 0.7, 'swing': 0.8 },
  'classical': { 'classical': 1.0, 'orchestral': 0.9, 'opera': 0.8, 'contemporary classical': 0.7 },
  'metal': { 'metal': 1.0, 'rock': 0.6, 'hardcore': 0.7, 'punk': 0.6, 'doom': 0.8 },
  'folk': { 'folk': 1.0, 'indie': 0.7, 'country': 0.6, 'acoustic': 0.8, 'americana': 0.8 },
  'r&b': { 'r&b': 1.0, 'soul': 0.9, 'hip hop': 0.7, 'pop': 0.6, 'neo soul': 0.9 },
  'country': { 'country': 1.0, 'folk': 0.6, 'americana': 0.8, 'bluegrass': 0.7, 'southern rock': 0.6 },
  'reggae': { 'reggae': 1.0, 'dub': 0.9, 'ska': 0.7, 'dancehall': 0.8, 'roots': 0.9 },
  'latin': { 'latin': 1.0, 'salsa': 0.8, 'reggaeton': 0.7, 'bachata': 0.7, 'cumbia': 0.8 }
}

// ============================================================================
// Music Matching Service
// ============================================================================

class MusicMatchingService {
  private userProfiles: Map<string, UserMusicProfile> = new Map()
  private eventMusicData: Map<string, { genres: string[], artists: string[], vibe: string }> = new Map()

  // ========================================
  // Profile Management
  // ========================================

  /**
   * Create or update a user's music profile from Spotify data
   */
  createUserProfile(
    userId: string,
    topArtists: SpotifyArtist[],
    topTracks: SpotifyTrack[],
    recentlyPlayed: SpotifyTrack[]
  ): UserMusicProfile {
    // Extract genres from artists
    const genreMap = new Map<string, number>()
    topArtists.forEach(artist => {
      artist.genres.forEach(genre => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1)
      })
    })

    // Calculate genre preferences
    const totalGenres = Array.from(genreMap.values()).reduce((a, b) => a + b, 0)
    const topGenres: GenrePreference[] = Array.from(genreMap.entries())
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: (count / totalGenres) * 100,
        representative_artists: topArtists
          .filter(a => a.genres.includes(genre))
          .slice(0, 3)
          .map(a => a.name)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate average audio features (mock for now, would use Spotify API)
    const audioFeatureProfile = this.calculateAudioFeatureProfile(topTracks)

    // Determine music era preferences
    const musicEra = this.determineMusicEra(topArtists)

    // Determine mood
    const musicMood = this.determineMusicMood(audioFeatureProfile)

    // Calculate taste diversity
    const diversity = this.calculateDiversity(topGenres, topArtists)

    const profile: UserMusicProfile = {
      userId,
      topArtists: topArtists.slice(0, 50),
      topGenres,
      topTracks: topTracks.slice(0, 50),
      recentlyPlayed: recentlyPlayed.slice(0, 50),
      audioFeatureProfile,
      musicEra,
      musicMood,
      diversity,
      lastUpdated: Date.now()
    }

    this.userProfiles.set(userId, profile)
    return profile
  }

  /**
   * Get or create mock profile for testing
   */
  getUserProfile(userId: string): UserMusicProfile | null {
    return this.userProfiles.get(userId) || null
  }

  /**
   * Calculate average audio features from tracks
   */
  private calculateAudioFeatureProfile(tracks: SpotifyTrack[]): AudioFeatures {
    // In production, would fetch from Spotify API
    // For now, generate reasonable averages based on track characteristics
    const features: AudioFeatures = {
      acousticness: 0.3,
      danceability: 0.6,
      energy: 0.7,
      instrumentalness: 0.1,
      liveness: 0.15,
      loudness: -6,
      speechiness: 0.05,
      tempo: 120,
      valence: 0.6,
      mode: 1,
      key: 5
    }

    return features
  }

  /**
   * Determine preferred music eras from artist data
   */
  private determineMusicEra(artists: SpotifyArtist[]): string[] {
    // This would analyze artist debut years in production
    // For now, return common eras
    return ['2010s', '2020s']
  }

  /**
   * Determine overall music mood from audio features
   */
  private determineMusicMood(features: AudioFeatures): 'energetic' | 'chill' | 'balanced' {
    if (features.energy > 0.7 && features.danceability > 0.6) return 'energetic'
    if (features.energy < 0.4 && features.valence < 0.5) return 'chill'
    return 'balanced'
  }

  /**
   * Calculate taste diversity (0-100)
   * Higher = more diverse taste across genres
   */
  private calculateDiversity(genres: GenrePreference[], artists: SpotifyArtist[]): number {
    // Shannon diversity index
    let diversity = 0
    genres.forEach(g => {
      const p = g.percentage / 100
      if (p > 0) diversity -= p * Math.log(p)
    })

    // Normalize to 0-100
    const maxDiversity = Math.log(genres.length)
    return maxDiversity > 0 ? (diversity / maxDiversity) * 100 : 50
  }

  // ========================================
  // User-to-User Matching
  // ========================================

  /**
   * Calculate music compatibility between two users
   */
  calculateUserCompatibility(userId1: string, userId2: string): MusicMatchResult | null {
    const profile1 = this.userProfiles.get(userId1)
    const profile2 = this.userProfiles.get(userId2)

    if (!profile1 || !profile2) return null

    // 1. Artist overlap (40% weight)
    const { sharedArtists, artistScore } = this.calculateArtistOverlap(profile1, profile2)

    // 2. Genre similarity (30% weight)
    const { sharedGenres, genreScore } = this.calculateGenreSimilarity(profile1, profile2)

    // 3. Audio features compatibility (20% weight)
    const audioScore = this.calculateAudioFeaturesCompatibility(
      profile1.audioFeatureProfile,
      profile2.audioFeatureProfile
    )

    // 4. Mood compatibility (10% weight)
    const moodScore = this.calculateMoodCompatibility(profile1, profile2)

    // Overall compatibility score
    const compatibilityScore = Math.round(
      artistScore * 0.4 +
      genreScore * 0.3 +
      audioScore * 0.2 +
      moodScore * 0.1
    )

    // Diversity balance (how well tastes complement each other)
    const diversityBalance = this.calculateDiversityBalance(profile1.diversity, profile2.diversity)

    // Determine confidence
    const confidence = this.determineConfidence(
      profile1.topArtists.length,
      profile2.topArtists.length,
      sharedArtists.length
    )

    // Generate reasons
    const reasons = this.generateCompatibilityReasons(
      sharedArtists,
      sharedGenres,
      audioScore,
      profile1,
      profile2
    )

    return {
      matchedUserId: userId2,
      compatibilityScore,
      sharedArtists,
      sharedGenres,
      audioFeaturesCompatibility: audioScore,
      moodCompatibility: moodScore,
      diversityBalance,
      confidence,
      reasons
    }
  }

  /**
   * Calculate artist overlap between profiles
   */
  private calculateArtistOverlap(
    profile1: UserMusicProfile,
    profile2: UserMusicProfile
  ): { sharedArtists: SpotifyArtist[]; artistScore: number } {
    const artistIds1 = new Set(profile1.topArtists.map(a => a.id))
    const artistIds2 = new Set(profile2.topArtists.map(a => a.id))

    const sharedArtists = profile1.topArtists.filter(a => artistIds2.has(a.id))

    // Score based on number of shared artists and their popularity
    const maxArtists = Math.max(profile1.topArtists.length, profile2.topArtists.length)
    const overlapRatio = sharedArtists.length / maxArtists

    // Weight by artist ranking (shared top artists matter more)
    let weightedScore = 0
    sharedArtists.forEach(artist => {
      const rank1 = profile1.topArtists.findIndex(a => a.id === artist.id)
      const rank2 = profile2.topArtists.findIndex(a => a.id === artist.id)
      const weight = 1 - ((rank1 + rank2) / (2 * maxArtists))
      weightedScore += weight
    })

    const artistScore = Math.min(100, (overlapRatio * 50 + weightedScore * 50))

    return { sharedArtists, artistScore }
  }

  /**
   * Calculate genre similarity using genre matrix
   */
  private calculateGenreSimilarity(
    profile1: UserMusicProfile,
    profile2: UserMusicProfile
  ): { sharedGenres: string[]; genreScore: number } {
    const sharedGenres: string[] = []
    let totalSimilarity = 0
    let comparisons = 0

    profile1.topGenres.forEach(g1 => {
      profile2.topGenres.forEach(g2 => {
        const similarity = this.getGenreSimilarity(g1.genre, g2.genre)
        if (similarity > 0.5) {
          if (!sharedGenres.includes(g1.genre)) sharedGenres.push(g1.genre)
        }
        totalSimilarity += similarity * (g1.percentage / 100) * (g2.percentage / 100)
        comparisons++
      })
    })

    const genreScore = comparisons > 0 ? Math.min(100, totalSimilarity * 200) : 0

    return { sharedGenres, genreScore }
  }

  /**
   * Get similarity score between two genres (0-1)
   */
  private getGenreSimilarity(genre1: string, genre2: string): number {
    // Normalize genres
    const g1 = genre1.toLowerCase()
    const g2 = genre2.toLowerCase()

    // Exact match
    if (g1 === g2) return 1.0

    // Check similarity matrix
    for (const [mainGenre, similarities] of Object.entries(GENRE_SIMILARITY)) {
      if (g1.includes(mainGenre) && similarities[g2]) {
        return similarities[g2]
      }
      if (g2.includes(mainGenre) && similarities[g1]) {
        return similarities[g1]
      }
    }

    // Partial match (e.g., "indie rock" and "rock")
    if (g1.includes(g2) || g2.includes(g1)) return 0.6

    return 0.1 // Default low similarity
  }

  /**
   * Calculate audio features compatibility (0-100)
   */
  private calculateAudioFeaturesCompatibility(
    features1: AudioFeatures,
    features2: AudioFeatures
  ): number {
    // Key features to compare (weights sum to 1.0)
    const comparisons = [
      { key: 'energy', weight: 0.25 },
      { key: 'danceability', weight: 0.25 },
      { key: 'valence', weight: 0.20 },
      { key: 'acousticness', weight: 0.15 },
      { key: 'tempo', weight: 0.15, normalize: (v: number) => v / 200 } // Normalize tempo
    ]

    let totalScore = 0

    comparisons.forEach(({ key, weight, normalize }) => {
      const val1 = normalize ? normalize(features1[key as keyof AudioFeatures] as number) : features1[key as keyof AudioFeatures] as number
      const val2 = normalize ? normalize(features2[key as keyof AudioFeatures] as number) : features2[key as keyof AudioFeatures] as number
      const similarity = 1 - Math.abs(val1 - val2)
      totalScore += similarity * weight
    })

    return Math.round(totalScore * 100)
  }

  /**
   * Calculate mood compatibility
   */
  private calculateMoodCompatibility(profile1: UserMusicProfile, profile2: UserMusicProfile): number {
    if (profile1.musicMood === profile2.musicMood) return 100

    const moodMatrix = {
      'energetic-balanced': 70,
      'balanced-energetic': 70,
      'chill-balanced': 70,
      'balanced-chill': 70,
      'energetic-chill': 40,
      'chill-energetic': 40
    }

    const key = `${profile1.musicMood}-${profile2.musicMood}` as keyof typeof moodMatrix
    return moodMatrix[key] || 50
  }

  /**
   * Calculate diversity balance (how well different tastes complement)
   */
  private calculateDiversityBalance(diversity1: number, diversity2: number): number {
    // Perfect balance is when both users have moderate-high diversity
    // Or when one has high and one has moderate (complementary)
    const avg = (diversity1 + diversity2) / 2
    const diff = Math.abs(diversity1 - diversity2)

    // Prefer moderate to high diversity with not too much difference
    if (avg > 60 && diff < 30) return 100
    if (avg > 50 && diff < 40) return 80
    if (diff < 20) return 70
    return 50
  }

  /**
   * Determine confidence level
   */
  private determineConfidence(
    artistCount1: number,
    artistCount2: number,
    sharedCount: number
  ): 'high' | 'medium' | 'low' {
    if (artistCount1 > 30 && artistCount2 > 30 && sharedCount > 5) return 'high'
    if (artistCount1 > 15 && artistCount2 > 15 && sharedCount > 2) return 'medium'
    return 'low'
  }

  /**
   * Generate human-readable compatibility reasons
   */
  private generateCompatibilityReasons(
    sharedArtists: SpotifyArtist[],
    sharedGenres: string[],
    audioScore: number,
    profile1: UserMusicProfile,
    profile2: UserMusicProfile
  ): string[] {
    const reasons: string[] = []

    if (sharedArtists.length > 5) {
      reasons.push(`You both love ${sharedArtists.slice(0, 3).map(a => a.name).join(', ')} and ${sharedArtists.length - 3} more artists`)
    } else if (sharedArtists.length > 0) {
      reasons.push(`Shared interest in ${sharedArtists.map(a => a.name).join(', ')}`)
    }

    if (sharedGenres.length > 3) {
      reasons.push(`Strong overlap in ${sharedGenres.slice(0, 3).join(', ')} genres`)
    }

    if (audioScore > 80) {
      reasons.push('Very similar music vibes and energy levels')
    }

    if (profile1.musicMood === profile2.musicMood) {
      reasons.push(`Both prefer ${profile1.musicMood} music`)
    }

    return reasons
  }

  // ========================================
  // Event Music Matching
  // ========================================

  /**
   * Set music data for an event
   */
  setEventMusicData(
    eventId: string,
    genres: string[],
    artists: string[],
    vibe: string
  ): void {
    this.eventMusicData.set(eventId, { genres, artists, vibe })
  }

  /**
   * Calculate how well a user matches an event musically
   */
  matchUserToEvent(userId: string, eventId: string): EventMusicMatch | null {
    const userProfile = this.userProfiles.get(userId)
    const eventData = this.eventMusicData.get(eventId)

    if (!userProfile || !eventData) return null

    // 1. Artist matching (50% weight)
    const matchingArtists: string[] = []
    let artistScore = 0

    eventData.artists.forEach(eventArtist => {
      const found = userProfile.topArtists.find(
        ua => ua.name.toLowerCase() === eventArtist.toLowerCase()
      )
      if (found) {
        matchingArtists.push(eventArtist)
        artistScore += 20 // Each matching artist adds significant value
      }
    })

    // 2. Genre matching (50% weight)
    const matchingGenres: string[] = []
    let genreScore = 0

    eventData.genres.forEach(eventGenre => {
      userProfile.topGenres.forEach(userGenre => {
        const similarity = this.getGenreSimilarity(eventGenre, userGenre.genre)
        if (similarity > 0.5) {
          if (!matchingGenres.includes(eventGenre)) matchingGenres.push(eventGenre)
          genreScore += similarity * userGenre.percentage
        }
      })
    })

    // Normalize scores
    artistScore = Math.min(100, artistScore)
    genreScore = Math.min(100, genreScore / 2)

    const musicScore = Math.round((artistScore * 0.5 + genreScore * 0.5))

    // 3. Vibe matching
    const vibeMatch = this.matchVibe(userProfile, eventData.vibe)

    // 4. Generate recommended playlist
    const recommendedPlaylist = this.generateEventPlaylist(userProfile, eventData)

    // 5. Generate reasons
    const reasons = this.generateEventMatchReasons(
      matchingArtists,
      matchingGenres,
      musicScore,
      vibeMatch
    )

    return {
      eventId,
      musicScore,
      matchingArtists,
      matchingGenres,
      recommendedPlaylist,
      vibeMatch,
      reasons
    }
  }

  /**
   * Match user's music mood to event vibe
   */
  private matchVibe(profile: UserMusicProfile, eventVibe: string): number {
    const vibeMap: Record<string, string[]> = {
      'energetic': ['party', 'rave', 'concert', 'festival', 'club'],
      'chill': ['lounge', 'cafe', 'acoustic', 'jazz night', 'ambient'],
      'balanced': ['concert', 'festival', 'live music', 'open mic']
    }

    const userVibes = vibeMap[profile.musicMood] || []
    const eventVibeLower = eventVibe.toLowerCase()

    for (const vibe of userVibes) {
      if (eventVibeLower.includes(vibe)) return 100
    }

    return 50 // Neutral if no clear match
  }

  /**
   * Generate personalized event playlist
   */
  private generateEventPlaylist(
    profile: UserMusicProfile,
    eventData: { genres: string[]; artists: string[]; vibe: string }
  ): SpotifyTrack[] {
    // Select tracks that match event genres and vibe
    const playlist = profile.topTracks.filter(track => {
      // Check if track artists match event
      const artistMatch = track.artists.some(artist =>
        eventData.artists.some(ea => ea.toLowerCase() === artist.name.toLowerCase())
      )

      return artistMatch
    })

    // Return top 10 tracks for the event
    return playlist.slice(0, 10)
  }

  /**
   * Generate event match reasons
   */
  private generateEventMatchReasons(
    matchingArtists: string[],
    matchingGenres: string[],
    musicScore: number,
    vibeMatch: number
  ): string[] {
    const reasons: string[] = []

    if (matchingArtists.length > 0) {
      reasons.push(`Perfect match! Features ${matchingArtists.join(', ')} from your favorites`)
    }

    if (matchingGenres.length > 2) {
      reasons.push(`Matches your taste in ${matchingGenres.join(', ')}`)
    }

    if (vibeMatch > 80) {
      reasons.push('Event vibe aligns perfectly with your music mood')
    }

    if (musicScore > 80) {
      reasons.push('Highly recommended based on your listening history')
    }

    return reasons
  }

  // ========================================
  // Playlist Generation
  // ========================================

  /**
   * Create a personalized playlist for an event
   */
  createEventPlaylist(
    userId: string,
    eventId: string,
    eventName: string,
    targetDuration: number = 3600000 // 1 hour in ms
  ): PlaylistRecommendation | null {
    const userProfile = this.userProfiles.get(userId)
    const eventData = this.eventMusicData.get(eventId)

    if (!userProfile || !eventData) return null

    const tracks: SpotifyTrack[] = []
    let totalDuration = 0
    const genreSet = new Set<string>()

    // Select tracks that match event and user preferences
    for (const track of [...userProfile.topTracks, ...userProfile.recentlyPlayed]) {
      if (totalDuration >= targetDuration) break

      // Check if track matches event criteria
      const matchesEvent = track.artists.some(artist =>
        eventData.artists.some(ea => ea.toLowerCase() === artist.name.toLowerCase()) ||
        artist.genres.some(g => eventData.genres.some(eg => this.getGenreSimilarity(g, eg) > 0.7))
      )

      if (matchesEvent && !tracks.some(t => t.id === track.id)) {
        tracks.push(track)
        totalDuration += track.duration_ms
        track.artists.forEach(a => a.genres.forEach(g => genreSet.add(g)))
      }
    }

    // Calculate averages
    const features = userProfile.audioFeatureProfile

    return {
      eventId,
      eventName,
      tracks,
      genres: Array.from(genreSet).slice(0, 5),
      averageEnergy: features.energy,
      averageDanceability: features.danceability,
      totalDuration,
      createdAt: Date.now()
    }
  }

  // ========================================
  // Statistics & Utilities
  // ========================================

  /**
   * Get service statistics
   */
  getStatistics() {
    return {
      totalProfiles: this.userProfiles.size,
      totalEvents: this.eventMusicData.size,
      profilesWithData: Array.from(this.userProfiles.values())
        .filter(p => p.topArtists.length > 0).length
    }
  }

  /**
   * Generate mock Spotify data for testing
   */
  generateMockSpotifyData(userId: string, musicTaste: 'rock' | 'electronic' | 'pop' | 'mixed'): UserMusicProfile {
    const mockArtists: Record<string, SpotifyArtist[]> = {
      'rock': [
        { id: '1', name: 'Arctic Monkeys', genres: ['rock', 'indie', 'alternative'], popularity: 85, uri: 'spotify:artist:1' },
        { id: '2', name: 'The Strokes', genres: ['rock', 'indie', 'garage rock'], popularity: 80, uri: 'spotify:artist:2' },
        { id: '3', name: 'Radiohead', genres: ['alternative', 'rock', 'art rock'], popularity: 88, uri: 'spotify:artist:3' },
        { id: '4', name: 'Foo Fighters', genres: ['rock', 'alternative'], popularity: 82, uri: 'spotify:artist:4' },
        { id: '5', name: 'Red Hot Chili Peppers', genres: ['rock', 'funk rock', 'alternative'], popularity: 84, uri: 'spotify:artist:5' }
      ],
      'electronic': [
        { id: '6', name: 'Daft Punk', genres: ['electronic', 'house', 'french house'], popularity: 90, uri: 'spotify:artist:6' },
        { id: '7', name: 'Deadmau5', genres: ['electronic', 'progressive house', 'electro'], popularity: 78, uri: 'spotify:artist:7' },
        { id: '8', name: 'ODESZA', genres: ['electronic', 'indie electronic', 'chillwave'], popularity: 75, uri: 'spotify:artist:8' },
        { id: '9', name: 'Flume', genres: ['electronic', 'future bass', 'indie electronic'], popularity: 76, uri: 'spotify:artist:9' },
        { id: '10', name: 'Disclosure', genres: ['electronic', 'house', 'uk garage'], popularity: 77, uri: 'spotify:artist:10' }
      ],
      'pop': [
        { id: '11', name: 'Taylor Swift', genres: ['pop', 'country pop'], popularity: 95, uri: 'spotify:artist:11' },
        { id: '12', name: 'The Weeknd', genres: ['pop', 'r&b', 'alternative r&b'], popularity: 93, uri: 'spotify:artist:12' },
        { id: '13', name: 'Billie Eilish', genres: ['pop', 'alternative pop', 'indie pop'], popularity: 92, uri: 'spotify:artist:13' },
        { id: '14', name: 'Dua Lipa', genres: ['pop', 'dance pop'], popularity: 89, uri: 'spotify:artist:14' },
        { id: '15', name: 'Harry Styles', genres: ['pop', 'pop rock'], popularity: 91, uri: 'spotify:artist:15' }
      ],
      'mixed': [
        { id: '1', name: 'Arctic Monkeys', genres: ['rock', 'indie'], popularity: 85, uri: 'spotify:artist:1' },
        { id: '6', name: 'Daft Punk', genres: ['electronic', 'house'], popularity: 90, uri: 'spotify:artist:6' },
        { id: '13', name: 'Billie Eilish', genres: ['pop', 'alternative pop'], popularity: 92, uri: 'spotify:artist:13' },
        { id: '16', name: 'Tame Impala', genres: ['psychedelic', 'indie', 'electronic'], popularity: 83, uri: 'spotify:artist:16' },
        { id: '17', name: 'Glass Animals', genres: ['indie', 'psychedelic pop', 'alternative'], popularity: 79, uri: 'spotify:artist:17' }
      ]
    }

    const artists = mockArtists[musicTaste] || mockArtists['mixed']

    const mockTracks: SpotifyTrack[] = artists.map((artist, i) => ({
      id: `track_${i}`,
      name: `Track ${i + 1}`,
      artists: [artist],
      album: {
        id: `album_${i}`,
        name: `Album ${i + 1}`,
        images: [{ url: '', height: 640, width: 640 }]
      },
      duration_ms: 180000 + Math.random() * 120000,
      popularity: artist.popularity - 5,
      uri: `spotify:track:${i}`
    }))

    return this.createUserProfile(userId, artists, mockTracks, mockTracks.slice(0, 10))
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.userProfiles.clear()
    this.eventMusicData.clear()
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const musicMatchingService = new MusicMatchingService()

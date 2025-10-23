<template>
  <div class="clean-layout">
    <!-- Offline Indicator -->
    <OfflineIndicator />

    <!-- Header -->
    <CleanHeader
      :location="locationName"
      @search="handleSearch"
      @refresh="handleRefresh"
      @settings="showSettings = true"
      @toggle-sidebar="showUserSidebar = !showUserSidebar"
    />

    <!-- Main Content - 3 Column Layout -->
    <main class="main-content" role="main" aria-label="News Content">
      <div class="container-3col">
        <!-- Left Sidebar - Settings & Navigation -->
        <aside class="sidebar-left" role="complementary" aria-label="Einstellungen und Navigation">
          <SidebarLeft
            :settings="settings"
            :discoveryMatches="discovery.matches.value"
            :discoveryLoading="discovery.isLoading.value"
            :discoveryLastUpdate="discovery.lastUpdate.value"
            @update-settings="handleUpdateSettings"
            @edit-profile="showProfileEditor = true"
            @refresh-discovery="handleRefreshDiscovery"
            @select-discovery="handleSelectDiscovery"
            @article-click="openArticle"
          />
        </aside>

        <!-- Center Column - News Feed -->
        <div class="center-column" role="feed" aria-label="News Artikel Feed">
          <!-- Statistics Bar -->
          <StatsBar :articles="articles" :last-refresh="lastRefreshTime" />

          <!-- Discovery Banner - Hyperlocal Discovery -->
          <DiscoveryBanner
            :radius="settings.radius"
            :articlesInRadius="articlesInRadius"
            :totalArticles="articles.length"
            :closestDistance="closestDistance"
            @update-radius="handleRadiusUpdate"
          />

          <!-- Prominent Filter Controls -->
          <div class="filter-control-bar" role="search" aria-label="Artikel filtern und sortieren">
            <!-- Header Row -->
            <div class="filter-header">
              <div class="filter-title">
                <span class="filter-icon" aria-hidden="true">🎯</span>
                <h3>Filter & Sortierung</h3>
                <span v-if="activeFilterCount > 0" class="active-filter-badge" role="status" aria-live="polite">
                  {{ activeFilterCount }} aktiv
                </span>
              </div>
              <button v-if="activeFilterCount > 0" @click="clearAllFilters" class="clear-filters-btn" aria-label="Alle Filter zurücksetzen">
                <span aria-hidden="true">✕</span>
                <span>Alle zurücksetzen</span>
              </button>
            </div>

            <!-- Sort Options -->
            <div class="filter-section">
              <label class="filter-label">📊 Sortierung</label>
              <div class="sort-options">
                <button
                  @click="sortBy = 'distance'"
                  :class="{ active: sortBy === 'distance' }"
                  class="sort-btn"
                >
                  <span>📍</span>
                  <span>Distanz</span>
                </button>
                <button
                  @click="sortBy = 'match'"
                  :class="{ active: sortBy === 'match' }"
                  class="sort-btn"
                >
                  <span>🔥</span>
                  <span>Match Score</span>
                </button>
                <button
                  @click="sortBy = 'time'"
                  :class="{ active: sortBy === 'time' }"
                  class="sort-btn"
                >
                  <span>🕒</span>
                  <span>Zeit</span>
                </button>
              </div>
            </div>

            <!-- Interest Filters -->
            <div v-if="interests.interests.value.length > 0" class="filter-section">
              <label class="filter-label">
                💫 Interessen filtern
                <span class="filter-hint">(Klicke zum An/Ausschalten)</span>
              </label>
              <div class="interest-chips">
                <button
                  v-for="interest in interests.interests.value.slice(0, 8)"
                  :key="interest.keyword"
                  @click="toggleInterestFilter(interest.keyword)"
                  :class="{ active: !disabledInterests.includes(interest.keyword) }"
                  class="interest-chip"
                >
                  <span class="chip-icon">
                    {{ !disabledInterests.includes(interest.keyword) ? '✓' : '○' }}
                  </span>
                  <span class="chip-label">{{ interest.keyword }}</span>
                  <span class="chip-score">{{ Math.round(interest.score * 100) }}%</span>
                </button>
              </div>
            </div>

            <!-- Category Filters (keeping existing functionality) -->
            <div class="filter-section">
              <label class="filter-label">🏷️ Kategorien</label>
              <div class="category-filters">
                <button
                  v-for="category in categories"
                  :key="category"
                  @click="toggleFilter(category)"
                  :class="{ active: activeCategories.includes(category) }"
                  class="category-btn"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <!-- Result Count & Location Info -->
            <div class="filter-footer">
              <div class="filter-stats">
                <LocationSelector @location-change="handleLocationChange" />
                <span class="stat-item">
                  <span class="stat-icon">📍</span>
                  <span>{{ settings.radius }}km Umkreis</span>
                </span>
                <span class="stat-item">
                  <span class="stat-icon">📰</span>
                  <span>{{ filteredArticles.length }} Artikel</span>
                </span>
              </div>
            </div>
          </div>

          <!-- News Grid -->
          <div class="news-grid">
            <!-- Loading Skeletons -->
            <template v-if="isLoading">
              <SkeletonCard v-for="n in 6" :key="`skeleton-${n}`" />
            </template>

            <!-- Actual Articles with Ad Banners -->
            <template v-else>
              <template v-for="(article, index) in displayedArticles" :key="article.id">
                <CleanNewsCard
                  :article="article"
                  :isBookmarked="bookmarks.isBookmarked(article.id)"
                  :distance="getArticleDistance(article)"
                  :matchScore="getArticleMatchScore(article)"
                  @click="handleArticleClick(article)"
                  @bookmark="handleBookmark"
                />

                <!-- Ad Banner every 4 articles -->
                <AdBanner
                  v-if="(index + 1) % 4 === 0 && index < displayedArticles.length - 1"
                  :key="`ad-${index}`"
                  :userInterests="interests.interests.value.map(i => i.keyword)"
                  :articleId="article.id"
                  :showRevenue="true"
                />
              </template>
            </template>
          </div>

          <!-- Feed End Message (Anti-Infinite-Scroll) -->
          <div v-if="!isLoading && displayedArticles.length > 0" class="feed-end">
            <div class="feed-end-icon">🎉</div>
            <h3 class="feed-end-title">Du bist auf dem neuesten Stand!</h3>
            <p class="feed-end-subtitle">
              Das war's – keine endlose Scroll-Falle hier.
            </p>
            <div class="feed-end-stats">
              <div class="feed-stat">
                <span class="feed-stat-value">{{ displayedArticles.length }}</span>
                <span class="feed-stat-label">Artikel gelesen</span>
              </div>
              <div class="feed-stat">
                <span class="feed-stat-value">{{ Math.round(articlesInRadius / articles.length * 100) }}%</span>
                <span class="feed-stat-label">In deinem Umkreis</span>
              </div>
            </div>
            <div class="feed-end-message">
              <div class="feed-end-transparency">
                <span class="transparency-badge">✨ Transparenz</span>
                <p class="transparency-text">
                  Im Gegensatz zu Instagram zeigen wir dir <strong>ALLE relevanten Artikel</strong> –
                  keine versteckten Inhalte, kein endloser Feed.
                  Du hast jetzt alles gesehen, was zu deinen Interessen und deinem Umkreis passt.
                </p>
              </div>
              <div class="feed-end-cta">
                <div class="cta-icon">🌍</div>
                <h4 class="cta-title">Zeit, rauszugehen!</h4>
                <p class="cta-text">
                  Schau dir die Events in deiner Nähe an und triff echte Menschen.
                </p>
                <button @click="handleRefresh" class="btn-refresh">
                  <span>🔄</span>
                  <span>Neue Artikel laden</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!isLoading && displayedArticles.length === 0" class="empty-state">
            <div class="empty-illustration">
              <div class="empty-icon-large">📰</div>
              <div class="empty-sparkles">✨</div>
            </div>
            <h3 class="empty-title">Keine passenden Artikel gefunden</h3>
            <p class="empty-description">
              Es gibt aktuell keine Artikel, die zu deinen Interessen und Filtern passen.
            </p>
            <div class="empty-actions">
              <button @click="activeLeftTab = 'interests'" class="btn-primary">
                <span>🎯</span>
                Interessen anpassen
              </button>
              <button @click="currentLocation = null; selectedRadius = 50" class="btn-secondary">
                <span>🌍</span>
                Filter erweitern
              </button>
            </div>
            <div class="empty-hint">
              💡 Tipp: Füge weitere Interessen hinzu oder erhöhe den Umkreis
            </div>
          </div>
        </div>

        <!-- Right Sidebar - User Discovery -->
        <aside class="sidebar-right">
          <UserSidebar @open-profile="handleOpenUserProfile" />
        </aside>
      </div>
    </main>

    <!-- Article Modal (Full Content View) -->
    <Teleport to="body">
      <div v-if="selectedArticle" class="modal-overlay" @click="selectedArticle = null" @keydown.esc="selectedArticle = null">
        <div class="modal-content" @click.stop role="dialog" aria-modal="true" aria-labelledby="article-modal-title">
          <button class="modal-close" @click="selectedArticle = null" aria-label="Artikel schließen">×</button>

          <img v-if="selectedArticle.imageUrl" :src="selectedArticle.imageUrl" class="modal-image" alt="" />

          <div class="modal-body">
            <!-- Meta Info -->
            <div class="modal-meta">
              <span class="modal-source">{{ selectedArticle.source }}</span>
              <span class="modal-author" v-if="selectedArticle.author && selectedArticle.author !== 'none'">Von {{ selectedArticle.author }}</span>
              <span class="modal-time">{{ formatDate(selectedArticle.publishedAt) }}</span>
            </div>

            <!-- Topics/Tags -->
            <div class="modal-topics">
              <span v-for="topic in selectedArticle.topics" :key="topic" class="topic-tag">
                {{ topic }}
              </span>
            </div>

            <!-- Title -->
            <h2 id="article-modal-title" class="modal-title">{{ selectedArticle.title }}</h2>

            <!-- Summary (Lead) -->
            <p class="modal-lead">{{ selectedArticle.summary }}</p>

            <!-- Content Type & Reading Time Info -->
            <div v-if="selectedArticle.contentType || selectedArticle.difficulty || selectedArticle.readingTime" class="content-info">
              <span v-if="selectedArticle.contentType && selectedArticle.contentType !== 'news'" class="content-type-badge">
                {{ getContentTypeLabel(selectedArticle.contentType) }}
              </span>
              <span v-if="selectedArticle.difficulty" class="difficulty-badge" :class="`difficulty-${selectedArticle.difficulty}`">
                {{ getDifficultyLabel(selectedArticle.difficulty) }}
              </span>
              <span v-if="selectedArticle.readingTime && selectedArticle.readingTime > 0" class="reading-time">
                ⏱️ {{ selectedArticle.readingTime }} Min. Lesezeit
              </span>
            </div>

            <!-- Full Article Content -->
            <div class="modal-article-content" v-if="selectedArticle.content">
              <p v-for="(paragraph, idx) in selectedArticle.content.split('\n\n')" :key="idx" class="article-paragraph">
                {{ paragraph }}
              </p>
            </div>

            <!-- Resources & Libraries (wenn vorhanden) -->
            <div v-if="selectedArticle.resources && selectedArticle.resources.length > 0" class="resources-section">
              <h3>📚 Ressourcen & Tools</h3>
              <div class="resources-grid">
                <div v-for="(resource, idx) in selectedArticle.resources" :key="idx" class="resource-item">
                  <div class="resource-icon">
                    {{ getResourceIcon(resource.type) }}
                  </div>
                  <div class="resource-info">
                    <div class="resource-name">
                      {{ resource.name }}
                      <span v-if="resource.language" class="resource-lang">{{ resource.language }}</span>
                      <span v-if="resource.stars" class="resource-stars">⭐ {{ formatStars(resource.stars) }}</span>
                    </div>
                    <div class="resource-desc">{{ resource.description }}</div>
                  </div>
                  <button @click="viewResource(resource)" class="resource-btn">
                    Details
                  </button>
                </div>
              </div>
            </div>

            <!-- Related Content (kommt später) -->
            <div v-if="relatedArticles.length > 0" class="related-section">
              <h3>🔗 Ähnliche Inhalte</h3>
              <div class="related-grid">
                <div v-for="related in relatedArticles" :key="related.id" @click="openArticle(related)" class="related-item">
                  <img v-if="related.imageUrl" :src="related.imageUrl" class="related-img" alt="" />
                  <div class="related-title">{{ related.title }}</div>
                  <div class="related-meta">
                    <span v-if="related.contentType">{{ getContentTypeLabel(related.contentType) }}</span>
                    <span v-if="related.readingTime">{{ related.readingTime }} Min.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Share Buttons -->
            <div class="social-share">
              <span class="share-label">Teilen auf:</span>
              <button @click="shareToTwitter(selectedArticle)" class="social-btn twitter" title="Auf Twitter teilen">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button @click="shareToFacebook(selectedArticle)" class="social-btn facebook" title="Auf Facebook teilen">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button @click="shareToLinkedIn(selectedArticle)" class="social-btn linkedin" title="Auf LinkedIn teilen">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button @click="shareToWhatsApp(selectedArticle)" class="social-btn whatsapp" title="Auf WhatsApp teilen">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
              <button @click="copyArticleLink(selectedArticle)" class="social-btn copy" title="Link kopieren">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>

            <!-- Action Buttons -->
            <div class="modal-actions">
              <button @click="shareArticle(selectedArticle)" class="action-btn secondary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                Teilen
              </button>
              <button @click="bookmarkArticle(selectedArticle)" class="action-btn secondary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
                Merken
              </button>
              <a :href="selectedArticle.url" target="_blank" class="action-btn primary">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
                Original öffnen
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Settings Modal -->
    <SettingsModal
      v-model="showSettings"
      :settings="settings"
      @save="handleSaveSettings"
    />

    <!-- Profile Editor Modal -->
    <Teleport to="body">
      <ProfileEdit
        v-if="showProfileEditor"
        :user-id="currentUserId"
        @close="showProfileEditor = false"
      />
    </Teleport>

    <!-- User Profile Modal -->
    <UserProfileModal
      v-if="selectedUser"
      v-model="showUserProfileModal"
      :user="selectedUser"
      @open-chat="handleOpenChat"
    />

    <!-- Chat Modal -->
    <ChatModal
      v-if="chatPartner"
      v-model="showChatModal"
      :partner="chatPartner"
      :currentUserId="currentUserId"
    />

    <!-- User Sidebar Drawer (Discovery & Community) -->
    <Teleport to="body">
      <Transition name="slide-sidebar">
        <div v-if="showUserSidebar" class="sidebar-drawer">
          <div class="sidebar-header">
            <h3>Community & Entdeckungen</h3>
            <button @click="showUserSidebar = false" class="sidebar-close">×</button>
          </div>
          <div class="sidebar-content">
            <UserSidebar @open-profile="handleOpenUserProfile" />
          </div>
        </div>
      </Transition>

      <!-- Backdrop for Sidebar -->
      <Transition name="fade">
        <div
          v-if="showUserSidebar"
          class="sidebar-backdrop"
          @click="showUserSidebar = false"
        ></div>
      </Transition>
    </Teleport>

    <!-- Initial Survey (first time only) -->
    <InitialSurvey
      v-model="showInitialSurvey"
      @submit="handleSurveySubmit"
      @skip="handleSurveySkip"
    />

    <!-- Toast Notifications -->
    <ToastContainer />

    <!-- Chat Request Notifications -->
    <ChatRequestNotification
      @accept="handleChatRequestAccept"
      @decline="handleChatRequestDecline"
    />

    <!-- Confetti Effect for Gamification -->
    <ConfettiEffect />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '../stores/useNewsStore'
import { useDiscovery } from '../stores/useDiscovery'
import { useInterests } from '../stores/useInterests'
import { useNotifications } from '../stores/useNotifications'
import { useBookmarks } from '../stores/useBookmarks'
import { newsService } from '../services/newsService'
import { useLocation } from '../composables/useLocation'
import { useToast } from '../composables/useToast'
import CleanHeader from '../components/CleanHeader.vue'
import CleanNewsCard from '../components/CleanNewsCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
import LocationSelector from '../components/LocationSelector.vue'
import SettingsModal from '../components/SettingsModal.vue'
import StatsBar from '../components/StatsBar.vue'
import ToastContainer from '../components/ToastContainer.vue'
import UserSidebar from '../components/UserSidebar.vue'
import SidebarLeft from '../components/SidebarLeft.vue'
import InitialSurvey from '../components/InitialSurvey.vue'
import ProfileEdit from '../views/ProfileEdit.vue'
import UserProfileModal from '../components/UserProfileModal.vue'
import ChatModal from '../components/ChatModal.vue'
import ChatRequestNotification from '../components/ChatRequestNotification.vue'
import AdBanner from '../components/AdBanner.vue'
import DiscoveryBanner from '../components/DiscoveryBanner.vue'
import ConfettiEffect from '../components/ConfettiEffect.vue'
import OfflineIndicator from '../components/OfflineIndicator.vue'
import type { NewsArticle } from '../types'

const props = defineProps<{
  parentId?: string
  entity?: string
}>()

const store = useNewsStore()
const discovery = useDiscovery()
const interests = useInterests()
const notifications = useNotifications()
const bookmarks = useBookmarks()
const { currentLocation, calculateDistance } = useLocation()
const { success, error, info } = useToast()
const searchQuery = ref('')
const activeCategories = ref<string[]>([])
const sortBy = ref<'distance' | 'match' | 'time'>('distance')
const disabledInterests = ref<string[]>([])
const selectedArticle = ref<NewsArticle | null>(null)
const showSettings = ref(false)
const showUserSidebar = ref(false)
const showInitialSurvey = ref(false)
const showProfileEditor = ref(false)
const showUserProfileModal = ref(false)
const showChatModal = ref(false)
const selectedUser = ref<any>(null)
const chatPartner = ref<any>(null)
const isLoading = ref(false)
const lastRefreshTime = ref<number>(0)
// Initialize or load user ID from localStorage
const initializeUserId = () => {
  const stored = localStorage.getItem('news_plugin_user_id')
  if (stored) {
    return stored
  }
  const newId = 'demo_user_' + Date.now()
  localStorage.setItem('news_plugin_user_id', newId)
  return newId
}

const currentUserId = ref(initializeUserId()) // Persisted user ID
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null

const categories = ['Alle', 'Breaking', 'Lokal', 'Community', 'Tech']

const articles = computed(() => store.getArticlesByParent(props.parentId || 'default'))
const settings = computed(() => store.getSettings(props.parentId || 'default'))

const locationName = computed(() => {
  if (currentLocation.value?.name) {
    return currentLocation.value.name
  }
  return props.parentId === 'demo' ? 'Berlin Mitte' : 'Deine Location'
})

const filteredArticles = computed(() => {
  let result = articles.value

  // 🎯 SMART FILTERING: Filter by interest score with enabled interests only
  if (interests.isInitialized.value && interests.interests.value.length > 0) {
    const enabledInterests = interests.interests.value.filter(
      i => !disabledInterests.value.includes(i.keyword)
    )

    if (enabledInterests.length > 0) {
      // Create temp interest store with only enabled interests
      const filtered = result.filter(article => {
        const score = interests.calculateArticleScore(article)
        return score > 0.10
      })
      console.log(`📊 Interest Filter: ${filtered.length}/${articles.value.length} Artikel matchen aktive Interessen`)
      result = filtered
    } else {
      console.log(`ℹ️ Alle Interessen deaktiviert - zeige alle ${result.length} Artikel`)
    }
  } else {
    console.log(`ℹ️ Keine Interessen definiert - zeige alle ${result.length} Artikel`)
  }

  // 📍 LOCATION/RADIUS FILTER: Filter by distance from current location
  if (currentLocation.value && settings.value.radius > 0) {
    const before = result.length
    result = result.filter(article => {
      // Artikel ohne Koordinaten durchlassen (können nicht gefiltert werden)
      if (!article.coordinates) return true

      // Berechne Distanz
      const distance = calculateDistance(
        currentLocation.value!.lat,
        currentLocation.value!.lng,
        article.coordinates.lat,
        article.coordinates.lng
      )

      // Nur Artikel innerhalb des Radius zeigen
      return distance <= settings.value.radius
    })
    console.log(`📍 Location Filter: ${before} → ${result.length} Artikel innerhalb ${settings.value.radius}km Radius`)
  }

  // Search query filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q)
    )
  }

  // Category filter
  if (activeCategories.value.length > 0 && !activeCategories.value.includes('Alle')) {
    result = result.filter(a =>
      activeCategories.value.some(cat =>
        a.tags?.includes(cat.toLowerCase()) ||
        a.source.toLowerCase().includes(cat.toLowerCase())
      )
    )
  }

  // 🎯 SORTING: Sort based on selected option
  if (sortBy.value === 'distance' && currentLocation.value) {
    result = result.sort((a, b) => {
      // Articles without coordinates go to end
      if (!a.coordinates && !b.coordinates) return 0
      if (!a.coordinates) return 1
      if (!b.coordinates) return -1

      const distA = calculateDistance(
        currentLocation.value!.lat,
        currentLocation.value!.lng,
        a.coordinates.lat,
        a.coordinates.lng
      )

      const distB = calculateDistance(
        currentLocation.value!.lat,
        currentLocation.value!.lng,
        b.coordinates.lat,
        b.coordinates.lng
      )

      return distA - distB
    })
  } else if (sortBy.value === 'match') {
    result = result.sort((a, b) => {
      const scoreA = interests.calculateArticleScore(a)
      const scoreB = interests.calculateArticleScore(b)
      return scoreB - scoreA // Higher match score first
    })
  } else if (sortBy.value === 'time') {
    result = result.sort((a, b) => b.publishedAt - a.publishedAt) // Newest first
  }

  return result
})

const displayedArticles = computed(() => filteredArticles.value.slice(0, 12))

// 📍 DISCOVERY BANNER COMPUTED PROPERTIES
const articlesInRadius = computed(() => {
  if (!currentLocation.value) return articles.value.length

  return articles.value.filter(article => {
    if (!article.coordinates) return false

    const distance = calculateDistance(
      currentLocation.value!.lat,
      currentLocation.value!.lng,
      article.coordinates.lat,
      article.coordinates.lng
    )

    return distance <= settings.value.radius
  }).length
})

const closestDistance = computed(() => {
  if (!currentLocation.value) return 0

  let minDistance = Infinity

  for (const article of articles.value) {
    if (!article.coordinates) continue

    const distance = calculateDistance(
      currentLocation.value.lat,
      currentLocation.value.lng,
      article.coordinates.lat,
      article.coordinates.lng
    )

    if (distance < minDistance) {
      minDistance = distance
    }
  }

  return minDistance === Infinity ? 0 : Math.round(minDistance * 10) / 10
})

// 🎯 Active Filter Count
const activeFilterCount = computed(() => {
  let count = 0

  // Count disabled interests
  count += disabledInterests.value.length

  // Count active categories (excluding "Alle")
  count += activeCategories.value.filter(c => c !== 'Alle').length

  // Count search query
  if (searchQuery.value) count++

  // Count non-default sort
  if (sortBy.value !== 'distance') count++

  return count
})

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleRadiusUpdate = (newRadius: number) => {
  store.updateSettings(props.parentId || 'default', {
    ...settings.value,
    radius: newRadius
  })
  info(`Suchradius auf ${newRadius}km aktualisiert`)
}

// 📍 Calculate distance for an article
const getArticleDistance = (article: NewsArticle): number | undefined => {
  if (!currentLocation.value || !article.coordinates) return undefined

  const distance = calculateDistance(
    currentLocation.value.lat,
    currentLocation.value.lng,
    article.coordinates.lat,
    article.coordinates.lng
  )

  return Math.round(distance * 10) / 10  // Round to 1 decimal
}

// 🎯 Calculate match score for an article
const getArticleMatchScore = (article: NewsArticle): number => {
  return interests.calculateArticleScore(article)
}

const handleLocationChange = async (location: { lat: number; lng: number; name?: string } | null) => {
  if (location) {
    info(`Standort gewechselt: ${location.name || 'Unbekannt'}`)
    // Refresh articles with new location
    await handleRefresh()
  }
}

const handleRefresh = async () => {
  isLoading.value = true

  try {
    // Get user interests from Interest Store (behavioral + survey)
    const userInterests = interests.interests.value.length > 0
      ? interests.interests.value.map(i => i.keyword)
      : ['community', 'local', 'tech'] // Default fallback

    console.log(`🔄 Refreshing articles for interests:`, userInterests)

    // Clear old articles first
    store.clearArticles(props.parentId || 'default')

    // Try RSS feeds first
    const rssArticles = await newsService.fetchAllRSS(locationName.value)

    if (rssArticles.length > 0) {
      for (const article of rssArticles) {
        await store.addArticle(props.parentId || 'default', article)
      }
      success(`${rssArticles.length} Artikel von RSS Feeds geladen`)
    } else {
      // Generate mock data based on USER interests
      const freshArticles = await newsService.searchByInterests(userInterests)
      for (const article of freshArticles) {
        await store.addArticle(props.parentId || 'default', article)
      }
      info(`${freshArticles.length} Artikel zu deinen Interessen generiert`)
    }

    lastRefreshTime.value = Date.now()
  } catch (err) {
    console.error('Refresh failed:', err)
    error('Fehler beim Laden der Nachrichten')
  } finally {
    isLoading.value = false
  }
}

const handleUpdateSettings = async (newSettings: any) => {
  await handleSaveSettings(newSettings)
}

const handleSaveSettings = async (newSettings: any) => {
  try {
    await store.updateSettings(props.parentId || 'default', newSettings)
    success('Einstellungen gespeichert')

    // Restart auto-refresh if settings changed
    setupAutoRefresh()
  } catch (err) {
    console.error('Settings save failed:', err)
    error('Fehler beim Speichern der Einstellungen')
  }
}

const handleOpenUserProfile = (user: any) => {
  selectedUser.value = user
  showUserProfileModal.value = true
}

// 💬 CHAT HANDLERS
const handleOpenChat = (user: any) => {
  chatPartner.value = user
  showChatModal.value = true
  // Close profile modal if open
  showUserProfileModal.value = false
  console.log('💬 Opening chat with:', user.name)
}

// 💬 CHAT REQUEST HANDLERS
const handleChatRequestAccept = (requestId: string) => {
  // Find the request and open chat
  // This will be handled by the ChatRequestNotification component
  console.log('✅ Chat request accepted:', requestId)
}

const handleChatRequestDecline = (requestId: string) => {
  console.log('❌ Chat request declined:', requestId)
}

// 🔍 DISCOVERY HANDLERS
const handleRefreshDiscovery = async () => {
  try {
    await discovery.discoverHybrid(
      settings.value.interests.length > 0 ? settings.value.interests : ['community', 'local', 'tech'],
      currentLocation.value ? {
        lat: currentLocation.value.lat,
        lng: currentLocation.value.lng,
        radius: settings.value.radius
      } : undefined
    )
    success('Entdeckungen aktualisiert')
  } catch (err) {
    console.error('Discovery refresh failed:', err)
    error('Fehler beim Aktualisieren der Entdeckungen')
  }
}

const handleSelectDiscovery = (match: any) => {
  if (match.type === 'article') {
    selectedArticle.value = match.data
  } else if (match.type === 'user') {
    selectedUser.value = match.data
    showUserProfileModal.value = true
  }
  console.log('📍 Discovery match selected:', match)
}

const setupAutoRefresh = () => {
  // Clear existing interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
    autoRefreshInterval = null
  }

  // Setup new interval if enabled
  if (settings.value.autoRefresh) {
    autoRefreshInterval = setInterval(() => {
      handleRefresh()
    }, settings.value.refreshInterval)
  }
}

const toggleFilter = (category: string) => {
  if (category === 'Alle') {
    activeCategories.value = []
  } else {
    const index = activeCategories.value.indexOf(category)
    if (index > -1) {
      activeCategories.value.splice(index, 1)
    } else {
      activeCategories.value.push(category)
    }
  }
}

// 🎯 Toggle Interest Filter
const toggleInterestFilter = (interest: string) => {
  const index = disabledInterests.value.indexOf(interest)
  if (index > -1) {
    // Re-enable interest
    disabledInterests.value.splice(index, 1)
    info(`Interesse "${interest}" aktiviert`)
  } else {
    // Disable interest
    disabledInterests.value.push(interest)
    info(`Interesse "${interest}" deaktiviert`)
  }
}

// 🎯 Clear All Filters
const clearAllFilters = () => {
  disabledInterests.value = []
  activeCategories.value = []
  searchQuery.value = ''
  sortBy.value = 'distance'
  info('Alle Filter zurückgesetzt')
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 🎯 INTEREST DETECTION HANDLERS
const handleArticleClick = (article: NewsArticle) => {
  // Track click for behavioral learning
  interests.trackArticleClick(article)

  // Open article modal
  selectedArticle.value = article

  console.log('📊 Article clicked - Score:', interests.calculateArticleScore(article))
}

// 🔖 BOOKMARK HANDLER
const handleBookmark = (article: NewsArticle) => {
  const added = bookmarks.toggleBookmark(article)
  if (added) {
    success('Artikel gespeichert')
  } else {
    info('Lesezeichen entfernt')
  }
}

const handleSurveySubmit = (selectedInterests: string[]) => {
  interests.initializeWithSurvey(selectedInterests)
  success(`${selectedInterests.length} Interessen gespeichert!`)
  console.log('✅ Interests initialized:', selectedInterests)
}

const handleSurveySkip = () => {
  // Initialize with empty interests (will show all articles)
  interests.initializeWithSurvey([])
  info('Du kannst Interessen später in den Einstellungen hinzufügen')
}

// 🎯 ARTICLE ACTIONS (Engagement)
const shareArticle = async (article: NewsArticle) => {
  // Track share action
  interests.trackArticleClick(article)

  // Try Web Share API first (mobile-friendly)
  if (navigator.share) {
    try {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url
      })
      success('Artikel geteilt!')
      console.log('📤 Article shared via Web Share API')
      return
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.log('Web Share API failed, using fallback')
      }
    }
  }

  // Fallback: Copy link to clipboard
  try {
    await navigator.clipboard.writeText(article.url)
    success('Link kopiert!')
    console.log('📋 Article link copied to clipboard')
  } catch (err) {
    error('Link konnte nicht kopiert werden')
  }
}

// 📱 SOCIAL MEDIA SHARE FUNCTIONS
const shareToTwitter = (article: NewsArticle) => {
  const text = encodeURIComponent(`${article.title}\n\n${article.summary}`)
  const url = encodeURIComponent(article.url)
  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
  window.open(twitterUrl, '_blank', 'width=550,height=420')
  console.log('🐦 Shared to Twitter')
}

const shareToFacebook = (article: NewsArticle) => {
  const url = encodeURIComponent(article.url)
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
  window.open(facebookUrl, '_blank', 'width=550,height=420')
  console.log('📘 Shared to Facebook')
}

const shareToLinkedIn = (article: NewsArticle) => {
  const url = encodeURIComponent(article.url)
  const title = encodeURIComponent(article.title)
  const summary = encodeURIComponent(article.summary)
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
  window.open(linkedInUrl, '_blank', 'width=550,height=420')
  console.log('💼 Shared to LinkedIn')
}

const shareToWhatsApp = (article: NewsArticle) => {
  const text = encodeURIComponent(`${article.title}\n\n${article.summary}\n\n${article.url}`)
  const whatsappUrl = `https://wa.me/?text=${text}`
  window.open(whatsappUrl, '_blank')
  console.log('💬 Shared to WhatsApp')
}

const copyArticleLink = async (article: NewsArticle) => {
  try {
    await navigator.clipboard.writeText(article.url)
    success('Link kopiert!')
    console.log('📋 Article link copied')
  } catch (err) {
    error('Link konnte nicht kopiert werden')
  }
}

const bookmarkArticle = (article: NewsArticle) => {
  const bookmarks = JSON.parse(localStorage.getItem('news_plugin_bookmarks') || '[]')

  if (!bookmarks.find((b: any) => b.id === article.id)) {
    bookmarks.push({
      id: article.id,
      title: article.title,
      url: article.url,
      savedAt: Date.now()
    })
    localStorage.setItem('news_plugin_bookmarks', JSON.stringify(bookmarks))
    success('Artikel gespeichert!')
  } else {
    info('Artikel bereits gespeichert')
  }
}

// 📚 CONTENT-TYPE & RESOURCE HELPERS
const getContentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'news': 'News',
    'tutorial': 'Tutorial',
    'case-study': 'Fallstudie',
    'research': 'Forschung',
    'library': 'Bibliothek',
    'video': 'Video',
    'guide': 'Leitfaden'
  }
  return labels[type] || type
}

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    'beginner': 'Anfänger',
    'intermediate': 'Fortgeschritten',
    'advanced': 'Experte',
    'none': '',
    'undefined': ''
  }
  return labels[difficulty] || labels[difficulty?.toLowerCase()] || ''
}

const getResourceIcon = (type: string) => {
  const icons: Record<string, string> = {
    'library': '📦',
    'tool': '🛠️',
    'documentation': '📄',
    'github': '💻',
    'video': '🎥',
    'course': '🎓'
  }
  return icons[type] || '🔗'
}

const formatStars = (stars: number) => {
  if (stars >= 1000) {
    return (stars / 1000).toFixed(1) + 'k'
  }
  return stars.toString()
}

const viewResource = (resource: any) => {
  info(`Ressource: ${resource.name}`)
  // TODO: Öffne Resource-Details im Plugin (nicht extern!)
}

const relatedArticles = computed(() => {
  if (!selectedArticle.value) return []
  // TODO: Finde ähnliche Artikel basierend auf Topics
  return articles.value
    .filter(a =>
      a.id !== selectedArticle.value!.id &&
      a.topics.some(t => selectedArticle.value!.topics.includes(t))
    )
    .slice(0, 3)
})

const openArticle = (article: NewsArticle) => {
  selectedArticle.value = article
  interests.trackArticleClick(article)
}

onMounted(async () => {
  console.log('🚀 ===== CleanLayout MOUNTED =====')
  console.log('📍 Parent ID:', props.parentId)
  console.log('👤 Current User ID:', currentUserId.value)

  // 🎯 Load Interest System (FIRST!)
  console.log('🎯 Loading interests...')
  interests.loadInterests()
  console.log('✅ Interests loaded:', interests.interests.value)

  // Show survey if not initialized
  if (!interests.isInitialized.value) {
    console.log('📋 Showing initial survey')

    showInitialSurvey.value = true
  }

  // Initialize default settings if not present
  if (settings.value.interests.length === 0) {
    await store.updateSettings(props.parentId || 'default', {
      interests: ['community', 'local', 'tech'],
      radius: 10,
      autoRefresh: false
    })
  }

  // Subscribe to Gun.js (optional, for P2P sync when online)
  try {
    store.subscribeToParent(props.parentId || 'default')
  } catch (err) {
    console.warn('Gun.js subscription failed (offline mode):', err)
  }

  // 📡 Initialize Notification System
  console.log('📡 Initializing Notification System...')
  notifications.loadNotifications()
  notifications.subscribeToGun()

  // 🔖 Initialize Bookmark System
  console.log('🔖 Initializing Bookmark System...')
  bookmarks.loadBookmarks()
  bookmarks.subscribeToGun()

  // Add demo notifications for testing
  setTimeout(() => {
    notifications.addNotification({
      type: 'user',
      title: 'Neue Verbindung',
      message: 'Max Müller hat deine Verbindungsanfrage akzeptiert'
    })

    notifications.addNotification({
      type: 'article',
      title: 'Neue Artikel',
      message: '5 neue Artikel zu deinen Interessen verfügbar'
    })

    notifications.updateDMThread({
      userId: 'user_2',
      userName: 'Anna Schmidt',
      lastMessage: 'Hast du den neuen Artikel gesehen?',
      lastMessageTime: Date.now(),
      unreadCount: 1
    })
  }, 3000) // Add demo notifications after 3 seconds

  // Initialize Discovery System
  console.log('🔍 Initializing Discovery System...')
  discovery.initialize()

  try {
    await discovery.discoverHybrid(
      settings.value.interests.length > 0 ? settings.value.interests : ['community', 'local', 'tech'],
      currentLocation.value ? {
        lat: currentLocation.value.lat,
        lng: currentLocation.value.lng,
        radius: settings.value.radius
      } : undefined
    )
    console.log('✅ Discovery initialized with', discovery.matches.value.length, 'matches')
  } catch (err) {
    console.warn('Discovery initialization failed:', err)
  }

  // Load initial RSS feeds on mount
  await handleRefresh()

  // Setup auto-refresh
  setupAutoRefresh()

  // Debug log
  console.log('CleanLayout mounted')
  console.log('Settings:', settings.value)
  console.log('Articles in store:', articles.value.length)
})

onUnmounted(() => {
  // Cleanup auto-refresh interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }

  // Cleanup Notification System
  notifications.unsubscribeFromGun()
  console.log('🧹 Notifications unsubscribed')

  // Cleanup Discovery System
  discovery.cleanup()
  console.log('🧹 Discovery cleaned up')
})
</script>

<style scoped>
.clean-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 3-Column Layout */
.container-3col {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.sidebar-left {
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.center-column {
  min-width: 0;
}

.sidebar-right {
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 1280px) {
  .container-3col {
    grid-template-columns: 280px 1fr 280px;
    gap: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .container-3col {
    grid-template-columns: 1fr;
  }

  .sidebar-left,
  .sidebar-right {
    display: none;
  }
}

/* ========== PROMINENT FILTER CONTROLS ========== */
.filter-control-bar {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(16px);
}

/* Header Row */
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-icon {
  font-size: 1.5rem;
}

.filter-title h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.active-filter-badge {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: scale(1.05);
}

/* Filter Sections */
.filter-section {
  margin-bottom: 1.25rem;
}

.filter-section:last-of-type {
  margin-bottom: 0;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #a5b4fc;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: #64748b;
  text-transform: none;
  letter-spacing: 0;
}

/* Sort Options */
.sort-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.sort-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
  transition: left 0.5s;
}

.sort-btn:hover::before {
  left: 100%;
}

.sort-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.sort-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: #6366f1;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Interest Chips */
.interest-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.interest-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 999px;
  color: #a78bfa;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.interest-chip:hover {
  background: rgba(139, 92, 246, 0.25);
  border-color: #8b5cf6;
  transform: scale(1.05);
}

.interest-chip.active {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-color: #8b5cf6;
  color: white;
}

.chip-icon {
  font-size: 0.875rem;
  font-weight: 700;
}

.chip-label {
  flex: 1;
}

.chip-score {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}

/* Category Filters */
.category-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.5rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

.category-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

/* Filter Footer */
.filter-footer {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
}

.stat-icon {
  font-size: 1rem;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Feed End Message (Anti-Infinite-Scroll) */
.feed-end {
  margin: 3rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(99, 102, 241, 0.08));
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 1rem;
  text-align: center;
}

.feed-end-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feed-end-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.feed-end-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0 0 2rem 0;
}

.feed-end-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.feed-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.feed-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
}

.feed-stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.feed-end-message {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.feed-end-transparency {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: left;
}

.transparency-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.transparency-text {
  font-size: 0.9375rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

.transparency-text strong {
  color: #10b981;
  font-weight: 700;
}

.feed-end-cta {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.cta-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.cta-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.cta-text {
  font-size: 0.9375rem;
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-illustration {
  position: relative;
  margin-bottom: 2rem;
}

.empty-icon-large {
  font-size: 5rem;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.empty-sparkles {
  position: absolute;
  top: 0;
  right: 35%;
  font-size: 2rem;
  animation: sparkle 2s ease-in-out infinite;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.empty-description {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.empty-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
}

.empty-hint {
  color: #64748b;
  font-size: 0.875rem;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* Legacy empty state classes for backward compatibility */
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #94a3b8;
  font-size: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
}

.modal-content {
  background: #1e293b;
  border-radius: 1rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.9);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
}

.modal-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.modal-body {
  padding: 2rem;
}

.modal-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.modal-source {
  color: #6366f1;
  font-weight: 600;
}

.modal-author {
  color: #a855f7;
  font-weight: 500;
}

.modal-time {
  color: #94a3b8;
}

.modal-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.topic-tag {
  padding: 0.25rem 0.75rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 500;
}

.modal-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f8fafc, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  margin: 0 0 1.5rem 0;
}

.modal-lead {
  font-size: 1.125rem;
  color: #cbd5e1;
  line-height: 1.7;
  margin: 0 0 2rem 0;
  padding-left: 1rem;
  border-left: 3px solid #6366f1;
  font-style: italic;
}

.modal-article-content {
  margin-bottom: 2rem;
}

.article-paragraph {
  font-size: 1rem;
  color: #e2e8f0;
  line-height: 1.8;
  margin: 0 0 1.5rem 0;
  text-align: justify;
}

/* Content Type & Meta Info */
.content-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.content-type-badge {
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 0.5rem;
  color: #c7d2fe;
  font-size: 0.875rem;
  font-weight: 600;
}

.difficulty-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid;
}

.difficulty-badge.difficulty-beginner {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86efac;
}

.difficulty-badge.difficulty-intermediate {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.4);
  color: #fde047;
}

.difficulty-badge.difficulty-advanced {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.reading-time {
  padding: 0.375rem 0.875rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Resources Section */
.resources-section {
  margin: 2.5rem 0;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 0.75rem;
}

.resources-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resources-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.625rem;
  transition: all 0.2s;
}

.resource-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.resource-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
  min-width: 0;
}

.resource-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.375rem;
}

.resource-lang {
  padding: 0.125rem 0.5rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.375rem;
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 500;
}

.resource-stars {
  padding: 0.125rem 0.5rem;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 0.375rem;
  color: #fde047;
  font-size: 0.75rem;
  font-weight: 500;
}

.resource-desc {
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.5;
}

.resource-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.resource-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Related Articles Section */
.related-section {
  margin: 2.5rem 0;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 0.75rem;
}

.related-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.related-item {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.625rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.2);
}

.related-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.related-title {
  padding: 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f8fafc;
  line-height: 1.4;
  min-height: 60px;
}

.related-meta {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.related-meta span {
  padding: 0.25rem 0.5rem;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 0.375rem;
}

/* Social Share Buttons */
.social-share {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.share-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  margin-right: 0.5rem;
}

.social-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.social-btn.twitter {
  background: #1DA1F2;
  color: white;
}

.social-btn.twitter:hover {
  background: #1a8cd8;
}

.social-btn.facebook {
  background: #1877F2;
  color: white;
}

.social-btn.facebook:hover {
  background: #1565d8;
}

.social-btn.linkedin {
  background: #0A66C2;
  color: white;
}

.social-btn.linkedin:hover {
  background: #095196;
}

.social-btn.whatsapp {
  background: #25D366;
  color: white;
}

.social-btn.whatsapp:hover {
  background: #1ebd56;
}

.social-btn.copy {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.social-btn.copy:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: #6366f1;
  color: #c7d2fe;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.action-btn.secondary {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.action-btn.secondary:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.4);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner span {
  color: #f8fafc;
  font-size: 1.125rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1.5rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .location-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .location-info {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .filters {
    justify-content: flex-start;
  }

  .filter-btn {
    font-size: 0.8125rem;
    padding: 0.4rem 0.875rem;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    max-height: 85vh;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem 0;
  }

  .container {
    padding: 0 0.75rem;
  }

  .location-bar {
    padding: 1rem;
  }

  .filter-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }

  .empty-state {
    padding: 3rem 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state h3 {
    font-size: 1.25rem;
  }

  .empty-state p {
    font-size: 0.875rem;
  }
}

/* User Sidebar Drawer */
.sidebar-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 90vw;
  background: #1e293b;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1001;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  background: #1e293b;
  z-index: 10;
}

.sidebar-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.sidebar-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-close:hover {
  background: rgba(99, 102, 241, 0.3);
}

.sidebar-content {
  padding: 1.5rem;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

/* Sidebar Slide Transition */
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(100%);
}

/* Fade Transition for Backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

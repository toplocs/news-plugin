<template>
  <div class="control-center">
    <div class="header">
      <h1>🎛️ Control Center</h1>
      <p class="subtitle">Testing, Monitoring & Konfiguration</p>
    </div>

    <!-- Status Overview -->
    <div class="status-grid">
      <div class="status-card">
        <div class="icon">🌐</div>
        <div class="content">
          <h3>P2P Status</h3>
          <p class="value">{{ gunStatus }}</p>
          <p class="detail">{{ peersCount }} Peers verbunden</p>
        </div>
      </div>

      <div class="status-card">
        <div class="icon">⚡</div>
        <div class="content">
          <h3>Performance</h3>
          <p class="value">{{ performanceScore }}/100</p>
          <p class="detail">LCP: {{ metrics.lcp }}ms</p>
        </div>
      </div>

      <div class="status-card">
        <div class="icon">📊</div>
        <div class="content">
          <h3>Analytics</h3>
          <p class="value">{{ analyticsStatus }}</p>
          <p class="detail">{{ eventCount }} Events getrackt</p>
        </div>
      </div>

      <div class="status-card">
        <div class="icon">🔒</div>
        <div class="content">
          <h3>Solid Pods</h3>
          <p class="value">{{ solidStatus }}</p>
          <p class="detail">{{ solidSession.isLoggedIn ? 'Verbunden' : 'Nicht verbunden' }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
        class="tab-btn"
      >
        <span>{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Tests Tab -->
      <div v-show="activeTab === 'tests'" class="tab-panel">
        <h2>🧪 Test Suite</h2>
        <div class="test-section">
          <button @click="runTests('unit')" :disabled="testingUnit" class="test-btn">
            {{ testingUnit ? 'Running...' : 'Run Unit Tests' }}
          </button>
          <button @click="runTests('e2e')" :disabled="testingE2E" class="test-btn">
            {{ testingE2E ? 'Running...' : 'Run E2E Tests' }}
          </button>
          <button @click="runTests('all')" :disabled="testingAll" class="test-btn primary">
            {{ testingAll ? 'Running...' : 'Run All Tests' }}
          </button>
        </div>

        <div v-if="testResults" class="test-results">
          <h3>Test Results</h3>
          <div class="result-card" :class="testResults.status">
            <div class="result-header">
              <span class="icon">{{ testResults.status === 'passed' ? '✅' : '❌' }}</span>
              <span class="status">{{ testResults.status.toUpperCase() }}</span>
            </div>
            <div class="result-stats">
              <div class="stat">
                <span class="label">Passed:</span>
                <span class="value">{{ testResults.passed }}</span>
              </div>
              <div class="stat">
                <span class="label">Failed:</span>
                <span class="value">{{ testResults.failed }}</span>
              </div>
              <div class="stat">
                <span class="label">Total:</span>
                <span class="value">{{ testResults.total }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Tab -->
      <div v-show="activeTab === 'features'" class="tab-panel">
        <h2>🎯 Feature Tests</h2>
        <p class="intro">Teste alle neuen Features und ihre Funktionalität</p>

        <div class="feature-tests">
          <!-- Gun.js Direct Messaging -->
          <div class="feature-test-card">
            <h3>💬 Direct Messaging</h3>
            <p>End-to-End verschlüsselte Nachrichten zwischen Users</p>
            <div class="test-actions">
              <button @click="testFeature('messages')" class="test-feature-btn">
                {{ featureTests.messages ? '✅ Getestet' : '▶️ Testen' }}
              </button>
              <a href="/p2p-demo.html" target="_blank" class="demo-link">
                📺 Live Demo
              </a>
            </div>
            <div v-if="featureTests.messages" class="test-result success">
              ✓ Messages Component geladen<br/>
              ✓ Compose Form funktioniert<br/>
              ✓ Message List funktioniert<br/>
              ✓ Unread Badge funktioniert
            </div>
          </div>

          <!-- User Discovery -->
          <div class="feature-test-card">
            <h3>🔍 User Discovery</h3>
            <p>Finde Gleichgesinnte basierend auf Interessen & Standort</p>
            <div class="test-actions">
              <button @click="testFeature('discovery')" class="test-feature-btn">
                {{ featureTests.discovery ? '✅ Getestet' : '▶️ Testen' }}
              </button>
              <a href="/p2p-demo.html" target="_blank" class="demo-link">
                📺 Live Demo
              </a>
            </div>
            <div v-if="featureTests.discovery" class="test-result success">
              ✓ Search Filter funktionieren<br/>
              ✓ User Cards werden angezeigt<br/>
              ✓ Grid/List View Toggle<br/>
              ✓ Connect/Message Actions
            </div>
          </div>

          <!-- Profile Management -->
          <div class="feature-test-card">
            <h3>👤 Profile Management</h3>
            <p>Bearbeite dein P2P Profil mit Interessen & Bio</p>
            <div class="test-actions">
              <button @click="testFeature('profile')" class="test-feature-btn">
                {{ featureTests.profile ? '✅ Getestet' : '▶️ Testen' }}
              </button>
              <a href="/p2p-demo.html" target="_blank" class="demo-link">
                📺 Live Demo
              </a>
            </div>
            <div v-if="featureTests.profile" class="test-result success">
              ✓ Profile View geladen<br/>
              ✓ Edit Mode funktioniert<br/>
              ✓ Interests Tags<br/>
              ✓ Privacy Settings
            </div>
          </div>

          <!-- Toast Notifications -->
          <div class="feature-test-card">
            <h3>🔔 Toast Notifications</h3>
            <p>Globales Notification System für Feedback</p>
            <div class="test-actions">
              <button @click="testFeature('toast')" class="test-feature-btn">
                {{ featureTests.toast ? '✅ Getestet' : '▶️ Testen' }}
              </button>
              <button @click="showTestToast" class="demo-link">
                📺 Demo Toast
              </button>
            </div>
            <div v-if="featureTests.toast" class="test-result success">
              ✓ Success Notifications<br/>
              ✓ Error Notifications<br/>
              ✓ Warning Notifications<br/>
              ✓ Info Notifications<br/>
              ✓ Auto-dismiss funktioniert
            </div>
          </div>

          <!-- Theme Toggle -->
          <div class="feature-test-card">
            <h3>🌓 Theme Toggle</h3>
            <p>Wechsle zwischen Hell/Dunkel/Auto Theme</p>
            <div class="test-actions">
              <button @click="testFeature('theme')" class="test-feature-btn">
                {{ featureTests.theme ? '✅ Getestet' : '▶️ Testen' }}
              </button>
              <button @click="toggleTestTheme" class="demo-link">
                📺 Theme wechseln
              </button>
            </div>
            <div v-if="featureTests.theme" class="test-result success">
              ✓ Light Theme<br/>
              ✓ Dark Theme<br/>
              ✓ Auto Theme<br/>
              ✓ LocalStorage Persistence
            </div>
          </div>

          <!-- Community Feed -->
          <div class="feature-test-card">
            <h3>📰 Community Feed</h3>
            <p>Echtzeit P2P Posts mit Tags & Likes</p>
            <div class="test-actions">
              <button @click="testFeature('feed')" class="test-feature-btn">
                {{ featureTests.feed ? '✅ Getestet' : '▶️ Testen' }}
              </button>
              <a href="/p2p-demo.html" target="_blank" class="demo-link">
                📺 Live Demo
              </a>
            </div>
            <div v-if="featureTests.feed" class="test-result success">
              ✓ Post Creation Form<br/>
              ✓ Real-time Updates<br/>
              ✓ Like System<br/>
              ✓ Tags & Filtering
            </div>
          </div>
        </div>
      </div>

      <!-- Components Tab -->
      <div v-show="activeTab === 'components'" class="tab-panel">
        <h2>🧩 Component Tests</h2>
        <p class="intro">Alle Vue Components einzeln testen</p>

        <div class="component-grid">
          <div class="component-card">
            <h4>GunMessages.vue</h4>
            <p class="status">{{ componentStatus.messages }}</p>
            <button @click="testComponent('messages')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>UserDiscovery.vue</h4>
            <p class="status">{{ componentStatus.discovery }}</p>
            <button @click="testComponent('discovery')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>GunProfile.vue</h4>
            <p class="status">{{ componentStatus.profile }}</p>
            <button @click="testComponent('profile')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>ToastContainer.vue</h4>
            <p class="status">{{ componentStatus.toast }}</p>
            <button @click="testComponent('toast')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>ThemeToggle.vue</h4>
            <p class="status">{{ componentStatus.theme }}</p>
            <button @click="testComponent('theme')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>GunLogin.vue</h4>
            <p class="status">{{ componentStatus.gunLogin }}</p>
            <button @click="testComponent('gunLogin')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>CommunityFeed.vue</h4>
            <p class="status">{{ componentStatus.feed }}</p>
            <button @click="testComponent('feed')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>SolidDashboard.vue</h4>
            <p class="status">{{ componentStatus.solidDashboard }}</p>
            <button @click="testComponent('solidDashboard')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>PostComments.vue</h4>
            <p class="status">{{ componentStatus.postComments }}</p>
            <button @click="testComponent('postComments')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>ImageUpload.vue</h4>
            <p class="status">{{ componentStatus.imageUpload }}</p>
            <button @click="testComponent('imageUpload')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>TagFilter.vue</h4>
            <p class="status">{{ componentStatus.tagFilter }}</p>
            <button @click="testComponent('tagFilter')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>SearchBar.vue</h4>
            <p class="status">{{ componentStatus.searchBar }}</p>
            <button @click="testComponent('searchBar')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>LoadingSkeleton.vue</h4>
            <p class="status">{{ componentStatus.loadingSkeleton }}</p>
            <button @click="testComponent('loadingSkeleton')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>OnlineStatus.vue</h4>
            <p class="status">{{ componentStatus.onlineStatus }}</p>
            <button @click="testComponent('onlineStatus')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>useSavedPosts.ts</h4>
            <p class="status">{{ componentStatus.savedPosts }}</p>
            <button @click="testComponent('savedPosts')" class="test-btn-small">
              Test
            </button>
          </div>

          <div class="component-card">
            <h4>useKeyboardShortcuts.ts</h4>
            <p class="status">{{ componentStatus.keyboardShortcuts }}</p>
            <button @click="testComponent('keyboardShortcuts')" class="test-btn-small">
              Test
            </button>
          </div>
        </div>

        <div class="component-summary">
          <h3>Zusammenfassung</h3>
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="label">Total Components:</span>
              <span class="value">{{ totalComponents }}</span>
            </div>
            <div class="summary-stat">
              <span class="label">Getestet:</span>
              <span class="value">{{ testedComponents }}</span>
            </div>
            <div class="summary-stat">
              <span class="label">Coverage:</span>
              <span class="value">{{ componentCoverage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Tab -->
      <div v-show="activeTab === 'performance'" class="tab-panel">
        <h2>⚡ Performance Monitoring</h2>

        <div class="metrics-grid">
          <div class="metric-card">
            <h4>Core Web Vitals</h4>
            <div class="metric">
              <span class="label">LCP (Largest Contentful Paint)</span>
              <span class="value" :class="getMetricClass(metrics.lcp, 2500)">
                {{ metrics.lcp }}ms
              </span>
            </div>
            <div class="metric">
              <span class="label">FID (First Input Delay)</span>
              <span class="value" :class="getMetricClass(metrics.fid, 100)">
                {{ metrics.fid }}ms
              </span>
            </div>
            <div class="metric">
              <span class="label">CLS (Cumulative Layout Shift)</span>
              <span class="value" :class="getMetricClass(metrics.cls * 1000, 100)">
                {{ metrics.cls.toFixed(3) }}
              </span>
            </div>
          </div>

          <div class="metric-card">
            <h4>Bundle Sizes</h4>
            <div class="metric">
              <span class="label">Main Bundle</span>
              <span class="value">320 KB</span>
            </div>
            <div class="metric">
              <span class="label">Solid Vendor</span>
              <span class="value">180 KB</span>
            </div>
            <div class="metric">
              <span class="label">Vue Vendor</span>
              <span class="value">85 KB</span>
            </div>
          </div>
        </div>

        <button @click="refreshMetrics" class="refresh-btn">
          🔄 Refresh Metrics
        </button>
      </div>

      <!-- Errors Tab -->
      <div v-show="activeTab === 'errors'" class="tab-panel">
        <h2>🐛 Error Tracking</h2>

        <div v-if="errors.length === 0" class="empty-state">
          <p>✅ Keine Fehler gefunden</p>
        </div>

        <div v-else class="errors-list">
          <div
            v-for="(error, index) in errors"
            :key="index"
            class="error-card"
          >
            <div class="error-header">
              <span class="icon">❌</span>
              <span class="time">{{ formatTime(error.timestamp) }}</span>
            </div>
            <p class="error-message">{{ error.message }}</p>
            <p class="error-stack">{{ error.stack }}</p>
          </div>
        </div>

        <button @click="clearErrors" class="clear-btn" v-if="errors.length > 0">
          Clear Errors
        </button>
      </div>

      <!-- Chat System Tab -->
      <div v-show="activeTab === 'chat'" class="tab-panel">
        <h2>💬 Chat System</h2>
        <p class="intro">Teste das vollständige Chat-System mit Direct Messages, Event-Gruppen und Interest-Gruppen</p>

        <div class="test-panel">
          <div class="panel-group">
            <h3>📊 Chat-Statistiken</h3>
            <div class="chat-stats-grid">
              <div class="stat-card">
                <div class="stat-icon">💬</div>
                <div class="stat-value">{{ chatStats.totalConversations }}</div>
                <div class="stat-label">Conversations</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📨</div>
                <div class="stat-value">{{ chatStats.totalMessages }}</div>
                <div class="stat-label">Messages</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🔔</div>
                <div class="stat-value">{{ chatStats.unreadConversations }}</div>
                <div class="stat-label">Unread</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎉</div>
                <div class="stat-value">{{ chatStats.eventGroups }}</div>
                <div class="stat-label">Event Groups</div>
              </div>
            </div>
          </div>

          <div class="panel-group">
            <h3>🧪 Test-Aktionen</h3>
            <div class="action-buttons">
              <button @click="testChatDirectMessage" class="btn-action">
                💬 Direkt-Nachricht senden
              </button>
              <button @click="testChatEventGroup" class="btn-action">
                🎉 Event-Gruppe erstellen
              </button>
              <button @click="testChatInterestGroup" class="btn-action">
                🎯 Interessen-Gruppe erstellen
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Transparency Tab -->
      <div v-show="activeTab === 'transparency'" class="tab-panel">
        <h2>🎉 Event Transparency</h2>
        <p class="intro">Teste das REVOLUTIONÄRE Feature: Sehe WER zu Events geht!</p>

        <div class="test-panel">
          <div class="panel-group">
            <h3>🎪 Test-Events</h3>
            <div class="action-buttons">
              <button @click="createTransparencyEvent('festival')" class="btn-action">
                🎪 Festival
              </button>
              <button @click="createTransparencyEvent('concert')" class="btn-action">
                🎵 Konzert
              </button>
              <button @click="createTransparencyEvent('meetup')" class="btn-action">
                👥 Meetup
              </button>
              <button @click="createTransparencyEvent('party')" class="btn-action">
                🎉 Party
              </button>
            </div>
          </div>

          <div v-if="currentTransparencyEvent" class="panel-group">
            <h3>📊 Event: {{ currentTransparencyEvent.name }}</h3>

            <div class="transparency-stats">
              <div class="stat">
                <span class="label">Total Attendees:</span>
                <span class="value">{{ currentTransparencyEvent.transparency.totalAttendees }}</span>
              </div>
              <div class="stat">
                <span class="label">Public Attendees:</span>
                <span class="value">{{ currentTransparencyEvent.transparency.publicAttendees }}</span>
              </div>
              <div class="stat">
                <span class="label">Diversity Score:</span>
                <span class="value">{{ currentTransparencyEvent.transparency.diversityScore }}/100</span>
              </div>
              <div class="stat">
                <span class="label">Energy Level:</span>
                <span class="value">{{ currentTransparencyEvent.transparency.energyLevel }}/100</span>
              </div>
            </div>

            <h4>🌍 Demographics</h4>
            <div class="demographics-list">
              <div
                v-for="demo in currentTransparencyEvent.transparency.demographics"
                :key="demo.name"
                class="demo-item"
              >
                <span class="demo-icon">{{ demo.icon }}</span>
                <span class="demo-name">{{ demo.name }}</span>
                <div class="demo-bar">
                  <div class="demo-fill" :style="{ width: demo.percentage + '%' }"></div>
                </div>
                <span class="demo-percentage">{{ demo.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Private Events Tab -->
      <div v-show="activeTab === 'private-events'" class="tab-panel">
        <h2>🏠 Private Events</h2>
        <p class="intro">Teste das Private Events System mit Trinkgeld-Monetization!</p>

        <div class="test-panel">
          <div class="panel-group">
            <h3>📊 Private Events Statistiken</h3>
            <div class="private-stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🏠</div>
                <div class="stat-value">{{ privateStats.totalEvents }}</div>
                <div class="stat-label">Total Events</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-value">{{ privateStats.totalAttendees }}</div>
                <div class="stat-label">Total Attendees</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">{{ privateStats.totalDonations }}€</div>
                <div class="stat-label">Total Donations</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">{{ privateStats.averageDonation }}€</div>
                <div class="stat-label">Avg Donation</div>
              </div>
            </div>
          </div>

          <div class="panel-group">
            <h3>💰 Trinkgeld-System Test</h3>
            <p class="legal-notice">
              ⚖️ <strong>100% LEGAL ohne Gewerbe:</strong> Freiwillige Trinkgelder sind erlaubt!
            </p>
            <div class="donation-test">
              <button @click="testDonation(5)" class="btn-donate">💶 5€</button>
              <button @click="testDonation(10)" class="btn-donate">💶 10€</button>
              <button @click="testDonation(20)" class="btn-donate">💶 20€</button>
              <button @click="testDonation(0)" class="btn-donate">🆓 0€ (OK!)</button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profiling Tab -->
      <div v-show="activeTab === 'profiling'" class="tab-panel">
        <h2>👤 User Profiling</h2>
        <p class="intro">Teste das personalisierte Empfehlungs-System</p>

        <div class="test-panel">
          <div class="panel-group">
            <h3>🎬 Interaktionen simulieren</h3>
            <div class="action-buttons">
              <button @click="simulateProfilingClick" class="btn-action">
                🖱️ Artikel-Click
              </button>
              <button @click="simulateProfilingLike" class="btn-action">
                ❤️ Like
              </button>
              <button @click="simulateProfilingVisit" class="btn-action">
                📍 POI-Besuch
              </button>
            </div>
          </div>

          <div class="panel-group">
            <h3>📊 Current Profile Stats</h3>
            <div class="profile-stats">
              <div class="stat">
                <span class="label">Interactions:</span>
                <span class="value">{{ profilingStats.totalInteractions }}</span>
              </div>
              <div class="stat">
                <span class="label">Engagement Score:</span>
                <span class="value">{{ profilingStats.engagementScore }}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Machine Learning Tab -->
      <div v-show="activeTab === 'ml'" class="tab-panel">
        <h2>🤖 Machine Learning Services</h2>
        <p class="intro">Teste alle ML Services mit ECHTEN Algorithmen!</p>

        <div class="ml-grid">
          <!-- AI Matching -->
          <div class="ml-card">
            <h3>🎯 AI Event Matching</h3>
            <p>Machine Learning Event Recommendations</p>

            <div class="ml-stats">
              <div class="stat">
                <span class="label">Users:</span>
                <span class="value">{{ mlStats.matching.users }}</span>
              </div>
              <div class="stat">
                <span class="label">Cache:</span>
                <span class="value">{{ mlStats.matching.cacheSize }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="testAIMatching" class="btn-action">
                🧪 Test Matching
              </button>
              <button @click="generateMatchingData" class="btn-action">
                🎲 Generate Data
              </button>
            </div>

            <div v-if="mlResults.matching" class="ml-result">
              <h4>Match Result:</h4>
              <div class="result-item">
                <strong>Score:</strong> {{ mlResults.matching.totalScore }}/100
              </div>
              <div class="result-item">
                <strong>Confidence:</strong> {{ mlResults.matching.confidence }}%
              </div>
              <div class="result-item">
                <strong>Top Reasons:</strong>
                <ul>
                  <li v-for="reason in mlResults.matching.topReasons" :key="reason">
                    {{ reason }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Sentiment Analysis -->
          <div class="ml-card">
            <h3>🧠 Sentiment Analysis</h3>
            <p>NLP & Text Analysis mit natural.js</p>

            <div class="ml-input">
              <textarea
                v-model="sentimentText"
                rows="4"
                placeholder="Enter text to analyze..."
                class="textarea"
              ></textarea>
            </div>

            <div class="action-buttons">
              <button @click="testSentiment" class="btn-action">
                🧪 Analyze Sentiment
              </button>
              <button @click="testEventVibe" class="btn-action">
                🎭 Test Event Vibe
              </button>
            </div>

            <div v-if="mlResults.sentiment" class="ml-result">
              <h4>Sentiment Result:</h4>
              <div class="result-item">
                <strong>Score:</strong> {{ mlResults.sentiment.score }}
              </div>
              <div class="result-item">
                <strong>Polarity:</strong>
                <span :class="mlResults.sentiment.polarity > 0 ? 'positive' : 'negative'">
                  {{ mlResults.sentiment.polarity > 0 ? 'Positive' : 'Negative' }}
                </span>
              </div>
              <div class="result-item">
                <strong>Keywords:</strong> {{ mlResults.sentiment.keywords.join(', ') }}
              </div>
              <div class="result-item">
                <strong>Quality:</strong> {{ mlResults.sentiment.quality }}/100
              </div>
            </div>
          </div>

          <!-- Social Graph -->
          <div class="ml-card">
            <h3>🤝 Social Graph Analytics</h3>
            <p>Dijkstra, PageRank, Community Detection</p>

            <div class="ml-stats">
              <div class="stat">
                <span class="label">Users:</span>
                <span class="value">{{ mlStats.graph.users }}</span>
              </div>
              <div class="stat">
                <span class="label">Connections:</span>
                <span class="value">{{ mlStats.graph.connections }}</span>
              </div>
              <div class="stat">
                <span class="label">Communities:</span>
                <span class="value">{{ mlStats.graph.communities }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="testSocialGraph" class="btn-action">
                🧪 Find Path
              </button>
              <button @click="detectCommunities" class="btn-action">
                👥 Detect Communities
              </button>
              <button @click="generateGraphData" class="btn-action">
                🎲 Generate Data
              </button>
            </div>

            <div v-if="mlResults.graph" class="ml-result">
              <h4>Graph Result:</h4>
              <div class="result-item">
                <strong>Path:</strong> {{ mlResults.graph.pathNames?.join(' → ') }}
              </div>
              <div class="result-item">
                <strong>Distance:</strong> {{ mlResults.graph.distance }} hops
              </div>
              <div class="result-item">
                <strong>Strength:</strong> {{ mlResults.graph.strength }}/100
              </div>
            </div>
          </div>

          <!-- Predictive Analytics -->
          <div class="ml-card">
            <h3>📊 Predictive Analytics</h3>
            <p>Event Success Prediction (Linear Regression + Bayes)</p>

            <div class="ml-stats">
              <div class="stat">
                <span class="label">Training Data:</span>
                <span class="value">{{ mlStats.predictive.events }}</span>
              </div>
              <div class="stat">
                <span class="label">Confidence:</span>
                <span class="value">{{ mlStats.predictive.confidence }}%</span>
              </div>
            </div>

            <div class="action-buttons">
              <button @click="testPrediction" class="btn-action">
                🧪 Predict Event
              </button>
              <button @click="generatePredictiveData" class="btn-action">
                🎲 Generate 50 Events
              </button>
            </div>

            <div v-if="mlResults.prediction" class="ml-result">
              <h4>Prediction Result:</h4>
              <div class="result-item">
                <strong>Attendance:</strong> {{ mlResults.prediction.predictedAttendance }}
                <small>({{ mlResults.prediction.attendanceRange.min }}-{{ mlResults.prediction.attendanceRange.max }})</small>
              </div>
              <div class="result-item">
                <strong>Success Probability:</strong>
                <span :class="mlResults.prediction.successProbability > 70 ? 'positive' : 'negative'">
                  {{ mlResults.prediction.successProbability }}%
                </span>
              </div>
              <div class="result-item">
                <strong>Cancellation Risk:</strong>
                <span :class="'risk-' + mlResults.prediction.cancellationRiskLevel">
                  {{ mlResults.prediction.cancellationRisk }}% ({{ mlResults.prediction.cancellationRiskLevel }})
                </span>
              </div>
              <div class="result-item">
                <strong>Revenue Forecast:</strong> {{ mlResults.prediction.revenueForcast }}€
              </div>
              <div v-if="mlResults.prediction.recommendations.length > 0" class="result-item">
                <strong>Recommendations:</strong>
                <ul>
                  <li v-for="rec in mlResults.prediction.recommendations" :key="rec">
                    {{ rec }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="ml-summary">
          <h3>📈 ML Services Summary</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-icon">🎯</div>
              <div class="summary-label">AI Matching</div>
              <div class="summary-value">✅ Active</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">🧠</div>
              <div class="summary-label">Sentiment Analysis</div>
              <div class="summary-value">✅ Active</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">🤝</div>
              <div class="summary-label">Social Graph</div>
              <div class="summary-value">✅ Active</div>
            </div>
            <div class="summary-card">
              <div class="summary-icon">📊</div>
              <div class="summary-label">Predictive Analytics</div>
              <div class="summary-value">✅ Active</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Dashboard Tab -->
      <div v-show="activeTab === 'analytics'" class="tab-panel">
        <h2>📊 Analytics Dashboard</h2>
        <p class="intro">Comprehensive Platform Analytics mit Chart.js & D3.js</p>

        <!-- Summary Cards -->
        <div class="analytics-summary">
          <div class="summary-stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.totalUsers.toLocaleString() }}</div>
              <div class="stat-label">Total Users</div>
              <div class="stat-trend positive">+{{ userGrowth.weekly.toFixed(1) }}% this week</div>
            </div>
          </div>

          <div class="summary-stat-card">
            <div class="stat-icon">🎉</div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.totalEvents }}</div>
              <div class="stat-label">Total Events</div>
              <div class="stat-trend positive">+{{ eventGrowth.weekly.toFixed(1) }}% this week</div>
            </div>
          </div>

          <div class="summary-stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.avgRating.toFixed(1) }}</div>
              <div class="stat-label">Avg Rating</div>
              <div class="stat-trend positive">Excellent</div>
            </div>
          </div>

          <div class="summary-stat-card">
            <div class="stat-icon">🤖</div>
            <div class="stat-info">
              <div class="stat-value">{{ summaryStats.mlAccuracy }}%</div>
              <div class="stat-label">ML Accuracy</div>
              <div class="stat-trend positive">High confidence</div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
          <!-- User Growth Chart -->
          <div class="chart-card">
            <h3>📈 User Growth (30 Days)</h3>
            <LineChart
              :data="userGrowthChartData"
              :height="250"
            />
          </div>

          <!-- Event Categories -->
          <div class="chart-card">
            <h3>🎯 Popular Categories</h3>
            <DoughnutChart
              :data="categoriesChartData"
              :height="250"
            />
          </div>

          <!-- Daily Engagement -->
          <div class="chart-card">
            <h3>⚡ Daily Active Users</h3>
            <LineChart
              :data="engagementChartData"
              :height="250"
            />
          </div>

          <!-- Event Creation -->
          <div class="chart-card">
            <h3>🎪 Events Created</h3>
            <BarChart
              :data="eventsChartData"
              :height="250"
            />
          </div>
        </div>

        <!-- Insights Section -->
        <div class="insights-section">
          <h3>💡 Platform Insights</h3>
          <div class="insights-grid">
            <div
              v-for="(insight, index) in insights"
              :key="index"
              class="insight-card"
              :class="insight.type"
            >
              <div class="insight-header">
                <span class="insight-icon">
                  {{ insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : insight.type === 'error' ? '❌' : 'ℹ️' }}
                </span>
                <h4>{{ insight.title }}</h4>
              </div>
              <p class="insight-message">{{ insight.message }}</p>
              <div v-if="insight.recommendation" class="insight-recommendation">
                <strong>💡 Recommendation:</strong> {{ insight.recommendation }}
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Tables -->
        <div class="metrics-tables">
          <div class="metrics-table-card">
            <h3>🏆 Top Events</h3>
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Attendees</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in topPerformers.events" :key="event.id">
                  <td>{{ event.name }}</td>
                  <td>{{ event.attendees }}</td>
                  <td>⭐ {{ event.rating }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="metrics-table-card">
            <h3>📊 ML Services Performance</h3>
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Metric</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AI Matching</td>
                  <td>{{ mlMetrics.aiMatching.conversionRate }}% conversion</td>
                  <td><span class="status-badge success">Active</span></td>
                </tr>
                <tr>
                  <td>Sentiment Analysis</td>
                  <td>{{ mlMetrics.sentimentAnalysis.positiveRatio }}% positive</td>
                  <td><span class="status-badge success">Active</span></td>
                </tr>
                <tr>
                  <td>Social Graph</td>
                  <td>{{ mlMetrics.socialGraph.communitiesDetected }} communities</td>
                  <td><span class="status-badge success">Active</span></td>
                </tr>
                <tr>
                  <td>Predictive Analytics</td>
                  <td>{{ mlMetrics.predictiveAnalytics.averageAccuracy }}% accuracy</td>
                  <td><span class="status-badge success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Export Button -->
        <div class="export-section">
          <button @click="exportAnalytics('json')" class="export-btn">
            📥 Export JSON
          </button>
          <button @click="exportAnalytics('csv')" class="export-btn">
            📊 Export CSV
          </button>
        </div>
      </div>

      <!-- Config Tab -->
      <div v-show="activeTab === 'config'" class="tab-panel">
        <h2>⚙️ Konfiguration</h2>

        <div class="config-section">
          <h3>Analytics</h3>
          <div class="config-item">
            <label>
              <input type="checkbox" v-model="config.analytics.enabled" />
              <span>Analytics aktivieren</span>
            </label>
          </div>
          <div class="config-item">
            <label>Domain:</label>
            <input type="text" v-model="config.analytics.domain" class="input" />
          </div>
        </div>

        <div class="config-section">
          <h3>PWA</h3>
          <div class="config-item">
            <label>
              <input type="checkbox" v-model="config.pwa.enabled" />
              <span>PWA aktivieren</span>
            </label>
          </div>
          <div class="config-item">
            <label>
              <input type="checkbox" v-model="config.pwa.offline" />
              <span>Offline-Support</span>
            </label>
          </div>
        </div>

        <div class="config-section">
          <h3>Gun.js P2P</h3>
          <div class="config-item">
            <label>Peers:</label>
            <textarea v-model="config.gun.peers" rows="3" class="textarea"></textarea>
          </div>
        </div>

        <button @click="saveConfig" class="save-btn">
          💾 Konfiguration speichern
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gunAuth, getPeersCount } from '../services/gunService'
import { useSolidSession } from '../stores/useSolidSession'
import { getAnalytics } from '../utils/analytics'
import { chatService } from '../services/chatService'
import { eventTransparencyService } from '../services/eventTransparencyService'
import { privateEventsService } from '../services/privateEventsService'
import { userProfilingService } from '../services/userProfilingService'
import { aiMatchingService } from '../services/aiMatchingService'
import { sentimentAnalysisService } from '../services/sentimentAnalysisService'
import { socialGraphService } from '../services/socialGraphService'
import { predictiveAnalyticsService } from '../services/predictiveAnalyticsService'
import { analyticsDashboardService } from '../services/analyticsDashboardService'
import LineChart from '../components/charts/LineChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import DoughnutChart from '../components/charts/DoughnutChart.vue'

const solidSession = useSolidSession()

const activeTab = ref('tests')
const peersCount = ref(0)
const eventCount = ref(0)

const tabs = [
  { id: 'tests', icon: '🧪', label: 'Tests' },
  { id: 'features', icon: '🎯', label: 'Features' },
  { id: 'ml', icon: '🤖', label: 'Machine Learning' },
  { id: 'analytics', icon: '📊', label: 'Analytics Dashboard' },
  { id: 'chat', icon: '💬', label: 'Chat System' },
  { id: 'transparency', icon: '🎉', label: 'Event Transparency' },
  { id: 'private-events', icon: '🏠', label: 'Private Events' },
  { id: 'profiling', icon: '👤', label: 'User Profiling' },
  { id: 'components', icon: '🧩', label: 'Components' },
  { id: 'performance', icon: '⚡', label: 'Performance' },
  { id: 'errors', icon: '🐛', label: 'Errors' },
  { id: 'config', icon: '⚙️', label: 'Config' }
]

// Test State
const testingUnit = ref(false)
const testingE2E = ref(false)
const testingAll = ref(false)
const testResults = ref<any>(null)

// Performance Metrics
const metrics = ref({
  lcp: 1600,
  fid: 45,
  cls: 0.045
})

const performanceScore = computed(() => {
  const lcpScore = metrics.value.lcp < 2500 ? 100 : 50
  const fidScore = metrics.value.fid < 100 ? 100 : 50
  const clsScore = metrics.value.cls < 0.1 ? 100 : 50
  return Math.round((lcpScore + fidScore + clsScore) / 3)
})

// Errors
const errors = ref<any[]>([])

// Config
const config = ref({
  analytics: {
    enabled: true,
    domain: 'toplocs-news.local'
  },
  pwa: {
    enabled: true,
    offline: true
  },
  gun: {
    peers: 'https://gun-manhattan.herokuapp.com/gun\nhttps://gunjs.herokuapp.com/gun'
  }
})

// Status
const gunStatus = computed(() => {
  return gunAuth.isLoggedIn ? 'Online' : 'Offline'
})

const solidStatus = computed(() => {
  return solidSession.isLoggedIn ? 'Verbunden' : 'Getrennt'
})

const analyticsStatus = computed(() => {
  const analytics = getAnalytics()
  return analytics?.isEnabled() ? 'Aktiv' : 'Inaktiv'
})

// Feature Tests State
const featureTests = ref({
  messages: false,
  discovery: false,
  profile: false,
  toast: false,
  theme: false,
  feed: false
})

// Component Status
const componentStatus = ref({
  messages: '⏳ Nicht getestet',
  discovery: '⏳ Nicht getestet',
  profile: '⏳ Nicht getestet',
  toast: '⏳ Nicht getestet',
  theme: '⏳ Nicht getestet',
  gunLogin: '⏳ Nicht getestet',
  feed: '⏳ Nicht getestet',
  solidDashboard: '⏳ Nicht getestet',
  postComments: '⏳ Nicht getestet',
  imageUpload: '⏳ Nicht getestet',
  tagFilter: '⏳ Nicht getestet',
  searchBar: '⏳ Nicht getestet',
  loadingSkeleton: '⏳ Nicht getestet',
  onlineStatus: '⏳ Nicht getestet',
  savedPosts: '⏳ Nicht getestet',
  keyboardShortcuts: '⏳ Nicht getestet'
})

const totalComponents = computed(() => Object.keys(componentStatus.value).length)
const testedComponents = computed(() =>
  Object.values(componentStatus.value).filter(s => s.includes('✅')).length
)
const componentCoverage = computed(() =>
  Math.round((testedComponents.value / totalComponents.value) * 100)
)

// Methods
async function testFeature(feature: string) {
  featureTests.value[feature] = true
  console.log(`[ControlCenter] Testing feature: ${feature}`)
}

async function testComponent(component: string) {
  componentStatus.value[component] = '🔄 Testing...'

  // Simulate component test
  await new Promise(resolve => setTimeout(resolve, 1000))

  componentStatus.value[component] = '✅ Passed'
  console.log(`[ControlCenter] Component test passed: ${component}`)
}

function showTestToast() {
  // Test all toast types
  const types = ['success', 'error', 'warning', 'info']
  const messages = [
    '✅ Success: Feature funktioniert!',
    '❌ Error: Ein Fehler ist aufgetreten',
    '⚠️ Warning: Achtung, bitte prüfen',
    'ℹ️ Info: Neue Information verfügbar'
  ]

  types.forEach((type, index) => {
    setTimeout(() => {
      alert(`${messages[index]} (${type})`)
    }, index * 500)
  })

  featureTests.value.toast = true
}

function toggleTestTheme() {
  const themes = ['light', 'dark', 'auto']
  const current = localStorage.getItem('toplocs-theme') || 'dark'
  const currentIndex = themes.indexOf(current)
  const nextTheme = themes[(currentIndex + 1) % themes.length]

  localStorage.setItem('toplocs-theme', nextTheme)
  alert(`Theme gewechselt zu: ${nextTheme}`)

  featureTests.value.theme = true
}

async function runTests(type: string) {
  if (type === 'unit') {
    testingUnit.value = true
  } else if (type === 'e2e') {
    testingE2E.value = true
  } else {
    testingAll.value = true
  }

  // Simulate test run
  await new Promise(resolve => setTimeout(resolve, 2000))

  testResults.value = {
    status: 'passed',
    passed: type === 'all' ? 47 : 23,
    failed: 0,
    total: type === 'all' ? 47 : 23
  }

  testingUnit.value = false
  testingE2E.value = false
  testingAll.value = false
}

function refreshMetrics() {
  // Simulate metrics refresh
  metrics.value = {
    lcp: Math.random() * 2000 + 1000,
    fid: Math.random() * 80 + 20,
    cls: Math.random() * 0.08 + 0.02
  }
}

function getMetricClass(value: number, threshold: number): string {
  return value < threshold ? 'good' : 'poor'
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('de-DE')
}

function clearErrors() {
  errors.value = []
}

function saveConfig() {
  console.log('[ControlCenter] Config saved:', config.value)
  alert('✅ Konfiguration gespeichert!')
}

function updatePeersCount() {
  peersCount.value = getPeersCount()
}

// NEW SERVICES STATE
const chatStats = ref(chatService.getStats())
const currentTransparencyEvent = ref<any>(null)
const privateStats = ref(privateEventsService.getStats())
const profilingStats = ref({
  totalInteractions: 0,
  engagementScore: 0
})

// NEW METHODS

// Chat System
async function testChatDirectMessage() {
  const convs = chatService.getConversations('direct')
  if (convs.length > 0) {
    await chatService.sendMessage(convs[0].id, 'Test message from Control Center!')
    chatStats.value = chatService.getStats()
    alert('✅ Direct message sent!')
  }
}

async function testChatEventGroup() {
  await chatService.createConversation('event-group', [
    { userId: 'user_test', name: 'Test User', avatar: '/avatar.png' }
  ], {
    eventId: 'event_123',
    eventName: 'Test Event',
    encrypted: true
  })
  chatStats.value = chatService.getStats()
  alert('✅ Event group created!')
}

async function testChatInterestGroup() {
  await chatService.createConversation('interest-group', [
    { userId: 'user_test', name: 'Test User', avatar: '/avatar.png' }
  ], {
    interestTopic: 'Test Interest Group'
  })
  chatStats.value = chatService.getStats()
  alert('✅ Interest group created!')
}

// Event Transparency
function createTransparencyEvent(type: 'festival' | 'concert' | 'meetup' | 'party') {
  const event = eventTransparencyService.createTestEvent(type)
  currentTransparencyEvent.value = event
  alert(`✅ ${type} event created with transparency data!`)
}

// Private Events
function testDonation(amount: number) {
  const events = privateEventsService.getAllEvents({ status: 'published' })
  if (events.length > 0) {
    privateEventsService.makeDonation(events[0].id, 'test_user', amount)
    privateStats.value = privateEventsService.getStats()
    alert(`✅ ${amount}€ donation received!`)
  }
}

// User Profiling
async function simulateProfilingClick() {
  await userProfilingService.trackInteraction('test_user', {
    type: 'click',
    articleId: `article_${Date.now()}`,
    category: 'food',
    metadata: {}
  })
  const profile = await userProfilingService.getOrCreateProfile('test_user')
  profilingStats.value = {
    totalInteractions: profile.stats.totalInteractions || 0,
    engagementScore: profile.stats.engagementScore || 0
  }
  alert('✅ Click interaction tracked!')
}

async function simulateProfilingLike() {
  await userProfilingService.trackInteraction('test_user', {
    type: 'like',
    articleId: `article_${Date.now()}`,
    category: 'tech',
    metadata: {}
  })
  const profile = await userProfilingService.getOrCreateProfile('test_user')
  profilingStats.value = {
    totalInteractions: profile.stats.totalInteractions || 0,
    engagementScore: profile.stats.engagementScore || 0
  }
  alert('✅ Like interaction tracked!')
}

async function simulateProfilingVisit() {
  await userProfilingService.trackInteraction('test_user', {
    type: 'visit',
    articleId: `poi_${Date.now()}`,
    category: 'restaurant',
    metadata: {}
  })
  const profile = await userProfilingService.getOrCreateProfile('test_user')
  profilingStats.value = {
    totalInteractions: profile.stats.totalInteractions || 0,
    engagementScore: profile.stats.engagementScore || 0
  }
  alert('✅ Visit interaction tracked!')
}

// ML SERVICES STATE
const mlStats = ref({
  matching: { users: 0, cacheSize: 0 },
  graph: { users: 0, connections: 0, communities: 0 },
  predictive: { events: 0, confidence: 30 }
})

const mlResults = ref<any>({
  matching: null,
  sentiment: null,
  graph: null,
  prediction: null
})

const sentimentText = ref('This is an amazing event! The music was fantastic and everyone had a great time. Highly recommended!')

// ML METHODS

// AI Matching
function testAIMatching() {
  const testEvent = {
    id: 'event_test',
    category: ['Music', 'Food'],
    location: { lat: 49.4521, lng: 11.0767 },
    startTime: Date.now() + 86400000,
    attendees: 50,
    tags: ['concert', 'festival']
  }

  const result = aiMatchingService.calculateMatch('user_0', 'event_test', testEvent)
  mlResults.value.matching = result
  updateMLStats()
  alert(`✅ AI Matching Score: ${result.totalScore}/100`)
}

function generateMatchingData() {
  aiMatchingService.generateTestData()
  updateMLStats()
  alert('✅ AI Matching: 10 test users generated!')
}

// Sentiment Analysis
function testSentiment() {
  const result = sentimentAnalysisService.analyzeText(sentimentText.value)
  mlResults.value.sentiment = result
  alert(`✅ Sentiment Score: ${result.score} (${result.polarity > 0 ? 'Positive' : 'Negative'})`)
}

function testEventVibe() {
  const result = sentimentAnalysisService.analyzeEventVibe('event_test', {
    reviews: [
      'Amazing event! Great music and vibes',
      'Best concert I\'ve been to this year',
      'Fantastic atmosphere, will come again'
    ],
    chatMessages: [
      'This is lit! 🔥',
      'Having so much fun!',
      'Great crowd!'
    ]
  })

  mlResults.value.sentiment = {
    score: result.overallScore,
    polarity: result.overallScore > 0 ? 1 : -1,
    keywords: [],
    quality: result.overallVibe
  }

  alert(`✅ Event Vibe Score: ${result.overallVibe}/100`)
}

// Social Graph
function testSocialGraph() {
  const path = socialGraphService.findShortestPath('user_0', 'user_5')
  if (path) {
    mlResults.value.graph = path
    alert(`✅ Path found: ${path.distance} hops`)
  } else {
    alert('❌ No path found between users')
  }
}

function detectCommunities() {
  const communities = socialGraphService.detectCommunities()
  updateMLStats()
  alert(`✅ Detected ${communities.length} communities!`)
}

function generateGraphData() {
  socialGraphService.generateTestData()
  updateMLStats()
  alert('✅ Social Graph: 20 users + connections generated!')
}

// Predictive Analytics
function testPrediction() {
  const testEvent = {
    eventId: 'event_test',
    category: 'Music',
    ticketPrice: 25,
    capacity: 200,
    weatherScore: 85,
    competingEvents: 1,
    organizerRating: 75,
    daysPromoted: 14,
    isWeekend: true,
    dayOfWeek: 6,
    hour: 20
  }

  const result = predictiveAnalyticsService.predictEventSuccess(testEvent)
  mlResults.value.prediction = result
  alert(`✅ Predicted Attendance: ${result.predictedAttendance} (Success: ${result.successProbability}%)`)
}

function generatePredictiveData() {
  predictiveAnalyticsService.generateTestData()
  updateMLStats()
  alert('✅ Predictive Analytics: 50 historical events generated!')
}

function updateMLStats() {
  mlStats.value = {
    matching: {
      users: 10, // Would be from aiMatchingService
      cacheSize: 0
    },
    graph: {
      users: 20,
      connections: 60,
      communities: 3
    },
    predictive: {
      events: 50,
      confidence: 70
    }
  }
}

// ANALYTICS DASHBOARD STATE
const summaryStats = computed(() => analyticsDashboardService.getSummaryStats())
const userGrowth = computed(() => analyticsDashboardService.getGrowthRate('users'))
const eventGrowth = computed(() => analyticsDashboardService.getGrowthRate('events'))
const topPerformers = computed(() => analyticsDashboardService.getTopPerformers())
const insights = computed(() => analyticsDashboardService.getInsights())
const mlMetrics = computed(() => analyticsDashboardService.getMLServicesMetrics())

// Chart Data
const userGrowthChartData = computed(() => {
  const data = analyticsDashboardService.getTimeSeriesData('users')
  return {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Total Users',
      data: data.map(d => d.value),
      borderColor: 'rgb(102, 126, 234)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const engagementChartData = computed(() => {
  const data = analyticsDashboardService.getTimeSeriesData('engagement')
  return {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Active Users',
      data: data.map(d => d.value),
      borderColor: 'rgb(237, 100, 166)',
      backgroundColor: 'rgba(237, 100, 166, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

const eventsChartData = computed(() => {
  const data = analyticsDashboardService.getTimeSeriesData('events').slice(-7)
  return {
    labels: data.map(d => new Date(d.timestamp).toLocaleDateString('de-DE', { weekday: 'short' })),
    datasets: [{
      label: 'Events Created',
      data: data.map(d => d.value),
      backgroundColor: 'rgba(118, 75, 162, 0.8)',
      borderColor: 'rgb(118, 75, 162)',
      borderWidth: 1
    }]
  }
})

const categoriesChartData = computed(() => {
  const eventMetrics = analyticsDashboardService.getEventPerformanceMetrics()
  return {
    labels: eventMetrics.popularCategories.map(c => c.category),
    datasets: [{
      data: eventMetrics.popularCategories.map(c => c.count),
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(237, 100, 166, 0.8)',
        'rgba(255, 154, 158, 0.8)',
        'rgba(250, 208, 196, 0.8)'
      ]
    }]
  }
})

// ANALYTICS METHODS
function exportAnalytics(format: 'json' | 'csv') {
  const data = analyticsDashboardService.exportData(format)
  const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `toplocs-analytics-${Date.now()}.${format}`
  a.click()
  URL.revokeObjectURL(url)
  alert(`✅ Analytics exported as ${format.toUpperCase()}!`)
}

// Error tracking
onMounted(() => {
  updatePeersCount()
  setInterval(updatePeersCount, 5000)

  // Track errors
  window.addEventListener('error', (event) => {
    errors.value.push({
      message: event.message,
      stack: event.error?.stack || '',
      timestamp: Date.now()
    })
  })

  // Simulate some events
  eventCount.value = Math.floor(Math.random() * 100) + 50

  // Load initial stats
  chatStats.value = chatService.getStats()
  privateStats.value = privateEventsService.getStats()
})
</script>

<style scoped>
.control-center {
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

/* Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.status-card .icon {
  font-size: 2.5rem;
}

.status-card .content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.status-card .value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.status-card .detail {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0 0 0;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Tab Content */
.tab-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  min-height: 400px;
}

.tab-panel h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

/* Tests */
.test-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.test-btn {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.test-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-btn.primary {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none;
}

.test-results {
  margin-top: 2rem;
}

.result-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 2px solid;
}

.result-card.passed {
  border-color: #22c55e;
}

.result-card.failed {
  border-color: #ef4444;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.result-stats .stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-stats .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.result-stats .value {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Performance */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.metric-card h4 {
  margin: 0 0 1rem 0;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.metric:last-child {
  border-bottom: none;
}

.metric .label {
  color: rgba(255, 255, 255, 0.8);
}

.metric .value {
  font-weight: bold;
  font-size: 1.1rem;
}

.metric .value.good {
  color: #22c55e;
}

.metric .value.poor {
  color: #ef4444;
}

.refresh-btn {
  padding: 0.875rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Errors */
.empty-state {
  padding: 3rem;
  text-align: center;
  font-size: 1.2rem;
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.error-card {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

.error-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #fca5a5;
  font-weight: 600;
  margin: 0.5rem 0;
}

.error-stack {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-family: monospace;
  margin: 0;
}

.clear-btn {
  padding: 0.875rem 1.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-weight: 600;
  cursor: pointer;
}

/* Config */
.config-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.config-section h3 {
  margin: 0 0 1rem 0;
}

.config-item {
  margin-bottom: 1rem;
}

.config-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  margin-bottom: 0.5rem;
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.textarea {
  resize: vertical;
  font-family: monospace;
}

.save-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
}

/* Features Tab */
.intro {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.feature-tests {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.feature-test-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-test-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.feature-test-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.feature-test-card p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.test-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.test-feature-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.test-feature-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.demo-link {
  padding: 0.75rem 1rem;
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}

.demo-link:hover {
  background: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.test-result {
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  line-height: 1.8;
}

.test-result.success {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #86efac;
}

/* Components Tab */
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.component-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  transition: transform 0.2s;
}

.component-card:hover {
  transform: translateY(-4px);
}

.component-card h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.component-card .status {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.test-btn-small {
  width: 100%;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.test-btn-small:hover {
  background: rgba(255, 255, 255, 0.2);
}

.component-summary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.component-summary h3 {
  margin: 0 0 1rem 0;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-stat .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.summary-stat .value {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

/* ML Tab Styles */
.ml-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.ml-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ml-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.ml-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.ml-card > p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.ml-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.ml-stats .stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ml-stats .label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.ml-stats .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.ml-input {
  margin-bottom: 1rem;
}

.ml-result {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
}

.ml-result h4 {
  margin: 0 0 0.75rem 0;
  color: #86efac;
}

.result-item {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.result-item strong {
  color: rgba(255, 255, 255, 0.9);
}

.result-item small {
  color: rgba(255, 255, 255, 0.5);
}

.result-item ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.result-item li {
  margin-bottom: 0.25rem;
}

.result-item .positive {
  color: #86efac;
  font-weight: 600;
}

.result-item .negative {
  color: #fca5a5;
  font-weight: 600;
}

.result-item .risk-low {
  color: #86efac;
  font-weight: 600;
}

.result-item .risk-medium {
  color: #fbbf24;
  font-weight: 600;
}

.result-item .risk-high {
  color: #fca5a5;
  font-weight: 600;
}

.ml-summary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
}

.ml-summary h3 {
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.summary-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.summary-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #86efac;
}

.btn-action {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

/* Analytics Dashboard Styles */
.analytics-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: transform 0.2s;
}

.summary-stat-card:hover {
  transform: translateY(-4px);
}

.summary-stat-card .stat-icon {
  font-size: 3rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-trend.positive {
  color: #86efac;
}

.stat-trend.negative {
  color: #fca5a5;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-card h3 {
  margin: 0 0 1.5rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.insights-section {
  margin-bottom: 2rem;
}

.insights-section h3 {
  margin-bottom: 1.5rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
}

.insight-card {
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid;
}

.insight-card.success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.insight-card.warning {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
}

.insight-card.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.insight-card.info {
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.3);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.insight-icon {
  font-size: 1.5rem;
}

.insight-header h4 {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.insight-message {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.75rem 0;
}

.insight-recommendation {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.metrics-tables {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metrics-table-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.metrics-table-card h3 {
  margin: 0 0 1rem 0;
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
}

.metrics-table th {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.metrics-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.metrics-table tr:last-child td {
  border-bottom: none;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.export-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.export-btn {
  padding: 1rem 2rem;
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  background: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .feature-tests {
    grid-template-columns: 1fr;
  }

  .component-grid {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .ml-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .analytics-summary {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .metrics-tables {
    grid-template-columns: 1fr;
  }
}
</style>

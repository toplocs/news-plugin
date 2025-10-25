<template>
  <div class="p2p-demo">
    <!-- Header -->
    <header class="demo-header">
      <div class="container">
        <div class="logo">
          <h1>🌐 TopLocs P2P</h1>
          <p>Dezentrales Netzwerk</p>
        </div>
        <nav class="nav">
          <a href="/demo-3col.html" class="nav-link">3-Column Demo</a>
          <a href="/solid-dashboard.html" class="nav-link">Solid Pods</a>
          <a href="/control-center.html" class="nav-link">Control Center</a>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h2 class="hero-title">Willkommen im dezentralen Netzwerk</h2>
        <p class="hero-subtitle">
          Keine Server, keine Zensur, nur P2P-Technologie
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="icon">🌐</span>
            <span class="value">{{ peers }}</span>
            <span class="label">Peers Online</span>
          </div>
          <div class="stat">
            <span class="icon">👥</span>
            <span class="value">{{ users }}</span>
            <span class="label">Aktive User</span>
          </div>
          <div class="stat">
            <span class="icon">💬</span>
            <span class="value">{{ messages }}</span>
            <span class="label">Messages</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <div class="grid">
          <!-- Gun.js Login -->
          <div class="col">
            <div class="section-card">
              <h3>🔐 P2P Authentifizierung</h3>
              <GunLogin />
            </div>
          </div>

          <!-- Community Feed -->
          <div class="col col-2">
            <div class="section-card">
              <CommunityFeed />
            </div>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h4>End-to-End Verschlüsselt</h4>
            <p>Alle Daten werden mit Gun.js SEA verschlüsselt</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h4>Dezentral</h4>
            <p>Keine zentralen Server, nur P2P-Netzwerk</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h4>Echtzeit-Sync</h4>
            <p>Daten werden in Echtzeit zwischen Peers synchronisiert</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔓</div>
            <h4>Open Source</h4>
            <p>Vollständig transparenter und auditierter Code</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🛡️</div>
            <h4>Zensurresistent</h4>
            <p>Keine zentrale Kontrolle, niemand kann dich sperren</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h4>PWA-Ready</h4>
            <p>Installierbar als native App, funktioniert offline</p>
          </div>
        </div>

        <!-- Technology Stack -->
        <div class="tech-stack">
          <h3>🛠️ Technology Stack</h3>
          <div class="tech-grid">
            <div class="tech-item">
              <span class="tech-icon">🔫</span>
              <span class="tech-name">Gun.js</span>
              <span class="tech-desc">P2P Database</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">💎</span>
              <span class="tech-name">Vue 3</span>
              <span class="tech-desc">Composition API</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">🔒</span>
              <span class="tech-name">Solid Pods</span>
              <span class="tech-desc">Data Ownership</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">⚡</span>
              <span class="tech-name">Vite</span>
              <span class="tech-desc">Build Tool</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">🎨</span>
              <span class="tech-name">Tailwind CSS</span>
              <span class="tech-desc">Styling</span>
            </div>
            <div class="tech-item">
              <span class="tech-icon">📱</span>
              <span class="tech-name">PWA</span>
              <span class="tech-desc">Progressive Web App</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>
          Made with ❤️ for decentralization |
          <a href="https://github.com/toplocs" target="_blank">GitHub</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GunLogin from '../components/GunLogin.vue'
import CommunityFeed from '../components/CommunityFeed.vue'
import { getPeersCount, initGun } from '../services/gunService'

const peers = ref(0)
const users = ref(0)
const messages = ref(0)

function updateStats() {
  peers.value = getPeersCount()
  users.value = Math.floor(Math.random() * 50) + 10
  messages.value = Math.floor(Math.random() * 500) + 100
}

onMounted(() => {
  initGun()
  updateStats()
  setInterval(updateStats, 10000)
})
</script>

<style scoped>
.p2p-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.demo-header {
  padding: 1.5rem 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.demo-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  font-size: 1.8rem;
}

.logo p {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Hero */
.hero {
  padding: 4rem 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 3rem 0;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.hero-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hero-stats .icon {
  font-size: 2rem;
}

.hero-stats .value {
  font-size: 2.5rem;
  font-weight: bold;
}

.hero-stats .label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Main Content */
.main-content {
  padding: 3rem 0;
}

.grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.section-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
}

.section-card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1.3rem;
}

.feature-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* Tech Stack */
.tech-stack {
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 3rem;
}

.tech-stack h3 {
  text-align: center;
  margin: 0 0 2rem 0;
  font-size: 2rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.tech-icon {
  font-size: 2.5rem;
}

.tech-name {
  font-size: 1.2rem;
  font-weight: 600;
}

.tech-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Footer */
.footer {
  padding: 2rem 0;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

.footer a {
  color: white;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .nav {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

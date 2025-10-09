<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="welcome-overlay" @click.self="handleSkip">
        <div class="welcome-container">
          <!-- Close Button -->
          <button @click="handleSkip" class="close-btn" aria-label="Schließen">
            ×
          </button>

          <!-- Welcome Content -->
          <div class="welcome-content">
            <!-- Hero Section -->
            <div class="welcome-hero">
              <div class="hero-icon">🏠</div>
              <h1 class="hero-title">Willkommen bei LocalConnect</h1>
              <p class="hero-subtitle">
                Die <strong>Anti-Instagram</strong> News-App – Transparent, Lokal, Ehrlich
              </p>
            </div>

            <!-- Value Propositions -->
            <div class="value-props">
              <div class="value-card">
                <div class="value-icon">✨</div>
                <h3 class="value-title">100% Transparenz</h3>
                <p class="value-description">
                  Wir zeigen dir <strong>genau</strong>, warum du welche Inhalte siehst.
                  Keine versteckten Algorithmen, keine Manipulation.
                </p>
                <div class="value-badge success">Ehrlich</div>
              </div>

              <div class="value-card">
                <div class="value-icon">📍</div>
                <h3 class="value-title">Hyperlokal</h3>
                <p class="value-description">
                  Entdecke News, Events und Menschen in deinem Kiez.
                  Sortiert nach <strong>Distanz</strong>, nicht nach Klicks.
                </p>
                <div class="value-badge info">Nah</div>
              </div>

              <div class="value-card">
                <div class="value-icon">🎯</div>
                <h3 class="value-title">Deine Kontrolle</h3>
                <p class="value-description">
                  Du bestimmst deine Interessen. Du siehst nur relevante Artikel.
                  <strong>Kein Infinite Scroll</strong>, kein Zeitverschwendung.
                </p>
                <div class="value-badge warning">Fokussiert</div>
              </div>

              <div class="value-card">
                <div class="value-icon">🔒</div>
                <h3 class="value-title">Privatsphäre First</h3>
                <p class="value-description">
                  Deine Daten bleiben <strong>lokal</strong>. Keine Tracking-Pixel,
                  keine Datenweitergabe, keine Profile für Werbung.
                </p>
                <div class="value-badge secure">Sicher</div>
              </div>
            </div>

            <!-- Comparison Section -->
            <div class="comparison-section">
              <h2 class="comparison-title">🆚 Warum wir anders sind</h2>
              <div class="comparison-grid">
                <div class="comparison-column us">
                  <div class="column-header">
                    <span class="column-icon">💚</span>
                    <strong>LocalConnect</strong>
                  </div>
                  <ul class="comparison-list">
                    <li>✅ Transparente Algorithmen</li>
                    <li>✅ Lokale Communities</li>
                    <li>✅ Endlicher Feed</li>
                    <li>✅ Keine Werbung-Profile</li>
                    <li>✅ Datenhoheit</li>
                    <li>✅ Echte Connections</li>
                  </ul>
                </div>
                <div class="comparison-column them">
                  <div class="column-header">
                    <span class="column-icon">⚠️</span>
                    <strong>Instagram/TikTok</strong>
                  </div>
                  <ul class="comparison-list">
                    <li>❌ Black-Box Algorithmen</li>
                    <li>❌ Globaler FOMO-Content</li>
                    <li>❌ Süchtiger Infinite Scroll</li>
                    <li>❌ Invasive Werbung</li>
                    <li>❌ Datenverkauf</li>
                    <li>❌ Oberflächliche Interaktionen</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Stats Highlight -->
            <div class="stats-highlight">
              <div class="stat-item">
                <div class="stat-value">0%</div>
                <div class="stat-label">Manipulation</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">100%</div>
                <div class="stat-label">Transparenz</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-value">∞</div>
                <div class="stat-label">Ehrlichkeit</div>
              </div>
            </div>

            <!-- Call to Action -->
            <div class="welcome-cta">
              <h2 class="cta-title">Bereit für ehrliche News?</h2>
              <p class="cta-text">
                Lass uns deine Interessen einrichten und deinen Kiez entdecken! 🚀
              </p>
              <div class="cta-buttons">
                <button @click="handleGetStarted" class="btn-primary">
                  <span>✨</span>
                  <span>Los geht's!</span>
                </button>
                <button @click="handleSkip" class="btn-secondary">
                  <span>Später</span>
                </button>
              </div>
            </div>

            <!-- Footer Note -->
            <div class="welcome-footer">
              <p>
                <strong>💡 Tipp:</strong> Du kannst diese Tour jederzeit in den Einstellungen wiederholen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'get-started': []
  'skip': []
  close: []
}>()

const handleGetStarted = () => {
  emit('get-started')
}

const handleSkip = () => {
  emit('skip')
  emit('close')
}

// Prevent body scroll when modal is open
onMounted(() => {
  document.body.style.overflow = 'hidden'
  return () => {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* Overlay */
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.welcome-container {
  position: relative;
  max-width: 900px;
  width: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98));
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  font-size: 1.75rem;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* Welcome Content */
.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Hero Section */
.welcome-hero {
  text-align: center;
}

.hero-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin: 0;
}

.hero-subtitle strong {
  color: #10b981;
  font-weight: 700;
}

/* Value Propositions */
.value-props {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.value-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.value-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.value-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.value-card:hover::before {
  opacity: 1;
}

.value-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.value-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.75rem 0;
}

.value-description {
  font-size: 0.9375rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.value-description strong {
  color: #a5b4fc;
  font-weight: 600;
}

.value-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value-badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.value-badge.info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.value-badge.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.value-badge.secure {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* Comparison Section */
.comparison-section {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
}

.comparison-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
  margin: 0 0 2rem 0;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.comparison-column {
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.comparison-column.us {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.comparison-column.them {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #f8fafc;
}

.column-icon {
  font-size: 1.5rem;
}

.comparison-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comparison-list li {
  font-size: 0.9375rem;
  color: #cbd5e1;
  line-height: 1.6;
}

/* Stats Highlight */
.stats-highlight {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
}

/* Call to Action */
.welcome-cta {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1rem;
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.cta-text {
  font-size: 1.125rem;
  color: #cbd5e1;
  margin: 0 0 2rem 0;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.6);
}

.btn-secondary {
  padding: 1rem 2rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #a5b4fc;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

/* Footer */
.welcome-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.welcome-footer p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.welcome-footer strong {
  color: #a5b4fc;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .welcome-overlay {
    padding: 1rem;
  }

  .welcome-container {
    padding: 2rem 1.5rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .value-props {
    grid-template-columns: 1fr;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .stats-highlight {
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-divider {
    width: 60px;
    height: 1px;
  }

  .cta-title {
    font-size: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>

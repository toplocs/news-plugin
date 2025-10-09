<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="onboarding-overlay" @click.self="handleSkip">
        <div class="onboarding-container">
          <!-- Progress Indicators -->
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${((currentSlide + 1) / slides.length) * 100}%` }"></div>
          </div>

          <!-- Close/Skip Button -->
          <button @click="handleSkip" class="skip-btn">
            {{ currentSlide < slides.length - 1 ? 'Überspringen' : '×' }}
          </button>

          <!-- Slide Container -->
          <div class="slides-container">
            <TransitionGroup name="slide">
              <!-- Slide 1: Welcome & Philosophy -->
              <div v-if="currentSlide === 0" key="slide-0" class="slide">
                <div class="slide-icon">👋</div>
                <h2 class="slide-title">Willkommen bei LocalConnect</h2>
                <p class="slide-subtitle">Die ehrliche Alternative zu Instagram & TikTok</p>

                <div class="slide-content">
                  <div class="feature-list">
                    <div class="feature-item">
                      <span class="feature-icon">✨</span>
                      <div class="feature-text">
                        <strong>Transparente Algorithmen</strong>
                        <span>Du siehst genau, warum dir Inhalte gezeigt werden</span>
                      </div>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">📍</span>
                      <div class="feature-text">
                        <strong>Hyperlokal</strong>
                        <span>Entdecke News & Events in deinem Kiez</span>
                      </div>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">🚫</span>
                      <div class="feature-text">
                        <strong>Kein Infinite Scroll</strong>
                        <span>Deine Zeit ist wertvoll – kein endloses Scrollen</span>
                      </div>
                    </div>
                    <div class="feature-item">
                      <span class="feature-icon">🔒</span>
                      <div class="feature-text">
                        <strong>Privatsphäre First</strong>
                        <span>Deine Daten bleiben lokal gespeichert</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="slide-footer">
                  <p class="footer-note">
                    <strong>💡 Unser Versprechen:</strong> Keine versteckten Algorithmen, keine Manipulation, keine Datenweitergabe.
                  </p>
                </div>
              </div>

              <!-- Slide 2: Transparency Explained -->
              <div v-if="currentSlide === 1" key="slide-1" class="slide">
                <div class="slide-icon">🔍</div>
                <h2 class="slide-title">100% Transparenz</h2>
                <p class="slide-subtitle">So funktioniert unser Algorithmus</p>

                <div class="slide-content">
                  <div class="algorithm-steps">
                    <div class="algo-step">
                      <div class="step-number">1</div>
                      <div class="step-content">
                        <h4>Deine Interessen</h4>
                        <p>Wir matchen Artikel mit deinen selbst gewählten Interessen</p>
                      </div>
                    </div>
                    <div class="algo-step">
                      <div class="step-number">2</div>
                      <div class="step-content">
                        <h4>Distanz berechnen</h4>
                        <p>Wir zeigen dir zuerst, was in deiner Nähe passiert</p>
                      </div>
                    </div>
                    <div class="algo-step">
                      <div class="step-number">3</div>
                      <div class="step-content">
                        <h4>Match Score</h4>
                        <p>Jeder Artikel bekommt einen transparenten Score (0-100%)</p>
                      </div>
                    </div>
                    <div class="algo-step">
                      <div class="step-number">4</div>
                      <div class="step-content">
                        <h4>Du entscheidest</h4>
                        <p>Sortiere nach Distanz, Match Score oder Zeit – deine Wahl!</p>
                      </div>
                    </div>
                  </div>

                  <div class="transparency-badge">
                    <span class="badge-icon">✅</span>
                    <span class="badge-text">Immer auf Knopfdruck: "Warum sehe ich das?" erklärt jeden Artikel</span>
                  </div>
                </div>
              </div>

              <!-- Slide 3: Interests Setup -->
              <div v-if="currentSlide === 2" key="slide-2" class="slide">
                <div class="slide-icon">💫</div>
                <h2 class="slide-title">Deine Interessen</h2>
                <p class="slide-subtitle">Du hast die volle Kontrolle</p>

                <div class="slide-content">
                  <div class="interest-demo">
                    <p class="demo-intro">
                      <strong>So funktioniert's:</strong> Wähle Topics, die dich wirklich interessieren.
                      Wir zeigen dir nur relevante Artikel – kein Clickbait, kein FOMO-Content.
                    </p>

                    <div class="demo-interests">
                      <div class="demo-interest-chip active">
                        <span class="chip-icon">✓</span>
                        <span>Nachhaltigkeit</span>
                        <span class="chip-score">85%</span>
                      </div>
                      <div class="demo-interest-chip active">
                        <span class="chip-icon">✓</span>
                        <span>Kultur</span>
                        <span class="chip-score">72%</span>
                      </div>
                      <div class="demo-interest-chip">
                        <span class="chip-icon">○</span>
                        <span>Sport</span>
                        <span class="chip-score">0%</span>
                      </div>
                      <div class="demo-interest-chip active">
                        <span class="chip-icon">✓</span>
                        <span>Tech</span>
                        <span class="chip-score">94%</span>
                      </div>
                    </div>

                    <div class="demo-features">
                      <div class="demo-feature">
                        <span class="demo-icon">🎯</span>
                        <span>Beliebig viele Interessen hinzufügen</span>
                      </div>
                      <div class="demo-feature">
                        <span class="demo-icon">🔄</span>
                        <span>Jederzeit ändern & anpassen</span>
                      </div>
                      <div class="demo-feature">
                        <span class="demo-icon">💯</span>
                        <span>Transparenter Match Score für jeden Artikel</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="slide-footer">
                  <p class="footer-note">
                    <strong>💡 Tipp:</strong> Du kannst Interessen auch direkt im Feed an/ausschalten!
                  </p>
                </div>
              </div>

              <!-- Slide 4: Hyperlocal Feed -->
              <div v-if="currentSlide === 3" key="slide-3" class="slide">
                <div class="slide-icon">📍</div>
                <h2 class="slide-title">Hyperlokal = Dein Kiez</h2>
                <p class="slide-subtitle">Entdecke, was um die Ecke passiert</p>

                <div class="slide-content">
                  <div class="hyperlocal-demo">
                    <div class="demo-map-placeholder">
                      <div class="map-marker user">
                        <span>📍</span>
                        <span class="marker-label">Du</span>
                      </div>
                      <div class="map-marker event" style="top: 30%; left: 60%;">
                        <span>🎉</span>
                        <span class="marker-label">Event: 800m</span>
                      </div>
                      <div class="map-marker news" style="top: 60%; left: 40%;">
                        <span>📰</span>
                        <span class="marker-label">News: 1.2km</span>
                      </div>
                      <div class="radius-circle"></div>
                    </div>

                    <div class="hyperlocal-features">
                      <div class="hyperlocal-feature">
                        <span class="feature-icon">🎚️</span>
                        <div class="feature-text">
                          <strong>Radius einstellen</strong>
                          <span>Von 500m bis 25km – du entscheidest wie weit</span>
                        </div>
                      </div>
                      <div class="hyperlocal-feature">
                        <span class="feature-icon">📊</span>
                        <div class="feature-text">
                          <strong>Nach Distanz sortieren</strong>
                          <span>Sieh zuerst, was in deiner Nähe ist</span>
                        </div>
                      </div>
                      <div class="hyperlocal-feature">
                        <span class="feature-icon">🗺️</span>
                        <div class="feature-text">
                          <strong>Kartenansicht</strong>
                          <span>Visualisiere alle News & Events auf der Karte</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="slide-footer">
                  <p class="footer-note">
                    <strong>💡 Beispiel:</strong> Du siehst ein Community-Event 800m entfernt? Perfect zum Spontan-Treffen!
                  </p>
                </div>
              </div>

              <!-- Slide 5: Quick-Meet Features -->
              <div v-if="currentSlide === 4" key="slide-4" class="slide">
                <div class="slide-icon">🤝</div>
                <h2 class="slide-title">Quick-Meet System</h2>
                <p class="slide-subtitle">Spontan Menschen treffen</p>

                <div class="slide-content">
                  <div class="quick-meet-demo">
                    <p class="demo-intro">
                      Aktiviere deine <strong>Verfügbarkeit</strong> und zeige anderen, dass du offen für spontane Treffen bist!
                    </p>

                    <div class="availability-demo">
                      <div class="availability-toggle active">
                        <span class="toggle-icon">🟢</span>
                        <div class="toggle-text">
                          <strong>Verfügbar für Quick-Meets</strong>
                          <span>Andere sehen, dass du heute Zeit hast</span>
                        </div>
                      </div>
                    </div>

                    <div class="quick-meet-features">
                      <div class="qm-feature">
                        <span class="qm-icon">⚡</span>
                        <div class="qm-text">
                          <strong>Spontan RSVPen</strong>
                          <span>Melde dich schnell für Events an</span>
                        </div>
                      </div>
                      <div class="qm-feature">
                        <span class="qm-icon">👥</span>
                        <div class="qm-text">
                          <strong>Teilnehmerliste</strong>
                          <span>Sieh wer noch kommt</span>
                        </div>
                      </div>
                      <div class="qm-feature">
                        <span class="qm-icon">⏰</span>
                        <div class="qm-text">
                          <strong>Countdown Timer</strong>
                          <span>Nie wieder ein Event verpassen</span>
                        </div>
                      </div>
                      <div class="qm-feature">
                        <span class="qm-icon">📍</span>
                        <div class="qm-text">
                          <strong>Proximity Match</strong>
                          <span>Finde Leute in deiner Nähe</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="slide-footer">
                  <p class="footer-note">
                    <strong>🔒 Datenschutz:</strong> Deine Verfügbarkeit ist nur für Mitglieder deiner Channels sichtbar!
                  </p>
                </div>
              </div>

              <!-- Slide 6: Final - Get Started -->
              <div v-if="currentSlide === 5" key="slide-5" class="slide">
                <div class="slide-icon">🚀</div>
                <h2 class="slide-title">Los geht's!</h2>
                <p class="slide-subtitle">Bereit für ehrliche News & echte Connections?</p>

                <div class="slide-content">
                  <div class="final-checklist">
                    <div class="checklist-item">
                      <span class="check-icon">✅</span>
                      <span>Transparente Algorithmen verstanden</span>
                    </div>
                    <div class="checklist-item">
                      <span class="check-icon">✅</span>
                      <span>Interessen-System kennengelernt</span>
                    </div>
                    <div class="checklist-item">
                      <span class="check-icon">✅</span>
                      <span>Hyperlocale Funktionen entdeckt</span>
                    </div>
                    <div class="checklist-item">
                      <span class="check-icon">✅</span>
                      <span>Quick-Meet Features gesehen</span>
                    </div>
                  </div>

                  <div class="next-steps">
                    <h3 class="next-steps-title">Deine nächsten Schritte:</h3>
                    <div class="step-cards">
                      <div class="step-card">
                        <span class="step-icon">1️⃣</span>
                        <strong>Interessen wählen</strong>
                        <span>Geh zu Einstellungen → Interessen</span>
                      </div>
                      <div class="step-card">
                        <span class="step-icon">2️⃣</span>
                        <strong>Standort freigeben</strong>
                        <span>Für hyperlocale News & Events</span>
                      </div>
                      <div class="step-card">
                        <span class="step-icon">3️⃣</span>
                        <strong>Feed erkunden</strong>
                        <span>Entdecke deinen Kiez!</span>
                      </div>
                    </div>
                  </div>

                  <div class="final-cta">
                    <button @click="handleComplete" class="cta-btn primary">
                      <span>✨</span>
                      <span>Jetzt loslegen!</span>
                    </button>
                  </div>
                </div>

                <div class="slide-footer">
                  <p class="footer-note">
                    <strong>💡 Hinweis:</strong> Du kannst diese Tour jederzeit in den Einstellungen wiederholen.
                  </p>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- Navigation -->
          <div class="navigation">
            <!-- Dot Indicators -->
            <div class="dot-indicators">
              <button
                v-for="(_, index) in slides"
                :key="index"
                @click="goToSlide(index)"
                class="dot"
                :class="{ active: currentSlide === index }"
                :aria-label="`Gehe zu Slide ${index + 1}`"
              ></button>
            </div>

            <!-- Navigation Buttons -->
            <div class="nav-buttons">
              <button
                v-if="currentSlide > 0"
                @click="prevSlide"
                class="nav-btn secondary"
              >
                <span>←</span>
                <span>Zurück</span>
              </button>
              <div v-else class="nav-spacer"></div>

              <button
                v-if="currentSlide < slides.length - 1"
                @click="nextSlide"
                class="nav-btn primary"
              >
                <span>Weiter</span>
                <span>→</span>
              </button>
              <button
                v-else
                @click="handleComplete"
                class="nav-btn primary complete"
              >
                <span>Fertig</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  complete: []
  skip: []
  close: []
}>()

const currentSlide = ref(0)
const slides = ref([
  { id: 'welcome', title: 'Willkommen' },
  { id: 'transparency', title: 'Transparenz' },
  { id: 'interests', title: 'Interessen' },
  { id: 'hyperlocal', title: 'Hyperlokal' },
  { id: 'quick-meet', title: 'Quick-Meet' },
  { id: 'final', title: 'Los geht\'s' }
])

const nextSlide = () => {
  if (currentSlide.value < slides.value.length - 1) {
    currentSlide.value++
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const handleComplete = () => {
  emit('complete')
  emit('close')
}

const handleSkip = () => {
  emit('skip')
  emit('close')
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') nextSlide()
  if (e.key === 'ArrowLeft') prevSlide()
  if (e.key === 'Escape') handleSkip()
}

// Prevent body scroll when modal is open
onMounted(() => {
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Overlay & Container */
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.onboarding-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1.5rem;
  padding: 3rem 2.5rem 2rem;
  backdrop-filter: blur(24px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

/* Progress Bar */
.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem 1.5rem 0 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
  transition: width 0.3s ease;
}

/* Skip Button */
.skip-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.skip-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ef4444;
}

/* Slides Container */
.slides-container {
  position: relative;
  min-height: 550px;
  margin-bottom: 2rem;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

.slide-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.slide-title {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin: 0 0 0.75rem 0;
}

.slide-subtitle {
  font-size: 1.125rem;
  color: #cbd5e1;
  text-align: center;
  margin: 0 0 2rem 0;
}

.slide-content {
  margin-bottom: 2rem;
}

.slide-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-note {
  font-size: 0.875rem;
  color: #94a3b8;
  text-align: center;
  margin: 0;
}

.footer-note strong {
  color: #a5b4fc;
}

/* Feature List (Slide 1) */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 600px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.feature-item:hover {
  transform: translateX(4px);
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(30, 41, 59, 0.7);
}

.feature-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feature-text strong {
  font-size: 1rem;
  color: #f8fafc;
  font-weight: 700;
}

.feature-text span {
  font-size: 0.875rem;
  color: #cbd5e1;
  line-height: 1.5;
}

/* Algorithm Steps (Slide 2) */
.algorithm-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.algo-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

.step-number {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.step-content h4 {
  font-size: 1rem;
  color: #f8fafc;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.step-content p {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0;
  line-height: 1.5;
}

.transparency-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 0.75rem;
  max-width: 600px;
  margin: 0 auto;
}

.badge-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.badge-text {
  font-size: 0.9375rem;
  color: #10b981;
  font-weight: 600;
  line-height: 1.5;
}

/* Interest Demo (Slide 3) */
.interest-demo {
  max-width: 600px;
  margin: 0 auto;
}

.demo-intro {
  font-size: 1rem;
  color: #cbd5e1;
  text-align: center;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.demo-intro strong {
  color: #a5b4fc;
  font-weight: 700;
}

.demo-interests {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.demo-interest-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  font-size: 0.875rem;
  color: #94a3b8;
  transition: all 0.3s;
  cursor: pointer;
}

.demo-interest-chip.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  color: #a78bfa;
}

.chip-icon {
  font-size: 0.875rem;
  font-weight: 700;
}

.chip-score {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
}

.demo-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  color: #cbd5e1;
}

.demo-icon {
  font-size: 1.25rem;
}

/* Hyperlocal Demo (Slide 4) */
.hyperlocal-demo {
  max-width: 700px;
  margin: 0 auto;
}

.demo-map-placeholder {
  position: relative;
  height: 250px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.map-marker {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  animation: markerPulse 2s ease-in-out infinite;
}

.map-marker.user {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
}

.map-marker.event,
.map-marker.news {
  font-size: 1.5rem;
}

@keyframes markerPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.marker-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  white-space: nowrap;
}

.radius-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 180px;
  height: 180px;
  border: 2px dashed rgba(99, 102, 241, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: radiusPulse 3s ease-in-out infinite;
}

@keyframes radiusPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.hyperlocal-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hyperlocal-feature {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

/* Quick-Meet Demo (Slide 5) */
.quick-meet-demo {
  max-width: 600px;
  margin: 0 auto;
}

.availability-demo {
  margin: 2rem 0;
}

.availability-toggle {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 1rem;
}

.availability-toggle.active .toggle-icon {
  font-size: 2rem;
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toggle-text strong {
  font-size: 1.125rem;
  color: #10b981;
  font-weight: 700;
}

.toggle-text span {
  font-size: 0.875rem;
  color: #6ee7b7;
}

.quick-meet-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.qm-feature {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

.qm-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.qm-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.qm-text strong {
  font-size: 0.875rem;
  color: #f8fafc;
  font-weight: 700;
}

.qm-text span {
  font-size: 0.8125rem;
  color: #cbd5e1;
  line-height: 1.4;
}

/* Final Slide (Slide 6) */
.final-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: #6ee7b7;
  font-weight: 600;
}

.check-icon {
  font-size: 1.25rem;
}

.next-steps {
  margin-bottom: 2rem;
}

.next-steps-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
  margin: 0 0 1.5rem 0;
}

.step-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.step-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.75rem;
  text-align: center;
  transition: all 0.3s;
}

.step-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

.step-icon {
  font-size: 2rem;
}

.step-card strong {
  font-size: 0.9375rem;
  color: #f8fafc;
  font-weight: 700;
}

.step-card span:last-child {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.final-cta {
  text-align: center;
}

.cta-btn {
  display: inline-flex;
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
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

/* Navigation */
.navigation {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.dot-indicators {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  width: 28px;
  border-radius: 5px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.nav-spacer {
  width: 120px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.nav-btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.nav-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.nav-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cbd5e1;
}

.nav-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.nav-btn.complete {
  background: linear-gradient(135deg, #10b981, #059669);
}

.nav-btn.complete:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Slide Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .onboarding-overlay {
    padding: 1rem;
  }

  .onboarding-container {
    padding: 2.5rem 1.5rem 1.5rem;
  }

  .slides-container {
    min-height: 600px;
  }

  .slide-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .slide-title {
    font-size: 1.75rem;
  }

  .slide-subtitle {
    font-size: 1rem;
  }

  .quick-meet-features {
    grid-template-columns: 1fr;
  }

  .step-cards {
    grid-template-columns: 1fr;
  }

  .nav-buttons {
    max-width: 100%;
  }

  .nav-spacer {
    display: none;
  }
}

@media (max-width: 480px) {
  .onboarding-container {
    padding: 2rem 1rem 1rem;
  }

  .slide-title {
    font-size: 1.5rem;
  }

  .slide-subtitle {
    font-size: 0.9375rem;
  }

  .feature-item {
    padding: 1rem;
  }

  .demo-map-placeholder {
    height: 200px;
  }
}
</style>

<template>
  <div class="gun-login">
    <div class="login-card">
      <div class="header">
        <h2>🔐 P2P Login</h2>
        <p class="subtitle">Dezentrale Authentifizierung mit Gun.js</p>
      </div>

      <div v-if="!gunAuth.isLoggedIn" class="login-form">
        <div class="tabs">
          <button
            @click="mode = 'login'"
            :class="{ active: mode === 'login' }"
            class="tab-btn"
          >
            Login
          </button>
          <button
            @click="mode = 'signup'"
            :class="{ active: mode === 'signup' }"
            class="tab-btn"
          >
            Registrieren
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="alias">
              <span class="icon">👤</span>
              Benutzername
            </label>
            <input
              id="alias"
              v-model="alias"
              type="text"
              placeholder="mein_username"
              required
              class="input"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <span class="icon">🔒</span>
              Passwort
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              class="input"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="submit-btn"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>{{ mode === 'login' ? 'Einloggen' : 'Registrieren' }}</span>
          </button>

          <p v-if="error" class="error">{{ error }}</p>
        </form>

        <div class="info-box">
          <p>
            <strong>🌐 Dezentral:</strong> Deine Daten werden P2P verschlüsselt
          </p>
          <p>
            <strong>🔐 Sicher:</strong> Zero-knowledge Authentifizierung
          </p>
        </div>
      </div>

      <div v-else class="logged-in">
        <div class="user-info">
          <div class="avatar">{{ gunAuth.alias[0].toUpperCase() }}</div>
          <div class="details">
            <h3>{{ gunAuth.alias }}</h3>
            <p class="pub">{{ shortenPub(gunAuth.pub) }}</p>
          </div>
        </div>

        <div class="stats">
          <div class="stat">
            <span class="icon">🌐</span>
            <span class="value">{{ peersCount }}</span>
            <span class="label">Peers</span>
          </div>
          <div class="stat">
            <span class="icon">🔗</span>
            <span class="value">Online</span>
            <span class="label">Status</span>
          </div>
        </div>

        <button @click="handleLogout" class="logout-btn">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  gunAuth,
  gunLogin,
  gunSignup,
  gunLogout,
  getPeersCount,
  initGun
} from '../services/gunService'

const mode = ref<'login' | 'signup'>('login')
const alias = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const peersCount = ref(0)

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    let success = false

    if (mode.value === 'login') {
      success = await gunLogin(alias.value, password.value)
      if (!success) {
        error.value = 'Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.'
      }
    } else {
      success = await gunSignup(alias.value, password.value)
      if (!success) {
        error.value = 'Registrierung fehlgeschlagen. Username existiert bereits.'
      }
    }

    if (success) {
      alias.value = ''
      password.value = ''
      updatePeersCount()
    }
  } catch (err) {
    error.value = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.'
    console.error('[GunLogin]', err)
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  gunLogout()
}

function shortenPub(pub: string): string {
  if (!pub) return ''
  return `${pub.substring(0, 8)}...${pub.substring(pub.length - 8)}`
}

function updatePeersCount() {
  peersCount.value = getPeersCount()
}

onMounted(() => {
  initGun()
  updatePeersCount()

  // Update peers count every 5 seconds
  setInterval(updatePeersCount, 5000)
})
</script>

<style scoped>
.gun-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: white;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: white;
  font-size: 0.95rem;
}

.icon {
  font-size: 1.2rem;
}

.input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.9rem;
  text-align: center;
}

.info-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
}

.info-box p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.logged-in {
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.details {
  flex: 1;
  text-align: left;
}

.details h3 {
  margin: 0;
  font-size: 1.2rem;
  color: white;
}

.pub {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
}

.stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat {
  flex: 1;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.stat .label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.logout-btn {
  width: 100%;
  padding: 0.875rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}
</style>

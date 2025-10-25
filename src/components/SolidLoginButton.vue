<template>
  <div class="solid-login">
    <!-- Logged Out State -->
    <div v-if="!session.isLoggedIn" class="login-container">
      <button
        @click="showProviderSelector = !showProviderSelector"
        class="login-button"
        aria-label="Login mit Solid Pod"
      >
        <span class="icon">🔒</span>
        <span>Login mit Solid Pod</span>
      </button>

      <!-- Provider Selector -->
      <div v-if="showProviderSelector" class="provider-selector">
        <h3>Wähle deinen Solid Provider:</h3>
        <div class="providers">
          <button
            v-for="provider in session.providers"
            :key="provider.name"
            @click="handleLogin(provider)"
            class="provider-button"
          >
            <div class="provider-name">{{ provider.name }}</div>
            <div class="provider-desc">{{ provider.description }}</div>
          </button>

          <!-- Custom Provider Input -->
          <div v-if="showCustomInput" class="custom-provider">
            <input
              v-model="customProviderUrl"
              type="url"
              placeholder="https://your-pod.example.com"
              class="custom-input"
            />
            <button @click="handleCustomLogin" class="custom-button">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Logged In State -->
    <div v-else class="logged-in">
      <div class="user-info">
        <span class="icon">✓</span>
        <span class="username">{{ session.username }}</span>
      </div>
      <button @click="handleLogout" class="logout-button" aria-label="Logout">
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSolidSession } from '../stores/useSolidSession'
import type { SolidProvider } from '../services/solidAuth'

const session = useSolidSession()
const showProviderSelector = ref(false)
const showCustomInput = ref(false)
const customProviderUrl = ref('')

async function handleLogin(provider: SolidProvider) {
  if (provider.name === 'Custom') {
    showCustomInput.value = true
    return
  }

  try {
    await session.login(provider)
  } catch (error) {
    console.error('Login failed:', error)
    alert('Login fehlgeschlagen. Bitte versuche es erneut.')
  }
}

async function handleCustomLogin() {
  if (!customProviderUrl.value) {
    alert('Bitte gib eine Pod-URL ein')
    return
  }

  try {
    await session.login(customProviderUrl.value)
  } catch (error) {
    console.error('Custom login failed:', error)
    alert('Login fehlgeschlagen. Bitte überprüfe die URL.')
  }
}

async function handleLogout() {
  try {
    await session.logout()
    showProviderSelector.value = false
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.solid-login {
  padding: 1rem;
}

.login-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.icon {
  font-size: 1.2rem;
}

.provider-selector {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.provider-selector h3 {
  margin: 0 0 1rem 0;
  color: #e2e8f0;
  font-size: 1.1rem;
}

.providers {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.provider-button {
  text-align: left;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.provider-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.provider-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.provider-desc {
  font-size: 0.875rem;
  color: #94a3b8;
}

.custom-provider {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.custom-input {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
}

.custom-input::placeholder {
  color: #64748b;
}

.custom-button {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.custom-button:hover {
  background: #5568d3;
}

.logged-in {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #22c55e;
  font-weight: 600;
}

.logout-button {
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.2);
}
</style>

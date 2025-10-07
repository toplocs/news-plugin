<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2>Etwas ist schief gelaufen</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="retry" class="btn-retry">Erneut versuchen</button>
        <button @click="reset" class="btn-reset">Seite neu laden</button>
      </div>
      <details v-if="errorDetails" class="error-details">
        <summary>Technische Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message || 'Ein unbekannter Fehler ist aufgetreten'
  errorDetails.value = `${err.stack}\n\nComponent: ${info}`

  console.error('Error captured:', err, instance, info)

  // Prevent error from propagating
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
}

const reset = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.error-content {
  max-width: 600px;
  width: 100%;
  text-align: center;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  padding: 3rem 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.error-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1rem 0;
}

.error-message {
  font-size: 1.0625rem;
  color: #cbd5e1;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-retry,
.btn-reset {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry {
  background: #6366f1;
  color: white;
}

.btn-retry:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn-reset {
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-reset:hover {
  background: rgba(30, 41, 59, 0.8);
}

.error-details {
  text-align: left;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1.5rem;
}

.error-details summary {
  font-size: 0.875rem;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
}

.error-details pre {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #fca5a5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

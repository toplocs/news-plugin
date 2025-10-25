<template>
  <div class="solid-bookmarks-manager">
    <h2>📚 Meine Bookmarks (Solid Pod)</h2>

    <div v-if="!session.isLoggedIn" class="not-logged-in">
      <p>🔒 Bitte einloggen</p>
      <SolidLoginButton />
    </div>

    <div v-else class="bookmarks-container">
      <div class="controls">
        <button @click="loadBookmarks" :disabled="loading" class="reload-btn">
          {{ loading ? '⏳ Laden...' : '🔄 Neu laden' }}
        </button>
        <button @click="syncFromLocal" class="sync-btn">
          🔄 Sync von localStorage
        </button>
        <button @click="handleExport" class="export-btn">
          📥 Export JSON
        </button>
        <button @click="triggerImport" class="import-btn">
          📤 Import JSON
        </button>
        <input ref="fileInput" type="file" accept=".json" @change="handleImport" style="display: none" />
      </div>

      <div v-if="bookmarks.length === 0" class="empty">
        Keine Bookmarks vorhanden
      </div>

      <div v-else class="bookmarks-list">
        <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-card">
          <div class="bookmark-info">
            <h3>{{ bookmark.title }}</h3>
            <a :href="bookmark.url" target="_blank" class="bookmark-url">
              {{ bookmark.url }}
            </a>
            <div class="bookmark-meta">
              📅 {{ formatDate(bookmark.createdAt) }}
            </div>
          </div>
          <button @click="removeBookmark(bookmark.id)" class="delete-btn">
            🗑️
          </button>
        </div>
      </div>

      <!-- Add Bookmark Form -->
      <div class="add-bookmark">
        <h3>➕ Neues Bookmark</h3>
        <form @submit.prevent="handleAdd" class="add-form">
          <input v-model="newBookmark.title" type="text" placeholder="Titel" required class="input" />
          <input v-model="newBookmark.url" type="url" placeholder="https://..." required class="input" />
          <button type="submit" :disabled="adding" class="add-btn">
            {{ adding ? 'Fügt hinzu...' : '➕ Hinzufügen' }}
          </button>
        </form>
      </div>

      <div v-if="message" class="message" :class="message.type">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSolidSession } from '../stores/useSolidSession'
import { solidBookmarks, type Bookmark } from '../services/solidBookmarks'
import SolidLoginButton from './SolidLoginButton.vue'

const session = useSolidSession()
const bookmarks = ref<Bookmark[]>([])
const loading = ref(false)
const adding = ref(false)
const message = ref<{ text: string; type: 'success' | 'error' } | null>(null)

const newBookmark = ref({
  title: '',
  url: ''
})

async function loadBookmarks() {
  if (!session.isLoggedIn) return

  loading.value = true
  try {
    bookmarks.value = await solidBookmarks.getBookmarks()
  } catch (error) {
    console.error('Error loading bookmarks:', error)
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  adding.value = true
  message.value = null

  try {
    const success = await solidBookmarks.addBookmark(newBookmark.value)
    if (success) {
      message.value = { text: '✅ Bookmark hinzugefügt!', type: 'success' }
      newBookmark.value = { title: '', url: '' }
      await loadBookmarks()
      setTimeout(() => message.value = null, 3000)
    } else {
      message.value = { text: '❌ Fehler beim Hinzufügen', type: 'error' }
    }
  } catch (error) {
    message.value = { text: '❌ Fehler beim Hinzufügen', type: 'error' }
  } finally {
    adding.value = false
  }
}

async function removeBookmark(id: string) {
  if (!confirm('Bookmark wirklich löschen?')) return

  try {
    const success = await solidBookmarks.removeBookmark(id)
    if (success) {
      await loadBookmarks()
      message.value = { text: '✅ Bookmark gelöscht', type: 'success' }
      setTimeout(() => message.value = null, 3000)
    }
  } catch (error) {
    message.value = { text: '❌ Fehler beim Löschen', type: 'error' }
  }
}

async function syncFromLocal() {
  try {
    await solidBookmarks.syncWithLocalStorage()
    await loadBookmarks()
    message.value = { text: '✅ Sync erfolgreich!', type: 'success' }
    setTimeout(() => message.value = null, 3000)
  } catch (error) {
    message.value = { text: '❌ Sync fehlgeschlagen', type: 'error' }
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE')
}

const fileInput = ref<HTMLInputElement | null>(null)

async function handleExport() {
  try {
    const json = await solidBookmarks.exportToJSON()
    solidBookmarks.downloadAsJSON(json, `bookmarks-${new Date().toISOString().split('T')[0]}.json`)
    message.value = { text: '✅ Export erfolgreich!', type: 'success' }
    setTimeout(() => message.value = null, 3000)
  } catch (error) {
    message.value = { text: '❌ Export fehlgeschlagen', type: 'error' }
  }
}

function triggerImport() {
  fileInput.value?.click()
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const result = await solidBookmarks.importFromJSON(text)
    await loadBookmarks()
    message.value = {
      text: `✅ Import: ${result.success} erfolgreich, ${result.failed} fehlgeschlagen`,
      type: result.failed === 0 ? 'success' : 'error'
    }
    setTimeout(() => message.value = null, 5000)
  } catch (error) {
    message.value = { text: '❌ Import fehlgeschlagen', type: 'error' }
  }
}

onMounted(() => {
  if (session.isLoggedIn) {
    loadBookmarks()
  }
})
</script>

<style scoped>
.solid-bookmarks-manager {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2, h3 {
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.not-logged-in {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.reload-btn, .sync-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.reload-btn:hover, .sync-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.empty {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.bookmark-card {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s;
}

.bookmark-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.bookmark-info {
  flex: 1;
}

.bookmark-info h3 {
  color: #e2e8f0;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.bookmark-url {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  display: block;
  margin-bottom: 0.5rem;
}

.bookmark-url:hover {
  text-decoration: underline;
}

.bookmark-meta {
  color: #64748b;
  font-size: 0.75rem;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.add-bookmark {
  padding: 1.5rem;
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.add-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.message.success {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
</style>

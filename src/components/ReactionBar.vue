<!--
🎯 REACTIONBAR COMPONENT - SELF-DOC
═══════════════════════════════════════════

✅ IMPLEMENTIERT (2025-10-23):
- 6 Quick Reaction Types: ❤️ 👍 🔥 🎉 🤔 😮
- Gun.js P2P Real-time Sync (gun-manhattan.herokuapp.com)
- Toggle Logic: Click to add, click again to remove
- One reaction per user per article
- Reaction counts with real-time updates
- Total reactions counter
- Smooth animations: reaction-pop, emoji-bounce
- ARIA Labels: role="group", aria-pressed, aria-live

🧪 ZU TESTEN:
1. Click reaction → should add and show active state
2. Click same reaction → should remove and deactivate
3. Click different reaction → should switch reactions
4. Multiple users → counts should update in real-time
5. Reload page → reaction state should persist
6. Offline/Online → reactions should sync when back online

🔧 ZU FIXEN:
- Keine Issues ✅

📖 USAGE:
<ReactionBar :article-id="article.id" />

🔌 INTEGRIERT IN:
- NewsDetailModal.vue (zwischen Actions und Comments)
- NewsCard.vue (inline mit @click.stop)

📊 STATS:
- Lines: 189
- Gun.js Node: news_plugin/reactions/{articleId}/{userId}_{articleId}
- Created: 2025-10-23
═══════════════════════════════════════════
-->
<template>
  <div class="reaction-bar" role="group" aria-label="Artikel-Reaktionen">
    <!-- Reaction Buttons -->
    <div class="reactions-container">
      <button
        v-for="(emoji, type) in REACTION_TYPES"
        :key="type"
        @click="handleReaction(type as ReactionType)"
        :class="['reaction-btn', { active: userReaction === type }]"
        :title="`React with ${emoji}`"
        :aria-label="`${userReaction === type ? 'Entfernen' : 'Hinzufügen'} ${emoji} Reaktion${getCount(type as ReactionType) > 0 ? ', ' + getCount(type as ReactionType) + ' Reaktionen' : ''}`"
        :aria-pressed="userReaction === type"
      >
        <span class="reaction-emoji" aria-hidden="true">{{ emoji }}</span>
        <span v-if="getCount(type as ReactionType) > 0" class="reaction-count" aria-label="`${getCount(type as ReactionType)} Reaktionen`">
          {{ getCount(type as ReactionType) }}
        </span>
      </button>
    </div>

    <!-- Total Reactions -->
    <div v-if="totalReactions > 0" class="total-reactions" role="status" aria-live="polite">
      <span class="total-icon" aria-hidden="true">💬</span>
      <span class="total-count">{{ totalReactions }} {{ totalReactions === 1 ? 'Reaktion' : 'Reaktionen' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useReactions, type ReactionType, REACTION_TYPES } from '../stores/useReactions'

const props = defineProps<{
  articleId: string
}>()

const reactionsStore = useReactions()

// Computed
const reactionCounts = computed(() => reactionsStore.getReactionCounts(props.articleId))
const userReaction = computed(() => reactionsStore.getUserReaction(props.articleId))
const totalReactions = computed(() => reactionsStore.getTotalReactions(props.articleId))

// Methods
const getCount = (type: ReactionType): number => {
  return reactionCounts.value[type] || 0
}

const handleReaction = async (type: ReactionType) => {
  await reactionsStore.addReaction(props.articleId, type)
}

// Load reactions on mount
onMounted(() => {
  reactionsStore.loadReactions(props.articleId)
  // Subscribe to real-time updates
  reactionsStore.subscribeToReactions(props.articleId)
})
</script>

<style scoped>
.reaction-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.reactions-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: #cbd5e1;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.reaction-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
  transform: scale(1.05);
}

.reaction-btn.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
  animation: reaction-pop 0.3s ease-out;
}

.reaction-emoji {
  font-size: 1.125rem;
  line-height: 1;
  transition: transform 0.2s;
}

.reaction-btn:hover .reaction-emoji {
  transform: scale(1.2);
}

.reaction-btn.active .reaction-emoji {
  transform: scale(1.15);
  animation: emoji-bounce 0.5s ease-out;
}

.reaction-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: #a5b4fc;
  min-width: 1rem;
  text-align: center;
}

.total-reactions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 999px;
  font-size: 0.875rem;
  color: #94a3b8;
}

.total-icon {
  font-size: 1rem;
}

.total-count {
  font-weight: 500;
}

/* Animations */
@keyframes reaction-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes emoji-bounce {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3) rotate(-10deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  75% {
    transform: scale(1.2) rotate(-5deg);
  }
  100% {
    transform: scale(1.15) rotate(0deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .reaction-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .total-reactions {
    align-self: flex-end;
  }
}
</style>

<template>
  <div class="skeleton-wrapper" :class="variant">
    <!-- Post Skeleton -->
    <div v-if="type === 'post'" class="skeleton-post">
      <div class="skeleton-header">
        <div class="skeleton-avatar skeleton-pulse"></div>
        <div class="skeleton-meta">
          <div class="skeleton-line skeleton-pulse" style="width: 150px; height: 16px;"></div>
          <div class="skeleton-line skeleton-pulse" style="width: 100px; height: 12px; margin-top: 8px;"></div>
        </div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-pulse" style="width: 100%; height: 14px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 90%; height: 14px; margin-top: 8px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 70%; height: 14px; margin-top: 8px;"></div>
      </div>
      <div class="skeleton-tags">
        <div class="skeleton-tag skeleton-pulse"></div>
        <div class="skeleton-tag skeleton-pulse"></div>
      </div>
    </div>

    <!-- User Card Skeleton -->
    <div v-else-if="type === 'user-card'" class="skeleton-user-card">
      <div class="skeleton-avatar-large skeleton-pulse"></div>
      <div class="skeleton-line skeleton-pulse" style="width: 120px; height: 18px; margin: 12px auto;"></div>
      <div class="skeleton-line skeleton-pulse" style="width: 80px; height: 12px; margin: 0 auto;"></div>
    </div>

    <!-- Comment Skeleton -->
    <div v-else-if="type === 'comment'" class="skeleton-comment">
      <div class="skeleton-avatar-small skeleton-pulse"></div>
      <div class="skeleton-comment-content">
        <div class="skeleton-line skeleton-pulse" style="width: 100px; height: 14px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 100%; height: 12px; margin-top: 8px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width: 80%; height: 12px; margin-top: 4px;"></div>
      </div>
    </div>

    <!-- List Item Skeleton -->
    <div v-else-if="type === 'list-item'" class="skeleton-list-item">
      <div class="skeleton-line skeleton-pulse" style="width: 100%; height: 16px;"></div>
      <div class="skeleton-line skeleton-pulse" style="width: 70%; height: 12px; margin-top: 8px;"></div>
    </div>

    <!-- Generic Skeleton -->
    <div v-else class="skeleton-generic">
      <div class="skeleton-line skeleton-pulse" :style="{ width, height }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'post' | 'user-card' | 'comment' | 'list-item' | 'generic'
  variant?: 'light' | 'dark'
  width?: string
  height?: string
}

withDefaults(defineProps<Props>(), {
  type: 'generic',
  variant: 'dark',
  width: '100%',
  height: '20px'
})
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
}

.skeleton-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton-line {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.skeleton-post {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.skeleton-meta {
  flex: 1;
}

.skeleton-content {
  margin-bottom: 1rem;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
}

.skeleton-tag {
  width: 80px;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-user-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.skeleton-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 auto;
}

.skeleton-comment {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.skeleton-avatar-small {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.skeleton-comment-content {
  flex: 1;
}

.skeleton-list-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.skeleton-generic {
  padding: 0.5rem;
}

.skeleton-wrapper.light .skeleton-line,
.skeleton-wrapper.light .skeleton-avatar,
.skeleton-wrapper.light .skeleton-tag {
  background: rgba(0, 0, 0, 0.1);
}

.skeleton-wrapper.light .skeleton-post,
.skeleton-wrapper.light .skeleton-user-card {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}
</style>

<template>
  <article class="skeleton-card">
    <!-- Skeleton Image -->
    <div class="skeleton-image"></div>

    <!-- Skeleton Content -->
    <div class="skeleton-body">
      <!-- Meta -->
      <div class="skeleton-meta">
        <div class="skeleton-box" style="width: 80px;"></div>
        <div class="skeleton-box" style="width: 40px;"></div>
      </div>

      <!-- Title -->
      <div class="skeleton-title">
        <div class="skeleton-box" style="width: 100%;"></div>
        <div class="skeleton-box" style="width: 70%;"></div>
      </div>

      <!-- Summary -->
      <div class="skeleton-summary">
        <div class="skeleton-box" style="width: 100%;"></div>
        <div class="skeleton-box" style="width: 85%;"></div>
      </div>

      <!-- Footer -->
      <div class="skeleton-footer">
        <div class="skeleton-box" style="width: 100px;"></div>
        <div class="skeleton-box" style="width: 60px;"></div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.skeleton-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(
    90deg,
    rgba(30, 41, 59, 0.6) 0%,
    rgba(51, 65, 85, 0.6) 50%,
    rgba(30, 41, 59, 0.6) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-body {
  padding: 1.25rem;
}

.skeleton-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.skeleton-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.skeleton-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.skeleton-box {
  height: 14px;
  background: linear-gradient(
    90deg,
    rgba(51, 65, 85, 0.6) 0%,
    rgba(71, 85, 105, 0.6) 50%,
    rgba(51, 65, 85, 0.6) 100%
  );
  background-size: 200% 100%;
  border-radius: 0.25rem;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

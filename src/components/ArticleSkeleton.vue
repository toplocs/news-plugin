<template>
  <div class="bg-slate-800/50 backdrop-blur-sm rounded-lg overflow-hidden animate-pulse">
    <!-- Image Skeleton -->
    <div class="w-full h-48 bg-slate-700/50"></div>

    <!-- Content Skeleton -->
    <div class="p-4 space-y-3">
      <!-- Title -->
      <div class="space-y-2">
        <div class="h-4 bg-slate-700/50 rounded w-3/4"></div>
        <div class="h-4 bg-slate-700/50 rounded w-1/2"></div>
      </div>

      <!-- Summary -->
      <div class="space-y-2">
        <div class="h-3 bg-slate-700/50 rounded w-full"></div>
        <div class="h-3 bg-slate-700/50 rounded w-5/6"></div>
        <div class="h-3 bg-slate-700/50 rounded w-4/6"></div>
      </div>

      <!-- Meta -->
      <div class="flex items-center justify-between">
        <div class="h-3 bg-slate-700/50 rounded w-24"></div>
        <div class="h-3 bg-slate-700/50 rounded w-16"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ArticleSkeleton'
})
</script>

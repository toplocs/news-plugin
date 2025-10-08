<template>
  <img
    :src="imageSrc"
    :alt="alt"
    :class="{ 'lazy-loaded': isLoaded }"
    @load="handleLoad"
    @error="handleError"
    ref="imgRef"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  src: string
  alt: string
  placeholder?: string
}>()

const imgRef = ref<HTMLImageElement | null>(null)
const imageSrc = ref(props.placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3C/svg%3E')
const isLoaded = ref(false)

let observer: IntersectionObserver | null = null

const loadImage = () => {
  if (props.src && imgRef.value) {
    imageSrc.value = props.src
  }
}

const handleLoad = () => {
  isLoaded.value = true
}

const handleError = () => {
  // Fallback to placeholder
  if (props.placeholder) {
    imageSrc.value = props.placeholder
  }
}

onMounted(() => {
  if (!imgRef.value) return

  // Use IntersectionObserver for lazy loading
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage()
          if (observer && imgRef.value) {
            observer.unobserve(imgRef.value)
          }
        }
      })
    },
    { rootMargin: '50px' }
  )

  observer.observe(imgRef.value)
})

onUnmounted(() => {
  if (observer && imgRef.value) {
    observer.unobserve(imgRef.value)
  }
})
</script>

<style scoped>
img {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

img.lazy-loaded {
  opacity: 1;
}
</style>

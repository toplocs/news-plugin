/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

// Module federation declarations
declare module 'news-plugin/Sidebar' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'news-plugin/Settings' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'news-plugin/Plugin' {
  export function registerPlugin(): void
}

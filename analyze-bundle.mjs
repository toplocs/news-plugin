import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import topLevelAwait from 'vite-plugin-top-level-await'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    federation({
      name: 'news-plugin',
      filename: 'plugin.js',
      exposes: {
        './PluginConfig': './src/index.ts',
        './InfoSidebar': './src/views/info/Sidebar.vue',
        './SettingsContent': './src/views/settings/Content.vue',
      },
      shared: ['vue'],
      remotes: {
        remoteName: '',
      },
    }),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: i => `__tla_${i}`
    }),
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  optimizeDeps: {
    exclude: ["__federation__"],
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
          'gun-vendor': ['gun', 'gun/sea']
        }
      }
    }
  }
})

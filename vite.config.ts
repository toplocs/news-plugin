import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import federation from "@originjs/vite-plugin-federation";
import topLevelAwait from 'vite-plugin-top-level-await';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Plugin configuration - supports both dev and preview modes
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
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    exclude: ["__federation__"],
  },

  build: {
    outDir: './dist',
    assetsDir: '',
    minify: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        demo: path.resolve(__dirname, 'demo.html'),
        demo3col: path.resolve(__dirname, 'demo-3col.html'),
        liveDemo: path.resolve(__dirname, 'live-demo.html'),
        landing: path.resolve(__dirname, 'landing.html'),
        solidDashboard: path.resolve(__dirname, 'solid-dashboard.html'),
        p2pDemo: path.resolve(__dirname, 'p2p-demo.html'),
        controlCenter: path.resolve(__dirname, 'control-center.html')
      },
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        manualChunks: (id) => {
          // Vendor chunks (large, changes rarely)
          if (id.includes('@inrupt/')) {
            return 'solid-vendor'
          }
          if (id.includes('vue') || id.includes('pinia')) {
            return 'vue-vendor'
          }
          if (id.includes('gun') || id.includes('Gun')) {
            return 'gun-vendor'
          }

          // Solid components chunk (lazy loaded)
          if (id.includes('components/Solid')) {
            return 'solid-components'
          }

          // Solid services chunk (lazy loaded)
          if (id.includes('services/solid')) {
            return 'solid-services'
          }

          // Gun.js services chunk
          if (id.includes('services/gun')) {
            return 'gun-services'
          }

          // PWA utilities chunk
          if (id.includes('utils/pwa') || id.includes('PWAInstallButton')) {
            return 'pwa'
          }

          // Gun components chunk
          if (id.includes('components/Gun') || id.includes('components/Community')) {
            return 'gun-components'
          }

          // Core UI components
          if (id.includes('components/') && !id.includes('Solid') && !id.includes('Gun')) {
            return 'ui-components'
          }
        }
      }
    }
  }
});

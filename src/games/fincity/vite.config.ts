import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@game': resolve(__dirname, 'src/game'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@types': resolve(__dirname, 'src/types'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@assets': resolve(__dirname, 'src/assets'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte'],
          pixi: ['pixi.js'],
          game: [
            './src/game/GameEngine.ts',
            './src/game/SceneManager.ts',
            './src/game/ResourceManager.ts',
            './src/game/BuildingSystem.ts',
            './src/game/BuildingRenderer.ts',
            './src/game/GridManager.ts'
          ],
          stores: [
            './src/stores/gameState.ts',
            './src/stores/playerData.ts',
            './src/stores/buildings.ts',
            './src/stores/quests.ts',
            './src/stores/ui.ts',
            './src/stores/achievements.ts'
          ],
          components: [
            './src/components/LoadingScreen.svelte',
            './src/components/GameCanvas.svelte',
            './src/components/BuildMenu.svelte',
            './src/components/QuestLog.svelte',
            './src/components/Settings.svelte',
            './src/components/Achievement.svelte',
            './src/components/Onboarding.svelte'
          ]
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  optimizeDeps: {
    include: ['pixi.js'],
    exclude: ['@vite/client', '@vite/env'],
  },
});

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), ...(process.env.HTTPS ? [mkcert()] : [])],
	build: {
		target: 'es2020',
		reportCompressedSize: false,
		chunkSizeWarningLimit: 1000, // Увеличиваем лимит для игровых приложений
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Разделяем большие библиотеки на отдельные чанки
					if (id.includes('pixi.js')) {
						return 'pixi-vendor';
					}
					if (id.includes('matter-js')) {
						return 'matter-vendor';
					}
					if (id.includes('howler')) {
						return 'howler-vendor';
					}
					if (id.includes('node_modules')) {
						return 'vendor';
					}
					// Игровые модули
					if (id.includes('quiz-shield-ruble')) {
						return 'quiz-game';
					}
					if (id.includes('match3-golden-reserve')) {
						return 'match3-game';
					}
					if (id.includes('crossword-financial')) {
						return 'crossword-game';
					}
					if (id.includes('fincity')) {
						return 'fincity-game';
					}
					if (id.includes('anti-fraud-hunter')) {
						return 'anti-fraud-game';
					}
					if (id.includes('code-to-success')) {
						return 'novella-game';
					}
					if (id.includes('asset-guardian')) {
						return 'asset-guardian-game';
					}
				}
			}
		}
	},
	optimizeDeps: {
		include: ['svelte/store', 'svelte/transition', 'svelte/motion', 'pixi.js'],
		exclude: ['@games/*'],
		force: true
	},
	server: {
		host: true,
		allowedHosts: true,
		fs: {
			allow: ['..']
		}
	},
	preview: {
		host: true,
		allowedHosts: true,
		port: 4173,
		strictPort: true
	}
});

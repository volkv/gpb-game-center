import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		target: 'es2020',
		cssCodeSplit: true,
		reportCompressedSize: false,
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: {
					'quiz-game': ['./src/games/quiz-shield-ruble/QuizGame.svelte'],
					'match3-game': ['./src/games/match3-golden-reserve/Match3Demo.svelte'],
					'crossword-game': ['./src/games/crossword-financial/CrosswordDemo.svelte'],
					'fincity-game': ['./src/games/fincity/FincityGame.svelte'],
					'vendor-svelte': ['svelte', 'svelte/store', 'svelte/transition', 'svelte/motion']
				}
			}
		}
	},
	optimizeDeps: {
		include: ['svelte/store', 'svelte/transition', 'svelte/motion', 'pixi.js'],
		exclude: ['@games/*']
	},
	server: {
		fs: {
			allow: ['..']
		}
	},
	preview: {
		port: 4173,
		strictPort: true
	}
});

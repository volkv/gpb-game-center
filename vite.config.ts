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
					'vendor-svelte': ['svelte', 'svelte/store', 'svelte/transition', 'svelte/motion']
				},
				assetFileNames: (assetInfo) => {
					const info = assetInfo.name!.split('.');
					let extType = info[info.length - 1];
					if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
						extType = 'img';
					} else if (/woff|woff2/.test(extType)) {
						extType = 'fonts';
					}
					return `assets/${extType}/[name]-[hash][extname]`;
				},
				chunkFileNames: 'assets/js/[name]-[hash].js',
				entryFileNames: 'assets/js/[name]-[hash].js'
			}
		}
	},
	optimizeDeps: {
		include: ['svelte/store', 'svelte/transition', 'svelte/motion'],
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

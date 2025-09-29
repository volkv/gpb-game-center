import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), ...(process.env.HTTPS ? [mkcert()] : [])],
	build: {
		target: 'es2020',
		reportCompressedSize: false,
		chunkSizeWarningLimit: 500,
		rollupOptions: {
			output: {
				manualChunks: {
					'quiz-game': ['./src/games/quiz-shield-ruble/QuizGame.svelte'],
					'match3-game': ['./src/games/match3-golden-reserve/Match3Game.svelte'],
					'crossword-game': ['./src/games/crossword-financial/CrosswordDemo.svelte'],
					'fincity-game': ['./src/games/fincity/FincityGame.svelte'],
					'anti-fraud-game': ['./src/games/anti-fraud-hunter/AntiFraudGame.svelte'],
					'novella-game': ['./src/games/code-to-success/CodeToSuccessGame.svelte'],
					'asset-guardian-game': ['./src/games/asset-guardian/AssetGuardianGame.svelte'],
					'vendor-svelte': ['svelte', 'svelte/store', 'svelte/transition', 'svelte/motion']
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
		allowedHosts: ['thankful-trusting-jaguar.ngrok-free.app'],
		fs: {
			allow: ['..']
		}
	},
	preview: {
		port: 4173,
		strictPort: true
	}
});

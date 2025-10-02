import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			'@lib': './src/lib',
			'@lib/*': './src/lib/*',
			'@games': './src/games',
			'@games/*': './src/games/*',
			'@components': './src/lib/components',
			'@components/*': './src/lib/components/*',
			'@stores': './src/lib/stores',
			'@stores/*': './src/lib/stores/*',
			'@utils': './src/lib/utils',
			'@utils/*': './src/lib/utils/*',
			'@types': './src/lib/types',
			'@types/*': './src/lib/types/*'
		}
	}
};

export default config;

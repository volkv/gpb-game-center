<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';

	let { children } = $props();
	let isLoaded = $state(false);

	onMount(() => {
		isLoaded = true;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

		document.documentElement.style.setProperty(
			'--reduced-motion',
			prefersReducedMotion.matches ? '1' : '0'
		);

		prefersReducedMotion.addEventListener('change', (e) => {
			document.documentElement.style.setProperty(
				'--reduced-motion',
				e.matches ? '1' : '0'
			);
		});

		function handleOrientationChange() {
			if (window.orientation && Math.abs(window.orientation) === 90) {
				document.body.style.transform = 'rotate(0deg)';
				document.body.style.height = '100vh';
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.transform = '';
				document.body.style.height = '';
				document.body.style.overflow = '';
			}
		}

		window.addEventListener('orientationchange', handleOrientationChange);
		window.addEventListener('resize', handleOrientationChange);

		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		if (isIOS) {
			document.documentElement.style.setProperty('--ios-safe-area-top', 'env(safe-area-inset-top, 0px)');
			document.documentElement.style.setProperty('--ios-safe-area-bottom', 'env(safe-area-inset-bottom, 0px)');
		}

		if ('requestIdleCallback' in window) {
			requestIdleCallback(() => {
				document.body.classList.add('animations-ready');
			});
		} else {
			setTimeout(() => {
				document.body.classList.add('animations-ready');
			}, 100);
		}

		return () => {
			window.removeEventListener('orientationchange', handleOrientationChange);
			window.removeEventListener('resize', handleOrientationChange);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<meta name="theme-color" content="#1919EF" />
</svelte:head>

<div class="mobile-app" class:loaded={isLoaded}>
	<div class="mobile-container">
		<ErrorBoundary>
			{@render children?.()}
		</ErrorBoundary>
	</div>
</div>

<style>
	:global(body) {
		overscroll-behavior: none;
		-webkit-overflow-scrolling: touch;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		position: fixed;
		width: 100%;
		height: 100%;
	}

	:global(.animations-ready) {
		--animation-ready: 1;
	}

	.mobile-app {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-cumin) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		font-family: var(--font-body);
		isolation: isolate;
		contain: layout style;
	}

	.mobile-app.loaded {
		will-change: auto;
	}

	.mobile-container {
		width: 100%;
		max-width: 500px;
		height: 100vh;
		max-height: 1000px;
		background: white;
		overflow-y: auto;
		position: relative;
		border-radius: 0;
		contain: layout style paint;
		-webkit-overflow-scrolling: touch;
		scroll-behavior: smooth;
		padding-top: var(--ios-safe-area-top, 0px);
		padding-bottom: var(--ios-safe-area-bottom, 0px);
	}

	@media (prefers-reduced-motion: reduce) {
		.mobile-container {
			scroll-behavior: auto;
		}

		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			will-change: auto !important;
		}
	}

	@media (min-width: 501px) {
		.mobile-container {
			border-radius: 1.5rem;
			height: 1000px;
			box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		}
	}

	@media (max-width: 500px) {
		.mobile-app {
			padding: 0;
		}

		.mobile-container {
			border-radius: 0;
		}
	}
</style>

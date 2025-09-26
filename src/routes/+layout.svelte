<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import { currentScreen } from '$lib/stores/navigationStore';
	import { telegramStore } from '$lib/stores/telegramStore';
	import { triggerHapticFeedback } from '$lib/telegram/integration';

	let { children } = $props();
	let isLoaded = $state(false);

	onMount(() => {
		isLoaded = true;

		// Wait for Telegram WebApp SDK to load, then initialize store
		const maxRetries = 50; // 5 seconds max wait time
		let retries = 0;

		const initializeTelegram = () => {
			if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
				telegramStore.initialize();
			} else if (retries < maxRetries) {
				retries++;
				setTimeout(initializeTelegram, 100);
			}
		};

		initializeTelegram();

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

		const handleGlobalClick = () => {
			triggerHapticFeedback();
		};

		document.body.addEventListener('click', handleGlobalClick);

		return () => {
			window.removeEventListener('orientationchange', handleOrientationChange);
			window.removeEventListener('resize', handleOrientationChange);
			document.body.removeEventListener('click', handleGlobalClick);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
	<meta name="theme-color" content="#1919EF" />
</svelte:head>

<ErrorBoundary>
	<main class="app-container" class:loaded={isLoaded}>
		{#if $currentScreen !== 'bank-home'}
			<StatusBar />
		{/if}
		{@render children?.()}
	</main>
</ErrorBoundary>

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
		margin: 0;
		padding: 0;
		width: 100%;
		min-height: 100vh;
		overflow: auto;
	}

	:global(.animations-ready) {
		--animation-ready: 1;
	}

	.app-container {
		width: 100%;
		max-width: 512px;
		min-height: 100vh;
		margin: 0 auto;
		background: var(--color-surface-card);
		color: var(--color-fg-primary);
		font-family: var(--font-sans);
		display: flex;
		flex-direction: column;
		overscroll-behavior: contain;
		padding-top: var(--ios-safe-area-top, 0px);
		padding-bottom: var(--ios-safe-area-bottom, 0px);
		padding-inline: clamp(1rem, 3vw, 1.5rem);
		gap: 1rem;
	}

	.app-container.loaded {
		will-change: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.app-container {
			scroll-behavior: auto;
		}

		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			will-change: auto !important;
		}
	}

	@media (min-width: 520px) {
		.app-container {
			border-radius: var(--radius-xl);
			border: 1px solid var(--color-border-subtle);
			box-shadow: var(--shadow-medium);
			margin-block: 1.5rem;
		}
	}
</style>

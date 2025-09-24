<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import { currentScreen } from '$lib/stores/navigationStore';
	import { telegramStore } from '$lib/stores/telegramStore';

	let { children } = $props();
	let isLoaded = $state(false);

	onMount(() => {
		isLoaded = true;

		// Initialize Telegram store early to ensure user data is available
		telegramStore.initialize();

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
		{#if $currentScreen !== 'bank-home'}
			<StatusBar />
		{/if}
		<div class="main-content">
			<ErrorBoundary>
				{@render children?.()}
			</ErrorBoundary>
		</div>
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
		margin: 0;
		padding: 0;
		width: 100%;
		min-height: 100vh;
		overflow: hidden;
	}

	:global(.animations-ready) {
		--animation-ready: 1;
	}

	.mobile-app {
		min-height: 100vh;
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
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
		height: min(100vh, 1000px);
		max-height: 1000px;
		background: white;
		position: relative;
		border-radius: 0;
		contain: layout style paint;
		display: flex;
		flex-direction: column;
		padding-top: var(--ios-safe-area-top, 0px);
		padding-bottom: var(--ios-safe-area-bottom, 0px);
	}

	.main-content {
		flex: 1;
		overflow: visible;
		-webkit-overflow-scrolling: touch;
		scroll-behavior: smooth;
		position: relative;
	}

	@media (prefers-reduced-motion: reduce) {
		.main-content {
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

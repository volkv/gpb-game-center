<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		src: string;
		alt: string;
		placeholder?: string;
		class?: string;
		width?: number;
		height?: number;
		loading?: 'lazy' | 'eager';
	}

	let {
		src,
		alt,
		placeholder = '',
		class: className = '',
		width,
		height,
		loading = 'lazy',
		...restProps
	}: Props = $props();

	let imageElement = $state<HTMLDivElement | undefined>();
	let isLoaded = $state(false);
	let hasError = $state(false);
	let isIntersecting = $state(false);

	onMount(() => {
		if (loading === 'eager') {
			isIntersecting = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isIntersecting = true;
						observer.disconnect();
					}
				});
			},
			{
				rootMargin: '50px'
			}
		);

		if (imageElement) {
			observer.observe(imageElement);
		}

		return () => observer.disconnect();
	});

	function handleLoad() {
		isLoaded = true;
		hasError = false;
	}

	function handleError() {
		hasError = true;
		isLoaded = false;
	}

	let shouldLoad = $derived(isIntersecting || loading === 'eager');
</script>

<div class="lazy-image-container {className}" style="width: {width ? width + 'px' : 'auto'}; height: {height ? height + 'px' : 'auto'};" {...restProps}>
	{#if placeholder && !isLoaded && !hasError}
		<div
			class="image-placeholder"
			style="width: {width ? width + 'px' : '100%'}; height: {height ? height + 'px' : 'auto'};"
		>
			<div class="placeholder-shimmer"></div>
		</div>
	{/if}

	{#if shouldLoad}
		<img
			bind:this={imageElement}
			{src}
			{alt}
			{width}
			{height}
			class="lazy-image"
			class:loaded={isLoaded}
			class:error={hasError}
			onload={handleLoad}
			onerror={handleError}
		/>
	{:else}
		<div
			bind:this={imageElement}
			class="lazy-image-observer"
			style="width: {width ? width + 'px' : '100%'}; height: {height ? height + 'px' : '120px'};"
		></div>
	{/if}

	{#if hasError}
		<div class="error-placeholder">
			<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
					  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
			<span class="text-sm text-gray-500">Не удалось загрузить изображение</span>
		</div>
	{/if}
</div>

<style>
	.lazy-image-container {
		position: relative;
		display: inline-block;
		overflow: hidden;
	}

	.lazy-image {
		width: 100%;
		height: auto;
		opacity: 0;
	}

	.lazy-image.loaded {
		opacity: 1;
	}

	.lazy-image.error {
		display: none;
	}

	.lazy-image-observer {
		background: #f3f4f6;
		border-radius: 0.5rem;
	}

	.image-placeholder {
		position: absolute;
		inset: 0;
		background: #f3f4f6;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.placeholder-shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.4) 50%,
			transparent 100%
		);
	}

	.error-placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 0.5rem;
		gap: 0.5rem;
	}
</style>
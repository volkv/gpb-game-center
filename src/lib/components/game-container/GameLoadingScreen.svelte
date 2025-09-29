<script lang="ts">
	import type { Game } from '$lib/types/Game';
	import { LoadingSpinner } from '$lib';
	import Skeleton from '../Skeleton.svelte';

	interface Props {
		game: Game;
		loadingProgress: number;
		loadingStage: string;
		onback: () => void;
	}

	let { game, loadingProgress, loadingStage, onback }: Props = $props();
</script>

<div class="loading-screen">
	<div class="loading-content">
		<div class="game-preview">
			<div class="preview-icon" style="background: {game.gradient}">
				<div class="icon-placeholder">
					<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2L13.09 5.26L16 4L14.74 7.09L18 8L16.91 11.26L20 12L16.91 12.74L18 16L14.74 16.91L16 20L12.91 18.74L12 22L11.09 18.74L8 20L9.26 16.91L6 16L7.09 12.74L4 12L7.09 11.26L6 8L9.26 7.09L8 4L11.09 5.26L12 2Z"/>
					</svg>
				</div>
			</div>

			<div class="preview-info">
				<h2 class="font-heading text-h3 text-gpb-black mb-1">{game.name}</h2>
				<p class="font-body text-body text-gray-600">{game.shortDescription}</p>
			</div>
		</div>

		<div class="loading-indicator">
			<div class="loading-bar">
				<div class="loading-fill" style="width: {loadingProgress}%"></div>
			</div>
			<p class="loading-text font-body text-body-sm text-gray-600">{loadingStage}</p>
		</div>

		<div class="loading-skeleton">
			<div class="skeleton-header">
				<Skeleton variant="circle" width="48px" height="48px" />
				<div class="skeleton-lines">
					<Skeleton variant="line" width="85%" height="12px" />
					<Skeleton variant="line" width="60%" height="12px" />
				</div>
			</div>

			<div class="skeleton-content">
				<Skeleton variant="line" width="100%" height="12px" />
				<Skeleton variant="line" width="90%" height="12px" />
				<Skeleton variant="line" width="75%" height="12px" />
				<Skeleton variant="line" width="85%" height="12px" />
			</div>

			<div class="skeleton-buttons">
				<Skeleton variant="rectangle" width="120px" height="44px" />
				<Skeleton variant="rectangle" width="100px" height="44px" />
			</div>
		</div>

		<div class="loading-spinner-container">
			<LoadingSpinner size="md" color="violet" />
		</div>
	</div>

	<button
		class="back-button loading-back"
		onclick={onback}
		aria-label="Вернуться назад"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
	</button>
</div>

<style>
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
		position: relative;
		padding: 2rem 1rem;
	}

	.loading-content {
		max-width: 400px;
		width: 100%;
		text-align: center;
	}

	.game-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 3rem;
		animation: fadeIn 0.6s ease-out;
	}

	.preview-icon {
		width: 80px;
		height: 80px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		position: relative;
		box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.2);
	}

	.icon-placeholder {
		color: white;
		opacity: 0.9;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.preview-info h2 {
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.loading-indicator {
		margin-bottom: 3rem;
		animation: fadeIn 0.6s ease-out 0.2s both;
	}

	.loading-bar {
		width: 100%;
		height: 8px;
		background: var(--color-gpb-lily);
		border-radius: 4px;
		margin-bottom: 1rem;
		position: relative;
	}

	.loading-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-gpb-mint) 0%, var(--color-gpb-emerald) 100%);
		border-radius: 4px;
		transition: width 0.3s ease;
		position: relative;
	}

	.loading-fill::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 20px;
		height: 100%;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 100%);
		animation: shimmer 1.5s infinite;
	}

	.loading-text {
		text-align: center;
		font-weight: 500;
	}

	.loading-skeleton {
		margin-bottom: 2rem;
		animation: fadeIn 0.6s ease-out 0.4s both;
	}

	.skeleton-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.skeleton-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.loading-spinner-container {
		margin-top: 1rem;
		animation: fadeIn 0.6s ease-out 0.6s both;
	}

	.back-button {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.9);
		color: var(--color-gpb-violet);
		border: 1px solid rgba(25, 25, 239, 0.1);
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		z-index: 10;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 1);
		border-color: var(--color-gpb-violet);
		transform: translateX(-2px);
		box-shadow: 0 4px 12px rgba(25, 25, 239, 0.15);
	}

	.loading-back {
		animation: fadeInLeft 0.6s ease-out 0.8s both;
	}

	@keyframes fadeInLeft {
		0% {
			opacity: 0;
			transform: translateX(-20px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	@media (max-width: 640px) {
		.back-button {
			top: 1rem;
			left: 1rem;
			width: 40px;
			height: 40px;
		}

		.preview-icon {
			width: 64px;
			height: 64px;
		}
	}
</style>
<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
	import { Home, User, Star } from 'lucide-svelte';
	import { telegramStore, telegramUserName, isInTelegram } from '$lib/stores/telegramStore';
	import { totalPoints } from '$lib/stores/pointsStore';
	import {
		gameStatusState,
		isGameStatusVisible,
		shouldShowScore,
		shouldShowBackButton
	} from '$lib/stores/gameStatusStore';
	import { navigateToGameCenter } from '$lib/stores/navigationStore';
	import { gameStore } from '$lib/stores/gameStore';

	let mounted = false;
	let statusElement: HTMLElement;
	let resizeObserver: ResizeObserver | null = null;

	function updateStatusBarHeight() {
		if (statusElement) {
			document.documentElement.style.setProperty(
				'--global-status-bar-height', `${statusElement.offsetHeight}px`
			);
		}
	}

  onMount(async (): Promise<void> => {
    // telegramStore is initialized in layout; keep subscription warm
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    telegramStore;
    mounted = true;
    await tick();
    updateStatusBarHeight();
		if ('ResizeObserver' in window && statusElement) {
			resizeObserver = new ResizeObserver(() => updateStatusBarHeight());
			resizeObserver.observe(statusElement);
		}
	});

  onDestroy(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

	function handleHomeClick() {
		navigateToGameCenter();
	}
</script>

{#if mounted}
	<header
		class="status-bar"
		class:game-mode={$isGameStatusVisible}
		bind:this={statusElement}
	>
		<div class="status-content">
			{#if $isGameStatusVisible}
				<div class="status-side status-side--left">
					{#if $shouldShowBackButton}
						<button
							type="button"
							class="nav-button"
							onclick={handleHomeClick}
							aria-label="На главную"
						>
							<Home size={18} aria-hidden="true" />
						</button>
					{/if}
				</div>

				<div class="status-center" aria-live="polite">
					{#if $gameStatusState.gameName}
						<div class="game-info">
							{#if $gameStore.currentGame?.icon}
								<img
									src={$gameStore.currentGame.icon.url}
									alt=""
									class="game-icon-small"
									width="20"
									height="20"
								/>
							{/if}
							<div class="game-name" title={$gameStatusState.gameName}>
								{$gameStatusState.gameName}
							</div>
						</div>
					{/if}
				</div>

				{#if $shouldShowScore}
					<div class="status-side status-side--right">
						<div class="score-card" aria-label="Текущие очки">
							<div class="score-card__label">
								<Star size={16} aria-hidden="true" />
								<span>Очки</span>
							</div>
							<div class="score-card__value">{$gameStatusState.currentScore.toLocaleString()}</div>
						</div>
					</div>
				{/if}
			{:else}
				<div class="user-overview">
					<div class="user-avatar" aria-hidden="true">
						<img src="/logo_black.svg" alt="" width="20" height="20" />
					</div>
					<div class="user-meta">
						<span class="user-name">{$telegramUserName}</span>
				
					</div>
				</div>

				<div class="points-display">
					<div class="points-chip">
						<Star size={16} aria-hidden="true" />
						<span class="points-chip__value">{$totalPoints.toLocaleString()}</span>
					</div>
				</div>
			{/if}
		</div>
	</header>
{/if}

<style>

	.status-bar.game-mode {
		padding: .5rem 1.5rem;
	}

	.status-bar {
		position: relative;
		z-index: 1;

		padding-block: 0.75rem;
		background: rgba(242, 244, 249, 0.75);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.status-bar.game-mode {
		background: var(--color-surface-card);
		backdrop-filter: none;
		box-shadow: var(--shadow-soft);
		border-bottom: 1px solid var(--color-border-muted);
	}

	.game-mode .status-content {
		padding: 0;
	}

	.status-content {
		padding: 0 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.status-side {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-side--left {
		min-width: 48px;
	}

	.status-side--right {
		flex-shrink: 0;
	}

	.status-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		min-width: 0;
	}

	.game-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.game-icon-small {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		border-radius: 4px;
		object-fit: contain;
	}

	.nav-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-muted);
		background: var(--color-surface-card);
		color: var(--color-brand-600);
		transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease;
	}

	.nav-button:hover {
		background: var(--color-brand-50);
	}

	.nav-button:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.game-name {
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--color-brand-600);
		word-wrap: break-word;
		hyphens: auto;
		line-height: 1.2;
		min-width: 0;
	}

	.status-bar.game-mode .game-name {
		color: var(--color-brand-600);
	}


	.score-card {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--layer-brand-150);
		background: var(--layer-brand-050);
		color: var(--color-brand-600);
	}

	.score-card__label {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.625rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.score-card__value {
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.user-overview {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.user-avatar {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-lg);
		background: var(--color-brand-50);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border-muted);
	}

	.user-meta {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.user-name {
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 600;
		white-space: nowrap;
		color: var(--color-brand-600);
		text-overflow: ellipsis;
	}


	.points-display {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.points-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.6rem;
		border-radius: var(--radius-full);
		background: var(--layer-brand-050);
		border: 1px solid var(--layer-brand-150);
		font-size: 0.75rem;
		color: var(--color-brand-600);
	}

	.points-chip__value {
		font-family: var(--font-display);
		font-weight: 600;
	}



</style>

<script lang="ts">
  import { onMount, tick } from 'svelte';
	import { Home, User, Star } from 'lucide-svelte';
	import { telegramStore, telegramUserName, activityStats, isInTelegram } from '$lib/stores/telegramStore';
	import {
		gameStatusState,
		isGameStatusVisible,
		shouldShowScore,
		shouldShowBackButton
	} from '$lib/stores/gameStatusStore';
	import { navigateToGameCenter } from '$lib/stores/navigationStore';

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

  onMount(async () => {
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

		return () => {
			resizeObserver?.disconnect();
			resizeObserver = null;
		};
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
						<div class="game-name" title={$gameStatusState.gameName}>
							{$gameStatusState.gameName}
						</div>
					{/if}

					<div class="player-line">
						<User size={16} aria-hidden="true" />
						<span class="player-name">{$gameStatusState.playerName}</span>
					</div>
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
						<img src="/logo.svg" alt="" width="20" height="20" />
					</div>
					<div class="user-meta">
						<span class="user-name">{$telegramUserName}</span>
						{#if $isInTelegram}
							<span class="user-platform">Telegram</span>
						{/if}
					</div>
				</div>

				<div class="activity-stats" role="list">
					{#if $activityStats.sessionCount > 0}
						<div class="activity-chip" role="listitem">
							<span class="activity-chip__label">Сессия</span>
							<span class="activity-chip__value">{$activityStats.sessionCount}</span>
						</div>
					{/if}

					{#if $activityStats.totalGamesPlayed > 0}
						<div class="activity-chip" role="listitem">
							<span class="activity-chip__label">Игр</span>
							<span class="activity-chip__value">{$activityStats.totalGamesPlayed}</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</header>
{/if}

<style>
	.status-bar {
		position: sticky;
		top: 0;
		z-index: 45;
		margin-inline: calc(-1 * clamp(1rem, 3vw, 1.5rem));
		padding-inline: clamp(1rem, 3vw, 1.5rem);
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

	.status-content {
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
		gap: 0.4rem;
		text-align: center;
		min-width: 0;
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
		color: var(--color-fg-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-bar.game-mode .game-name {
		color: var(--color-fg-primary);
	}

	.player-line {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		justify-content: center;
		color: var(--color-fg-muted);
		font-size: 0.8125rem;
	}

	.player-name {
		max-width: 8rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.score-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-lg);
		border: 1px solid var(--layer-brand-150);
		background: var(--layer-brand-050);
		color: var(--color-brand-600);
	}

	.score-card__label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.score-card__value {
		font-family: var(--font-display);
		font-size: 1.1rem;
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
		color: var(--color-fg-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-platform {
		font-size: 0.75rem;
		color: var(--color-fg-muted);
	}

	.activity-stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.activity-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.25rem 0.6rem;
		border-radius: var(--radius-full);
		background: var(--color-neutral-100);
		border: 1px solid var(--color-border-subtle);
		font-size: 0.75rem;
		color: var(--color-fg-secondary);
	}

	.activity-chip__label {
		font-weight: 500;
	}

	.activity-chip__value {
		font-family: var(--font-display);
		font-weight: 600;
	}

	@media (max-width: 420px) {
		.status-bar {
			padding-block: 0.5rem;
		}

		.status-content {
			gap: 0.75rem;
		}

		.status-center {
			gap: 0.3rem;
		}

		.nav-button {
			width: 36px;
			height: 36px;
		}

		.score-card {
			padding: 0.4rem 0.6rem;
		}

		.activity-stats {
			justify-content: flex-start;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-button,
		.score-card,
		.activity-chip {
			transition: none;
		}
	}
</style>

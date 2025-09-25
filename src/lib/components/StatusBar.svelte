<script lang="ts">
	import { onMount } from 'svelte';
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

	onMount(() => {
		// telegramStore is now initialized in layout
		mounted = true;
	});

	function handleHomeClick() {
		navigateToGameCenter();
	}
</script>

{#if mounted}
	<header class="status-bar" class:game-mode={$isGameStatusVisible}>
		<div class="status-content">
			{#if $isGameStatusVisible}
				<!-- Game Mode: Navigation -->
				<div class="game-status-left">
					{#if $shouldShowBackButton}
						<button
							type="button"
							class="btn-icon touch-target hover-lift active-press focus-game neon-glow"
							onclick={handleHomeClick}
							aria-label="На главную"
						>
							<Home size={20} />
						</button>
					{/if}
				</div>

				<!-- Game Mode: Game Info -->
				<div class="game-status-center">
					{#if $gameStatusState.gameName}
						<div class="game-name-container">
							<h1 class="font-card-title game-name">{$gameStatusState.gameName}</h1>
						</div>
					{/if}

					<div class="player-info">
						<User size={16} class="user-icon neon-glow" />
						<span class="font-ui-secondary player-name">{$gameStatusState.playerName}</span>
					</div>
				</div>

				<!-- Game Mode: Score -->
				{#if $shouldShowScore}
					<div class="game-status-right">
						<div class="score-container mini-stat">
							<div class="score-header">
								<Star size={16} class="score-icon text-gpb-gold neon-glow" />
								<span class="font-ui-caption">Очки</span>
							</div>
							<div class="score-value animate-count-up font-score">
								{$gameStatusState.currentScore.toLocaleString()}
							</div>
						</div>
					</div>
				{/if}
			{:else}
				<!-- Normal Mode: User Info -->
				<div class="user-info">
					<div class="user-avatar">
						<div class="avatar-icon">
							<img src="/logo.svg" alt="Logo" width="20" height="20" />
						</div>
					</div>
					<div class="user-details">
						<span class="user-name">{$telegramUserName}</span>
						{#if $isInTelegram}
							<span class="user-platform">Telegram</span>
						{/if}
					</div>
				</div>

				<!-- Normal Mode: Activity Stats -->
				<div class="activity-stats">
					{#if $activityStats.sessionCount > 0}
						<div class="stat-item">
							<span class="stat-label">Сессия</span>
							<span class="stat-value">{$activityStats.sessionCount}</span>
						</div>
					{/if}

					{#if $activityStats.totalGamesPlayed > 0}
						<div class="stat-item">
							<span class="stat-label">Игр</span>
							<span class="stat-value">{$activityStats.totalGamesPlayed}</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Decorative elements for game mode -->
		{#if $isGameStatusVisible}
			<div class="decoration-orb bg-gpb-mint w-8 h-8 -top-2 -right-2"></div>
			<div class="decoration-orb bg-gpb-raspberry w-6 h-6 -bottom-1 -left-1"></div>
			<div class="decoration-shine"></div>
		{/if}
	</header>
{/if}

<style>
	.status-bar {

		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
		color: white;
		padding: 0.75rem 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		transition: all 300ms ease-out;
		min-height: 64px;
	}

	.status-bar.game-mode {
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		position: relative;
		overflow: hidden;
	}

	.status-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 500px;
		margin: 0 auto;
		gap: 1rem;
		position: relative;
		z-index: 10;
	}

	/* Game mode layout */
	.game-status-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.game-status-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		min-width: 0;
		gap: 0.25rem;
	}

	.game-status-right {
		flex-shrink: 0;
	}

	.game-name-container {
		width: 100%;
	}

	.game-name {
		color: white;
		font-weight: bold;
		font-size: 1.125rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		text-shadow: 0 2px 4px rgba(0,0,0,0.3);
	}

	.player-info {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.875rem;
	}


	.player-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 8rem;
	}

	.score-container {
		text-align: center;
	}

	.score-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		margin-bottom: 0.25rem;
	}

	.score-value {
		font-weight: 700;
		font-size: 0.875rem;
		line-height: 1;
		color: white;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.user-avatar {
		flex-shrink: 0;
	}

	.avatar-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.user-details {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
	}

	.user-name {
		font-family: var(--font-heading);
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: white;
	}

	.user-platform {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 400;
		line-height: 1;
		color: rgba(255, 255, 255, 0.8);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.activity-stats {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-base);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.stat-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 400;
		line-height: 1;
		color: rgba(255, 255, 255, 0.9);
		text-transform: lowercase;
	}

	.stat-value {
		font-family: var(--font-heading);
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1;
		color: white;
	}

	@media (max-width: 380px) {
		.status-bar {
			padding: 0.625rem 0.75rem;
		}

		.status-content {
			gap: 0.75rem;
		}

		.user-info {
			gap: 0.5rem;
		}

		.avatar-icon {
			width: 28px;
			height: 28px;
		}

		.user-name {
			font-size: 0.8125rem;
		}

		.user-platform {
			font-size: 0.6875rem;
		}

		.activity-stats {
			gap: 0.5rem;
		}

		.stat-item {
			padding: 0.1875rem 0.375rem;
		}

		.stat-label {
			font-size: 0.625rem;
		}

		.stat-value {
			font-size: 0.8125rem;
		}
	}

	@media (min-width: 440px) {
		.status-content {
			max-width: 440px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.status-bar {
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		.avatar-icon,
		.stat-item {
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}
	}
</style>
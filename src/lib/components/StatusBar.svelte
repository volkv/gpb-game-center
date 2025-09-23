<script lang="ts">
	import { onMount } from 'svelte';
	import { telegramStore, telegramUserName, activityStats, isInTelegram } from '$lib/stores/telegramStore';

	let mounted = false;

	onMount(() => {
		telegramStore.initialize();
		mounted = true;
	});
</script>

{#if mounted}
	<header class="status-bar">
		<div class="status-content">
			<div class="user-info">
				<div class="user-avatar">
					<div class="avatar-icon">
						{#if $isInTelegram}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z" fill="currentColor"/>
							</svg>
						{:else}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="12" cy="8" r="4" fill="currentColor"/>
								<path d="M12 14c-4.42 0-8 2.69-8 6v2h16v-2c0-3.31-3.58-6-8-6z" fill="currentColor"/>
							</svg>
						{/if}
					</div>
				</div>
				<div class="user-details">
					<span class="user-name">{$telegramUserName}</span>
					{#if $isInTelegram}
						<span class="user-platform">Telegram</span>
					{/if}
				</div>
			</div>

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
		</div>
	</header>
{/if}

<style>
	.status-bar {
		position: sticky;
		top: 0;
		z-index: 50;
		background: linear-gradient(135deg, var(--color-gpb-violet) 0%, var(--color-gpb-raspberry) 100%);
		color: white;
		padding: 0.75rem 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.status-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 500px;
		margin: 0 auto;
		gap: 1rem;
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
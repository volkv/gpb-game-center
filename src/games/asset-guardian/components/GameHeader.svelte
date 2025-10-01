<script lang="ts">
	import { Shield, Trophy, Zap } from 'lucide-svelte';
	import { Counter, Button } from '$lib';
	import type { AssetGuardianGameState } from '../types';
    import type { Writable } from 'svelte/store';

	type Props = {
		selectors: {
            currentScore: number;
            livesRemaining: number;
            currentLevel: number;
        };
		gameState: AssetGuardianGameState;
		gyroscopeStatus: string;
		isDebugLogging: boolean;
		currentLevelId: number;
		totalLevels: number;
		isLastLevel: boolean;
		onPrevLevel: () => void;
		onNextLevel: () => void;
	};

	let {
		selectors,
		gameState,
		gyroscopeStatus,
		isDebugLogging,
		currentLevelId,
		totalLevels,
		isLastLevel,
		onPrevLevel,
		onNextLevel
	}: Props = $props();
</script>

<div class="game-header p-2">
	<div class="stats-bar glass-effect rounded-2xl p-3 text-gpb-gray-900 mb-2">
		<div class="flex justify-between items-center">
			<div class="stat-item">
				<Trophy size={16} class="text-gpb-gold" />
				<div class="stat-content">
					<div class="stat-value">
						<Counter
							value={selectors.currentScore}
							target={selectors.currentScore}
							duration={500}
							animated={true}
						/>
					</div>
					<div class="stat-label">Очки</div>
				</div>
			</div>

			<div class="stat-item">
				<Shield size={16} class="text-gpb-emerald" />
				<div class="stat-content">
					<div class="stat-value">{selectors.livesRemaining}</div>
					<div class="stat-label">Жизни</div>
				</div>
			</div>

			<div class="stat-item">
				<Zap
					size={16}
					class={gyroscopeStatus === 'active'
						? 'text-gpb-emerald'
						: gyroscopeStatus === 'fallback'
							? 'text-gpb-amber'
							: gyroscopeStatus === 'ready'
								? 'text-gpb-blue'
								: 'text-gpb-gray-400'}
				/>
				<div class="stat-content">
					<div class="stat-value text-xs">
						{gyroscopeStatus === 'active'
							? isDebugLogging
								? '📝 ЛОГ'
								: 'ГИРО'
							: gyroscopeStatus === 'fallback'
								? 'TOUCH'
								: gyroscopeStatus === 'ready'
									? 'ГОТОВ'
									: gyroscopeStatus === 'initializing'
										? '...'
										: 'OFF'}
					</div>
					<div class="stat-label">Управление</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Level Info -->
	<div class="level-info glass-effect rounded-2xl p-3 text-gpb-gray-900 mb-2">
		<h3 class="font-card-title mb-1 flex items-center gap-2">
			<Zap size={16} class="text-gpb-mint" />
			Уровень {selectors.currentLevel}: {gameState.currentLevel?.name}
		</h3>
		<p class="text-sm text-gpb-gray-600 mb-2">
			{gameState.currentLevel?.bankingTheme.lesson}
		</p>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4 text-xs text-gpb-gray-500">
				<span>Сложность: {gameState.currentLevel?.difficulty}</span>
				<span>Цель: {gameState.currentLevel?.targetScore} очков</span>
			</div>
			<div class="flex items-center gap-2">
				<Button
					variant="secondary"
					size="sm"
					disabled={currentLevelId <= 1}
					onclick={onPrevLevel}
					class="px-2 py-1 text-xs"
				>
					← Назад
				</Button>
				<div class="text-xs text-gpb-gray-500 px-2">
					{currentLevelId}/{totalLevels}
				</div>
				<Button
					variant="secondary"
					size="sm"
					disabled={isLastLevel}
					onclick={onNextLevel}
					class="px-2 py-1 text-xs"
				>
					Вперед →
				</Button>
			</div>
		</div>
	</div>
</div>

<style>
	.game-header {
		flex-shrink: 0;
	}

	.stats-bar {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.level-info {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.stat-content {
		text-align: left;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-gpb-gray-900);
		line-height: 1;
		margin-bottom: 0.125rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-gpb-gray-600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	@media (max-width: 380px) {
		.game-header {
			padding: 0.375rem;
		}

		.stats-bar {
			padding: 0.5rem;
			margin-bottom: 0.375rem;
		}

		.level-info {
			padding: 0.5rem;
			margin-bottom: 0.375rem;
		}

		.stat-item {
			gap: 0.25rem;
		}

		.stat-value {
			font-size: 0.875rem;
			margin-bottom: 0.0625rem;
		}

		.stat-label {
			font-size: 0.625rem;
		}
	}
</style>
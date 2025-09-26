<script lang="ts">
	import { onMount } from 'svelte';
	import { Coins, Gem, Award, Zap, Clock, Trophy } from 'lucide-svelte';
	import { Button, Counter, Badge, GameLayout } from '$lib';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let mounted = $state(false);
	let score = $state(1250);
	let moves = $state(15);
	let timeLeft = $state(180);

	const gameBoard = [
		['coin', 'gold', 'diamond', 'coin', 'diamond', 'gold', 'coin', 'diamond'],
		['gold', 'diamond', 'coin', 'gold', 'coin', 'diamond', 'gold', 'coin'],
		['diamond', 'coin', 'gold', 'diamond', 'gold', 'coin', 'diamond', 'gold'],
		['coin', 'gold', 'diamond', 'coin', 'diamond', 'gold', 'coin', 'diamond'],
		['gold', 'diamond', 'coin', 'gold', 'coin', 'diamond', 'gold', 'coin'],
		['diamond', 'coin', 'gold', 'diamond', 'gold', 'coin', 'diamond', 'gold'],
		['coin', 'gold', 'diamond', 'coin', 'diamond', 'gold', 'coin', 'diamond'],
		['gold', 'diamond', 'coin', 'gold', 'coin', 'diamond', 'gold', 'coin']
	];

	const iconMap: Record<string, typeof Coins> = {
		coin: Coins,
		gold: Award,
		diamond: Gem
	};

	onMount(() => {
		mounted = true;
	});

	function handleCellClick(row: number, col: number) {
		// Статический клик без анимации
	}

	function formatTime(seconds: number) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<GameLayout gameName="Золотой Резерв" background="gradient-wealth" showScore={true}>
	<div class="match3-container">
		<!-- Game Header -->
		<div class="game-header p-4">
			<div class="stats-bar glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
				<div class="flex justify-between items-center">
					<div class="stat-item">
						<Coins size={20} class="text-gpb-gold" />
						<div class="stat-content">
							<div class="stat-value">
								<Counter value={score} />
							</div>
							<div class="stat-label">Очки</div>
						</div>
					</div>

					<div class="stat-item">
						<Zap size={20} class="text-gpb-violet" />
						<div class="stat-content">
							<div class="stat-value">{moves}</div>
							<div class="stat-label">Ходы</div>
						</div>
					</div>

					<div class="stat-item">
						<Clock size={20} class="text-gpb-raspberry" />
						<div class="stat-content">
							<div class="stat-value">{formatTime(timeLeft)}</div>
							<div class="stat-label">Время</div>
						</div>
					</div>
				</div>
			</div>

			<div class="objectives glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
				<h3 class="font-card-title mb-3 flex items-center gap-2">
					<Trophy size={20} class="text-gpb-emerald" />
					Цели уровня
				</h3>
				<div class="flex justify-around">
					<div class="objective-item">
						<Coins size={24} class="text-gpb-gold mb-2" />
						<div class="objective-count">12/25</div>
						<div class="objective-label">Монеты</div>
					</div>
					<div class="objective-item">
						<Award size={24} class="text-gpb-orange mb-2" />
						<div class="objective-count">8/15</div>
						<div class="objective-label">Золото</div>
					</div>
					<div class="objective-item">
						<Gem size={24} class="text-gpb-mint mb-2" />
						<div class="objective-count">5/10</div>
						<div class="objective-label">Алмазы</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Game Board -->
		<div class="game-board-wrapper">
			<div class="game-board">
				{#each gameBoard as row, rowIndex}
					{#each row as cell, colIndex}
						{@const IconComponent = iconMap[cell]}
						<div
							class="game-cell"
							onclick={() => handleCellClick(rowIndex, colIndex)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleCellClick(rowIndex, colIndex);
								}
							}}
							role="button"
							tabindex={0}
							aria-label={`Game cell at row ${rowIndex + 1}, column ${colIndex + 1}`}
						>
							{#if IconComponent}
								<IconComponent
									size={24}
									class="cell-icon {cell === 'coin' ? 'text-gpb-gold' :
										  cell === 'gold' ? 'text-gpb-orange' :
										  'text-gpb-mint'}"
								/>
							{/if}
						</div>
					{/each}
				{/each}
			</div>
		</div>

		<!-- Game Controls -->
		<div class="game-controls p-4">
			<div class="flex gap-3 justify-center">
				<Button
					variant="secondary"
					size="md"
					onclick={onexit}
					class="btn-game-secondary"
				>
					Выйти
				</Button>
				<Button
					variant="primary"
					size="md"
					class="btn-game-primary"
				>
					<Zap size={18} class="mr-2" />
					Перемешать
				</Button>
			</div>

			<div class="demo-hint glass-effect rounded-xl p-4 mt-4 text-center text-gpb-gray-700">
				<p class="text-sm">
					<strong>Демо-версия:</strong> Соединяйте 3 или более одинаковых символа в ряд для получения очков и выполнения целей уровня.
				</p>
			</div>
		</div>
	</div>
</GameLayout>

<style>
	.match3-container {
		min-height: calc(100vh - 80px);
		display: flex;
		flex-direction: column;
	}

	.game-header {
		flex-shrink: 0;
	}

	.stats-bar {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-content {
		text-align: left;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-gpb-gray-900);
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-gpb-gray-600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.objectives {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.objective-item {
		text-align: center;
		flex: 1;
	}

	.objective-count {
		font-weight: 700;
		color: var(--color-gpb-gray-900);
		margin-bottom: 0.25rem;
	}

	.objective-label {
		font-size: 0.75rem;
		color: var(--color-gpb-gray-600);
	}

	.game-board-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.game-board {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(8, 1fr);
		gap: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 0.75rem;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		width: 100%;
		max-width: 320px;
		aspect-ratio: 1;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.game-cell {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		position: relative;
		aspect-ratio: 1;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.game-cell:active {
		transform: scale(0.95);
	}


	.game-controls {
		flex-shrink: 0;
	}

	.demo-hint {
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	@media (max-width: 480px) {
		.game-board {
			max-width: 280px;
			gap: 3px;
			padding: 0.5rem;
		}

		.stats-bar {
			padding: 1rem;
		}

		.stat-item {
			flex-direction: column;
			gap: 0.25rem;
			text-align: center;
		}

		.stat-value {
			font-size: 1rem;
		}
	}
</style>
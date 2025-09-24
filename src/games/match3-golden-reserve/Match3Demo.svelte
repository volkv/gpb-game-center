<script lang="ts">
	import { onMount } from 'svelte';
	import { Coins, Gem, Award, Zap, Clock, Trophy } from 'lucide-svelte';
	import { Button, Counter, Badge, GameLayout } from '$lib';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let mounted = $state(false);
	let showAnimation = $state(false);
	let score = $state(1250);
	let moves = $state(15);
	let timeLeft = $state(180);
	let showMatchEffect = $state(false);
	let showRipple = $state(false);
	let ripplePosition = $state({ x: 0, y: 0 });

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
		setTimeout(() => {
			startDemoAnimation();
		}, 2000);
	});

	function startDemoAnimation() {
		showAnimation = true;
		showMatchEffect = true;
		setTimeout(() => {
			score += 300;
			moves -= 1;
			showMatchEffect = false;
		}, 1500);
	}

	function handleCellClick(event: MouseEvent, rowIndex: number, colIndex: number) {
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		ripplePosition = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		showRipple = true;
		setTimeout(() => {
			showRipple = false;
		}, 600);
	}
</script>

<GameLayout gameName="Золотой Запас" background="gradient-power" showScore={true}>

	<div class="match3-content" class:mounted>
		<div class="flex justify-between gap-3 mb-6">
			<Counter
				value={score}
				target={score}
				variant="mini-stat"
				label="Очки"
				class="text-white"
			/>
			<div class="mini-stat">
				<div class="mini-stat-value text-white">{moves}</div>
				<div class="mini-stat-label text-white/80">Ходы</div>
			</div>
			<div class="mini-stat">
				<div class="flex items-center gap-1 mb-1">
					<Clock size={16} class="text-white/80" />
				</div>
				<div class="mini-stat-value text-white">
					{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
				</div>
				<div class="mini-stat-label text-white/80">Время</div>
			</div>
		</div>

		<div class="game-board glass-effect rounded-2xl p-2 mb-6">
			{#each gameBoard as row, rowIndex}
				{#each row as cell, colIndex}
					<button
						class="game-cell hover-lift active-press focus-game relative overflow-hidden"
						class:animate-match={showAnimation && rowIndex === 2 && (colIndex === 2 || colIndex === 3 || colIndex === 4)}
						class:pulse-border={showAnimation && rowIndex === 2 && (colIndex === 2 || colIndex === 3 || colIndex === 4)}
						style="--animation-delay: {(rowIndex * 8 + colIndex) * 50}ms"
						onclick={(e) => handleCellClick(e, rowIndex, colIndex)}
					>
						<div class="cell-icon neon-glow text-gpb-gold">
							{#if iconMap[cell]}
								{@const IconComponent = iconMap[cell]}
								<IconComponent size={20} />
							{/if}
						</div>
						<div class="cell-glow"></div>
						{#if showRipple}
							<div class="ripple" style="left: {ripplePosition.x}px; top: {ripplePosition.y}px;"></div>
						{/if}
					</button>
				{/each}
			{/each}
		</div>

		<div class="game-ui">
			<div class="flex justify-center gap-4 mb-6">
				<div class="power-up game-card gradient-wealth text-white hover-lift cursor-pointer">
					<div class="game-card-content text-center py-2">
						<Zap size={24} class="neon-glow mb-2" />
						<Badge variant="new" class="text-xs">3</Badge>
					</div>
				</div>
				<div class="power-up game-card gradient-mystery text-white hover-lift cursor-pointer">
					<div class="game-card-content text-center py-2">
						<Trophy size={24} class="neon-glow mb-2" />
						<Badge variant="hot" class="text-xs">2</Badge>
					</div>
				</div>
				<div class="power-up game-card gradient-electric text-white hover-lift cursor-pointer">
					<div class="game-card-content text-center py-2">
						<Gem size={24} class="neon-glow mb-2" />
						<Badge variant="pro" class="text-xs">1</Badge>
					</div>
				</div>
			</div>

			<div class="text-center mb-6">
				<Button variant="primary" size="lg" disabled class="btn-game-primary mb-3">
					<Zap size={20} class="mr-2" />
					Играть
				</Button>
				<p class="text-white/80 font-ui-secondary">
					Демо-версия. Полная игра скоро!
				</p>
			</div>
		</div>

		<div class="game-card glass-effect text-white mb-6">
			<div class="game-card-content">
				<div class="flex items-center gap-2 mb-3">
					<Gem size={20} class="text-gpb-gold neon-glow" />
					<h3 class="font-card-title">Совет эксперта</h3>
				</div>
				<p class="font-ui-secondary opacity-90">
					Как и в игре, создавайте сбалансированный инвестиционный портфель из разных активов
				</p>
			</div>
			<div class="decoration-shine"></div>
		</div>
	</div>

	{#if showMatchEffect}
		<div class="match-effect">
			<div class="match-particles">
				{#each Array(8) as _, i}
					<div class="particle particle-{(i % 3) + 1}" style="--particle-delay: {i * 100}ms"></div>
				{/each}
			</div>
			<div class="score-popup font-score text-gpb-gold neon-glow">+300</div>
		</div>
	{/if}

	<!-- Shimmer Effects -->
	<div class="shimmer-overlay">
		{#each Array(3) as _, i}
			<div class="shimmer-line" style="--shimmer-delay: {i * 0.5}s;"></div>
		{/each}
	</div>

</GameLayout>

<style>
	.match3-content {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
	}

	.match3-content.mounted {
		opacity: 1;
		transform: translateY(0);
	}


	.game-board {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 3px;
		position: relative;
	}

	.game-cell {
		aspect-ratio: 1;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		cursor: pointer;
		transition: all 0.3s ease;
		animation: cellAppear 0.5s ease-out;
		animation-delay: var(--animation-delay);
		animation-fill-mode: both;
		border: none;
	}

	.game-cell:hover {
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.cell-icon {
		z-index: 2;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.cell-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle, var(--color-gpb-gold) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: 8px;
	}

	.game-cell:hover .cell-glow {
		opacity: 0.4;
	}

	.animate-match {
		animation: matchAnimation 1.5s ease-in-out;
		z-index: 10;
	}

	.ripple {
		position: absolute;
		pointer-events: none;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.6);
		animation: rippleEffect 0.6s ease-out;
		transform: translate(-50%, -50%);
	}

	.game-ui {
		margin-bottom: 1.5rem;
	}

	.power-up {
		min-width: 80px;
		transition: all 0.3s ease;
	}



	.match-effect {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: 100;
	}

	.match-particles {
		position: relative;
		width: 80px;
		height: 80px;
	}

	.particle {
		position: absolute;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		animation: particleExplode 1.5s ease-out;
		animation-delay: var(--particle-delay);
		animation-fill-mode: both;
	}

	.particle-1 { background: var(--color-gpb-gold); }
	.particle-2 { background: var(--color-gpb-mint); }
	.particle-3 { background: var(--color-gpb-raspberry); }

	.score-popup {
		position: absolute;
		top: -40px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 2rem;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
		animation: scorePopup 1.5s ease-out;
		z-index: 100;
	}

	.shimmer-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 1;
	}

	.shimmer-line {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
		animation: shimmerMove 3s ease-in-out infinite;
		animation-delay: var(--shimmer-delay);
	}


	@keyframes cellAppear {
		0% {
			opacity: 0;
			transform: scale(0.3) rotate(45deg);
		}
		70% {
			transform: scale(1.1) rotate(-5deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
	}

	@keyframes rippleEffect {
		0% {
			width: 0;
			height: 0;
			opacity: 0.8;
		}
		100% {
			width: 60px;
			height: 60px;
			opacity: 0;
		}
	}

	@keyframes shimmerMove {
		0% {
			left: -100%;
			top: 20%;
		}
		50% {
			left: 100%;
			top: 60%;
		}
		100% {
			left: 200%;
			top: 80%;
		}
	}

	@keyframes matchAnimation {
		0% {
			transform: scale(1);
			background: rgba(255, 255, 255, 0.9);
		}
		30% {
			transform: scale(1.3);
			background: var(--color-gpb-gold);
			box-shadow: 0 0 20px var(--color-gpb-gold);
		}
		60% {
			transform: scale(1.5);
			background: var(--color-gpb-mint);
			box-shadow: 0 0 30px var(--color-gpb-mint);
		}
		100% {
			transform: scale(0);
			opacity: 0;
		}
	}

	@keyframes particleExplode {
		0% {
			opacity: 1;
			transform: translate(0, 0) scale(1);
		}
		50% {
			opacity: 0.8;
			transform: translate(
				calc(var(--particle-delay) * 0.2px - 30px),
				calc(var(--particle-delay) * 0.15px - 20px)
			) scale(1.2);
		}
		100% {
			opacity: 0;
			transform: translate(
				calc(var(--particle-delay) * 0.4px - 80px),
				calc(var(--particle-delay) * 0.3px - 60px)
			) scale(0);
		}
	}

	@keyframes scorePopup {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(20px) scale(0.5);
		}
		30% {
			opacity: 1;
			transform: translateX(-50%) translateY(0) scale(1.2);
		}
		70% {
			opacity: 1;
			transform: translateX(-50%) translateY(-10px) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateX(-50%) translateY(-30px) scale(0.8);
		}
	}

	@media (max-width: 380px) {
		.game-board {
			gap: 2px;
		}

		.game-cell {
			border-radius: 6px;
		}

		.cell-icon {
			transform: scale(0.9);
		}

		.power-up {
			min-width: 70px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.game-cell, .particle, .shimmer-line, .match-effect {
			animation: none !important;
			transition: none !important;
		}

		.game-content {
			opacity: 1;
			transform: none;
		}
	}
</style>
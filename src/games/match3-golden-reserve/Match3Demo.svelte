<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Button } from '$lib';

	const dispatch = createEventDispatcher<{
		exit: void;
	}>();

	let mounted = false;
	let showAnimation = false;
	let score = 1250;
	let moves = 15;
	let timeLeft = 180;

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

	const iconMap = {
		coin: '🪙',
		gold: '🥇',
		diamond: '💎'
	};

	onMount(() => {
		mounted = true;
		setTimeout(() => {
			startDemoAnimation();
		}, 2000);
	});

	function startDemoAnimation() {
		showAnimation = true;
		setTimeout(() => {
			score += 300;
			moves -= 1;
		}, 1500);
	}

	function handleExit() {
		dispatch('exit');
	}
</script>

<div class="match3-game">
	<header class="game-header">
		<button
			class="back-button"
			on:click={handleExit}
			aria-label="Вернуться в игровой центр"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="game-title">
			<h1 class="font-heading text-h4 text-gpb-black">Золотой Запас</h1>
			<p class="font-body text-body-sm text-gray-600">Головоломка три в ряд</p>
		</div>
	</header>

	<div class="game-container" class:mounted>
		<div class="game-stats">
			<div class="stat-item">
				<span class="stat-label">Очки</span>
				<span class="stat-value score-value">{score.toLocaleString()}</span>
			</div>
			<div class="stat-item">
				<span class="stat-label">Ходы</span>
				<span class="stat-value">{moves}</span>
			</div>
			<div class="stat-item">
				<span class="stat-label">Время</span>
				<span class="stat-value">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
			</div>
		</div>

		<div class="game-board">
			{#each gameBoard as row, rowIndex}
				{#each row as cell, colIndex}
					<div
						class="game-cell"
						class:animate-match={showAnimation && rowIndex === 2 && (colIndex === 2 || colIndex === 3 || colIndex === 4)}
						style="--animation-delay: {(rowIndex * 8 + colIndex) * 50}ms"
					>
						<span class="cell-icon">
							{iconMap[cell]}
						</span>
						<div class="cell-glow"></div>
					</div>
				{/each}
			{/each}
		</div>

		<div class="game-ui">
			<div class="power-ups">
				<div class="power-up">
					<span class="power-up-icon">⚡</span>
					<span class="power-up-count">3</span>
				</div>
				<div class="power-up">
					<span class="power-up-icon">💥</span>
					<span class="power-up-count">2</span>
				</div>
				<div class="power-up">
					<span class="power-up-icon">🌟</span>
					<span class="power-up-count">1</span>
				</div>
			</div>

			<div class="action-buttons">
				<Button variant="primary" size="lg" disabled class="play-button">
					Играть
				</Button>
				<p class="demo-text font-body text-body-sm text-gray-600">
					Демо-версия. Полная игра скоро!
				</p>
			</div>
		</div>

		<div class="product-hint">
			<div class="hint-content">
				<h3 class="font-heading text-base font-semibold text-gpb-black mb-2">
					💡 Совет эксперта
				</h3>
				<p class="font-body text-body-sm text-gray-700">
					Как и в игре, создавайте сбалансированный инвестиционный портфель из разных активов
				</p>
			</div>
		</div>
	</div>

	{#if showAnimation}
		<div class="match-effect">
			<div class="match-particles">
				{#each Array(6) as _, i}
					<div class="particle" style="--particle-delay: {i * 100}ms"></div>
				{/each}
			</div>
			<div class="score-popup">+300</div>
		</div>
	{/if}
</div>

<style>
	.match3-game {
		min-height: 100vh;
		background: linear-gradient(135deg,
			var(--color-gpb-raspberry) 0%,
			var(--color-gpb-violet) 50%,
			var(--color-gpb-cumin) 100%);
		padding: 1rem;
		position: relative;
		overflow: hidden;
	}

	.match3-game::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		animation: sparkle 8s linear infinite;
	}

	.game-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 2;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateX(-2px);
	}

	.game-title h1,
	.game-title p {
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.game-container {
		max-width: 420px;
		margin: 0 auto;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
		position: relative;
		z-index: 2;
	}

	.game-container.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.game-stats {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat-item {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 0.75rem;
		text-align: center;
		flex: 1;
	}

	.stat-label {
		display: block;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.25rem;
	}

	.stat-value {
		display: block;
		font-family: var(--font-heading);
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.score-value {
		color: var(--color-gpb-mint);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.game-board {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 2px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		padding: 8px;
		margin-bottom: 1.5rem;
		backdrop-filter: blur(10px);
	}

	.game-cell {
		aspect-ratio: 1;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		cursor: pointer;
		transition: all 0.2s ease;
		animation: cellAppear 0.4s ease-out;
		animation-delay: var(--animation-delay);
		animation-fill-mode: both;
		overflow: hidden;
	}

	.game-cell:hover {
		transform: scale(1.05);
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.cell-icon {
		font-size: 1.25rem;
		z-index: 2;
		position: relative;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
	}

	.cell-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle, var(--color-gpb-mint) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.game-cell:hover .cell-glow {
		opacity: 0.3;
	}

	.animate-match {
		animation: matchAnimation 1.5s ease-in-out;
		z-index: 10;
	}

	.game-ui {
		margin-bottom: 1.5rem;
	}

	.power-ups {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.power-up {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.power-up:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
	}

	.power-up-icon {
		font-size: 1.5rem;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	.power-up-count {
		font-family: var(--font-heading);
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.action-buttons {
		text-align: center;
	}

	.demo-text {
		color: rgba(255, 255, 255, 0.8);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.product-hint {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1rem;
	}

	.hint-content h3 {
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.hint-content p {
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
		width: 8px;
		height: 8px;
		background: var(--color-gpb-mint);
		border-radius: 50%;
		animation: particleExplode 1.5s ease-out;
		animation-delay: var(--particle-delay);
		animation-fill-mode: both;
	}

	.score-popup {
		position: absolute;
		top: -40px;
		left: 50%;
		transform: translateX(-50%);
		color: var(--color-gpb-mint);
		font-family: var(--font-heading);
		font-size: 2rem;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
		animation: scorePopup 1.5s ease-out;
	}

	@keyframes sparkle {
		0%, 100% { transform: translate(0, 0) rotate(0deg); }
		25% { transform: translate(10px, -10px) rotate(90deg); }
		50% { transform: translate(-5px, 5px) rotate(180deg); }
		75% { transform: translate(-10px, -5px) rotate(270deg); }
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

	@keyframes matchAnimation {
		0% {
			transform: scale(1);
			background: rgba(255, 255, 255, 0.9);
		}
		30% {
			transform: scale(1.2);
			background: var(--color-gpb-mint);
			box-shadow: 0 0 20px var(--color-gpb-mint);
		}
		60% {
			transform: scale(1.4);
			background: var(--color-gpb-melissa);
			box-shadow: 0 0 30px var(--color-gpb-melissa);
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
		100% {
			opacity: 0;
			transform: translate(
				calc(var(--particle-delay) * 0.3px - 60px),
				calc(var(--particle-delay) * 0.2px - 40px)
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
		.game-stats {
			gap: 0.5rem;
		}

		.stat-item {
			padding: 0.5rem;
		}

		.stat-value {
			font-size: 1rem;
		}

		.cell-icon {
			font-size: 1rem;
		}
	}
</style>
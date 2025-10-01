<script lang="ts">
	import { Coins, Zap, Trophy } from 'lucide-svelte';
	import { Counter } from '$lib';

	interface Props {
		score: number;
		moves: number;
		targetScore: number;
	}

	let { score, moves, targetScore }: Props = $props();
</script>

<div class="stats-bar glass-effect rounded-2xl p-4 text-gpb-gray-900 mb-4">
	<div class="flex justify-between items-center">
		<div class="stat-item">
			<Coins size={20} class="text-gpb-gold" />
			<div class="stat-content">
				<div class="stat-value animated-score">
					<Counter value={score} target={score} duration={800} animated={true} />
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
			<Trophy size={20} class="text-gpb-emerald" />
			<div class="stat-content">
				<div class="stat-value">{targetScore}</div>
				<div class="stat-label">Цель</div>
			</div>
		</div>
	</div>
</div>

<style>
	.stats-bar {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.4);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5);
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
		transition: all 0.3s ease;
	}

	.animated-score {
		position: relative;
	}

	.animated-score::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg,
			transparent 0%,
			rgba(31, 196, 217, 0.3) 50%,
			transparent 100%);
		opacity: 0;
		animation: score-flash 0.6s ease-out;
		pointer-events: none;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-gpb-gray-600);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@keyframes score-flash {
		0% {
			opacity: 0;
			transform: translateX(-100%);
		}
		50% {
			opacity: 1;
			transform: translateX(0%);
		}
		100% {
			opacity: 0;
			transform: translateX(100%);
		}
	}
</style>

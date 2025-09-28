<script lang="ts">
	import { Trophy, Clock, Star, Target, Zap, RotateCcw } from 'lucide-svelte';
	import { Button, Modal, Counter } from '$lib';
	import type { GameStatus } from './types';

	interface Props {
		open?: boolean;
		score: number;
		targetScore: number;
		movesUsed: number;
		initialMoves: number;
		status: GameStatus;
		isDemoMode?: boolean;
		onRestart?: () => void;
		onExit?: () => void;
	}

	let {
		open = false,
		score,
		targetScore,
		movesUsed,
		initialMoves,
		status,
		isDemoMode = false,
		onRestart,
		onExit
	}: Props = $props();

	const isWin = score >= targetScore;
	const efficiency = Math.round((score / (movesUsed || 1)) * 10) / 10;
	const progressPercent = Math.min(100, (score / targetScore) * 100);

	const getScoreRating = () => {
		if (score >= targetScore * 1.5) return { stars: 3, text: 'Превосходно!' };
		if (score >= targetScore * 1.2) return { stars: 2, text: 'Отлично!' };
		if (score >= targetScore) return { stars: 1, text: 'Хорошо!' };
		return { stars: 0, text: 'Попробуйте еще раз!' };
	};

	const rating = getScoreRating();
</script>

<Modal
	open={open}
	size="md"
	showClose={false}
	closeOnBackdrop={false}
	closeOnEscape={false}
	success={isWin}
>
	{#snippet children()}
		<div class="game-over-content">
			<!-- Header -->
			<div class="result-header">
				<div class="result-icon {isWin ? 'win' : 'lose'}">
					{#if isWin}
						<Trophy size={48} />
					{:else}
						<Target size={48} />
					{/if}
				</div>
				<h2 class="result-title">
					{isWin ? 'Победа!' : 'Игра окончена'}
				</h2>
				<p class="result-subtitle">
					{rating.text}
				</p>
			</div>

			<!-- Stars Rating -->
			{#if isWin}
				<div class="stars-rating">
					{#each Array(3) as _, i}
						<Star
							size={24}
							class="star {i < rating.stars ? 'filled' : 'empty'}"
							fill={i < rating.stars ? 'currentColor' : 'none'}
						/>
					{/each}
				</div>
			{/if}

			<!-- Progress Bar -->
			<div class="progress-section">
				<div class="progress-header">
					<span class="progress-label">Прогресс к цели</span>
					<span class="progress-value">{progressPercent.toFixed(0)}%</span>
				</div>
				<div class="progress-bar">
					<div
						class="progress-fill {isWin ? 'win' : 'lose'}"
						style="width: {Math.min(100, progressPercent)}%"
					></div>
				</div>
			</div>

			<!-- Stats Grid -->
			<div class="stats-grid">
				<div class="stat-item">
					<div class="stat-icon">
						<Trophy size={20} class="text-gpb-gold" />
					</div>
					<div class="stat-content">
						<div class="stat-value">
							<Counter value={score} />
						</div>
						<div class="stat-label">Очки</div>
					</div>
				</div>

				<div class="stat-item">
					<div class="stat-icon">
						<Target size={20} class="text-gpb-emerald" />
					</div>
					<div class="stat-content">
						<div class="stat-value">{targetScore}</div>
						<div class="stat-label">Цель</div>
					</div>
				</div>

				<div class="stat-item">
					<div class="stat-icon">
						<Zap size={20} class="text-gpb-violet" />
					</div>
					<div class="stat-content">
						<div class="stat-value">{movesUsed}/{initialMoves}</div>
						<div class="stat-label">Ходы</div>
					</div>
				</div>

				<div class="stat-item">
					<div class="stat-icon">
						<Star size={20} class="text-gpb-blue" />
					</div>
					<div class="stat-content">
						<div class="stat-value">{efficiency}</div>
						<div class="stat-label">Очков/ход</div>
					</div>
				</div>
			</div>

			{#if isWin}
				<!-- Success Message -->
				<div class="success-message">
					<div class="success-icon">
						<Zap size={24} class="text-gpb-mint" />
					</div>
					<div class="success-text">
						{#if isDemoMode}
							<h3>Великолепно!</h3>
							<p>Программа "Газпромбанк Бонус" помогает решать задачи так же эффективно. Используйте бонусы для достижения ваших финансовых целей!</p>
						{:else}
							<h3>Газпромбанк Бонус помогает!</h3>
							<p>Так же, как бустер в игре, программа лояльности Газпромбанка помогает быстрее достигать финансовых целей.</p>
						{/if}
					</div>
				</div>

				{#if isDemoMode}
					<!-- Demo Mode Educational Content -->
					<div class="demo-educational-content">
						<div class="educational-card">
							<div class="card-header">
								<div class="card-icon">
									<Trophy size={20} class="text-gpb-gold" />
								</div>
								<h4>Программа "Газпромбанк Бонус"</h4>
							</div>
							<div class="card-content">
								<p>Получайте бонусы за каждую покупку и используйте их для достижения финансовых целей — как в игре!</p>
								<ul>
									<li>Накапливайте бонусы за покупки</li>
									<li>Применяйте их в нужный момент</li>
									<li>Достигайте целей быстрее</li>
								</ul>
							</div>
							<div class="card-action">
								<Button
									variant="secondary"
									size="sm"
									disabled={true}
									class="learn-more-btn"
								>
									Узнать больше о программе
								</Button>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/snippet}

	{#snippet footer()}
		<div class="modal-actions">
			<Button
				variant="secondary"
				size="md"
				onclick={onExit}
				class="flex-1"
			>
				Выйти
			</Button>
			<Button
				variant="primary"
				size="md"
				onclick={onRestart}
				class="flex-1"
			>
				<RotateCcw size={18} class="mr-2" />
				{isWin ? 'Играть еще' : 'Попробовать снова'}
			</Button>
		</div>
	{/snippet}
</Modal>

<style>
	.game-over-content {
		text-align: center;
		padding: 1rem 0;
	}

	.result-header {
		margin-bottom: 2rem;
	}

	.result-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1.5rem;
		color: white;
		animation: bounce-in 0.6s ease-out;
	}

	.result-icon.win {
		background: linear-gradient(135deg, var(--color-gpb-mint), var(--color-gpb-blue));
		box-shadow: 0 8px 32px rgba(31, 196, 217, 0.3);
	}

	.result-icon.lose {
		background: linear-gradient(135deg, var(--color-gpb-gray-400), var(--color-gpb-gray-600));
		box-shadow: 0 8px 32px rgba(107, 114, 128, 0.2);
	}

	.result-title {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-fg-primary);
		margin: 0 0 0.5rem;
		letter-spacing: -0.02em;
	}

	.result-subtitle {
		font-size: 1.125rem;
		color: var(--color-fg-secondary);
		margin: 0;
	}

	.stars-rating {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
		animation: stars-appear 0.8s ease-out 0.3s both;
	}


	.progress-section {
		margin-bottom: 2rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.progress-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-fg-secondary);
	}

	.progress-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-fg-primary);
	}

	.progress-bar {
		width: 100%;
		height: 12px;
		background: var(--color-neutral-200);
		border-radius: 6px;
		overflow: hidden;
		position: relative;
	}

	.progress-fill {
		height: 100%;
		border-radius: 6px;
		transition: width 1s ease-out 0.5s;
		position: relative;
	}

	.progress-fill.win {
		background: linear-gradient(90deg, var(--color-gpb-mint), var(--color-gpb-blue));
	}

	.progress-fill.lose {
		background: linear-gradient(90deg, var(--color-gpb-gray-400), var(--color-gpb-gray-500));
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-item {
		background: var(--color-neutral-50);
		border-radius: var(--radius-lg);
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border: 1px solid var(--color-border-subtle);
		animation: stat-slide-in 0.5s ease-out;
	}

	.stat-icon {
		width: 40px;
		height: 40px;
		background: white;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.stat-content {
		flex: 1;
		text-align: left;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-fg-primary);
		line-height: 1;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.success-message {
		background: linear-gradient(135deg,
			rgba(31, 196, 217, 0.1),
			rgba(0, 107, 165, 0.1)
		);
		border: 1px solid rgba(31, 196, 217, 0.2);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		margin-bottom: 1rem;
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		text-align: left;
	}

	.success-icon {
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, var(--color-gpb-mint), var(--color-gpb-blue));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.success-text h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		margin: 0 0 0.5rem;
	}

	.success-text p {
		font-size: 0.875rem;
		color: var(--color-fg-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.demo-educational-content {
		margin-top: 1.5rem;
	}

	.educational-card {
		background: linear-gradient(135deg,
			rgba(255, 255, 255, 0.95),
			rgba(248, 250, 252, 0.95)
		);
		border: 1px solid rgba(31, 196, 217, 0.2);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(8px);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.card-icon {
		width: 36px;
		height: 36px;
		background: linear-gradient(135deg, var(--color-gpb-mint), var(--color-gpb-blue));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.card-header h4 {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-fg-primary);
		margin: 0;
	}

	.card-content {
		margin-bottom: 1rem;
	}

	.card-content p {
		font-size: 0.875rem;
		color: var(--color-fg-secondary);
		margin: 0 0 0.75rem;
		line-height: 1.5;
	}

	.card-content ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.card-content li {
		font-size: 0.8rem;
		color: var(--color-fg-muted);
		margin-bottom: 0.5rem;
		padding-left: 1.25rem;
		position: relative;
		line-height: 1.4;
	}

	.card-content li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: var(--color-gpb-mint);
		font-weight: 600;
		font-size: 0.75rem;
	}

	.card-action {
		display: flex;
		justify-content: center;
	}

	:global(.learn-more-btn) {
		opacity: 0.6 !important;
		cursor: not-allowed !important;
		background: var(--color-neutral-200) !important;
		color: var(--color-fg-muted) !important;
		border: 1px solid var(--color-neutral-300) !important;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		width: 100%;
	}

	@keyframes bounce-in {
		0% {
			transform: scale(0) rotate(-180deg);
			opacity: 0;
		}
		50% {
			transform: scale(1.2) rotate(-90deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
		}
	}

	@keyframes stars-appear {
		0% {
			transform: translateY(-20px);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes star-pop {
		0% {
			transform: scale(0);
		}
		70% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes star-glow {
		0%, 100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.3);
		}
	}

	@keyframes stat-slide-in {
		0% {
			transform: translateX(-30px);
			opacity: 0;
		}
		100% {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.stat-item:nth-child(1) { animation-delay: 0.1s; }
	.stat-item:nth-child(2) { animation-delay: 0.2s; }
	.stat-item:nth-child(3) { animation-delay: 0.3s; }
	.stat-item:nth-child(4) { animation-delay: 0.4s; }

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.result-title {
			font-size: 1.75rem;
		}

		.result-icon {
			width: 64px;
			height: 64px;
			margin-bottom: 1rem;
		}

		.success-message {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
<script lang="ts">
	import { onMount } from 'svelte';
	import { Shield, Trophy, CheckCircle, XCircle, Star, Zap } from 'lucide-svelte';
	import { gameStore, currentGameState } from '$lib/stores/gameStore';
	import { Button, LoadingSpinner, Badge, ProgressBar, Counter, GameLayout } from '$lib';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	let currentQuestionIndex = $state(0);
	let score = $state(0);
	let showResult = $state(false);
	let selectedAnswer = $state<number | null>(null);
	let showExplanation = $state(false);
	let showParticles = $state(false);
	let showConfetti = $state(false);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const questions = [
		{
			id: 1,
			text: 'Вы получили SMS: "Ваша карта заблокирована. Для разблокировки перейдите по ссылке..." Что делать?',
			answers: [
				'Перейти по ссылке и ввести данные карты',
				'Проигнорировать сообщение и позвонить в банк',
				'Переслать SMS друзьям для проверки'
			],
			correctAnswer: 1,
			explanation: 'Правильно! Банки никогда не присылают ссылки для разблокировки карт в SMS. Всегда звоните в банк по номеру на обороте карты.'
		},
		{
			id: 2,
			text: 'Незнакомец звонит и говорит, что вы выиграли миллион, но нужно заплатить налог. Ваши действия?',
			answers: [
				'Заплатить налог, чтобы получить выигрыш',
				'Попросить прислать документы на выигрыш',
				'Повесить трубку - это мошенничество'
			],
			correctAnswer: 2,
			explanation: 'Верно! Настоящие лотереи никогда не требуют предоплаты налогов. Это классическая схема мошенничества.'
		},
		{
			id: 3,
			text: 'В социальной сети пришло сообщение от "друга": "Срочно нужны деньги! Переведи на номер +7..." Ваши действия?',
			answers: [
				'Сразу перевести деньги - друг в беде',
				'Связаться с другом по телефону для подтверждения',
				'Попросить прислать селфи с паспортом'
			],
			correctAnswer: 1,
			explanation: 'Правильно! Мошенники часто взламывают аккаунты в соцсетях. Всегда проверяйте подобные просьбы через другие каналы связи.'
		},
		{
			id: 4,
			text: 'На сайте интернет-магазина товар стоит в 5 раз дешевле, чем везде. Сайт требует полную предоплату. Что делать?',
			answers: [
				'Заплатить полностью - отличная цена!',
				'Проверить отзывы и репутацию магазина',
				'Заплатить только 50% предоплаты'
			],
			correctAnswer: 1,
			explanation: 'Верно! Подозрительно низкие цены - красный флаг. Всегда проверяйте репутацию магазина через независимые источники.'
		},
		{
			id: 5,
			text: 'Пришло письмо от "банка" с просьбой обновить данные, иначе счет заблокируют. В письме есть ссылка. Что делать?',
			answers: [
				'Перейти по ссылке и обновить данные',
				'Зайти на сайт банка через поисковик и проверить уведомления',
				'Переслать письмо коллегам для проверки'
			],
			correctAnswer: 1,
			explanation: 'Правильно! Банки не просят обновлять данные по почте. Всегда заходите на сайт банка самостоятельно или звоните в службу поддержки.'
		}
	];

	let currentQuestion = $derived(questions[currentQuestionIndex]);
	let progress = $derived(((currentQuestionIndex + 1) / questions.length) * 100);

	function handleStart() {
		gameStore.startGame('quiz-shield-ruble');
	}

	function handleAnswerSelect(answerIndex: number) {
		selectedAnswer = answerIndex;
	}

	function handleAnswerSubmit() {
		if (selectedAnswer === null) return;

		const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
		if (isCorrect) {
			score += 100;
			triggerParticles();
		}

		showExplanation = true;

		gameStore.updateGameState(state => ({
			...state,
			score: { ...state.score, current: score },
			progress: {
				...state.progress,
				currentQuestion: currentQuestionIndex + 1,
				totalQuestions: questions.length,
				percentage: progress
			}
		}));
	}

	function handleNext() {
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex++;
			selectedAnswer = null;
			showExplanation = false;
		} else {
			showResult = true;
			triggerConfetti();
			gameStore.completeGame({
				score,
				maxScore: questions.length * 100,
				accuracy: score / (questions.length * 100),
				correctAnswers: Math.floor(score / 100),
				totalAnswers: questions.length,
				grade: score >= 150 ? 'A' : score >= 100 ? 'B' : 'C'
			});
		}
	}

	function handleExit() {
		gameStore.exitGame();
		onexit?.();
	}

	function handleRestart() {
		currentQuestionIndex = 0;
		score = 0;
		showResult = false;
		selectedAnswer = null;
		showExplanation = false;
		handleStart();
	}

	function triggerParticles() {
		showParticles = true;
		setTimeout(() => {
			showParticles = false;
		}, 1500);
	}

	function triggerConfetti() {
		showConfetti = true;
		setTimeout(() => {
			showConfetti = false;
		}, 3000);
	}
</script>

<GameLayout gameName="Щит и Рубль" background="gradient-electric" showScore={true}>

	{#if !$currentGameState || $currentGameState.status === 'idle'}
		<div class="welcome-screen" class:mounted>
			<div class="game-card gradient-electric text-white mx-4 stagger-item">
				<div class="particles-container">
					{#each Array(3) as _, i}
						<div class="particle" style="--animation-delay: {i * 200}ms"></div>
					{/each}
				</div>

				<div class="game-card-content text-center">
					<div class="game-card-icon neon-glow mb-6">
						<Shield size={64} />
					</div>

					<h2 class="font-game-title mb-4">
						Щит и Рубль
					</h2>

					<p class="font-card-subtitle mb-6 opacity-90">
						Проверьте свои знания финансовой безопасности
					</p>

					<div class="flex justify-around mb-6 gap-4">
						<div class="mini-stat">
							<div class="mini-stat-value">{questions.length}</div>
							<div class="mini-stat-label">вопросов</div>
						</div>
						<div class="mini-stat">
							<div class="mini-stat-value">~3</div>
							<div class="mini-stat-label">минуты</div>
						</div>
						<div class="mini-stat">
							<div class="mini-stat-value">500</div>
							<div class="mini-stat-label">очков</div>
						</div>
					</div>

					<Button variant="primary" size="lg" onclick={handleStart} class="btn-game-primary hover-lift active-press">
						<Zap size={20} class="mr-2" />
						Начать квиз
					</Button>
				</div>

				<div class="decoration-shine"></div>
			</div>
		</div>
	{:else if showResult}
		<div class="result-screen p-4">
			<div class="modal-game">
				<div class="modal-header-game">
					<div class="confetti-container">
						{#if showConfetti}
							{#each Array(8) as _, i}
								<div class="confetti confetti-{(i % 4) + 1}" style="left: {10 + i * 10}%; animation-delay: {i * 0.1}s;"></div>
							{/each}
						{/if}
					</div>

					<div class="neon-glow mb-4">
						{#if score >= 150}
							<Trophy size={48} class="text-gpb-gold" />
							<Badge variant="pro" icon class="mt-2">
								Эксперт
							</Badge>
						{:else if score >= 100}
							<CheckCircle size={48} class="text-gpb-emerald" />
							<Badge variant="hot" icon class="mt-2">
								Хорошо
							</Badge>
						{:else}
							<XCircle size={48} class="text-gpb-warning" />
							<Badge variant="new" icon class="mt-2">
								Учись
							</Badge>
						{/if}
					</div>

					<h2 class="modal-title-game">Результат</h2>
				</div>

				<div class="modal-content-game">
					<div class="score-display mb-4">
						<Counter
							value={0}
							target={score}
							variant="score"
							size="xl"
							label="из {questions.length * 100} очков"
							animated={true}
						/>
					</div>

					<p class="font-ui-primary text-center mb-4 text-gpb-gray-700">
						{#if score >= 150}
							Отлично! Вы настоящий эксперт по финансовой безопасности.
						{:else if score >= 100}
							Хорошо! У вас есть базовые знания, но стоит изучить тему глубже.
						{:else}
							Рекомендуем изучить основы финансовой безопасности.
						{/if}
					</p>

					<div class="game-card gradient-wealth text-white p-4 mb-4">
						<h3 class="font-card-title mb-2">
							<Star size={16} class="inline mr-2" />
							Рекомендуем
						</h3>
						<p class="font-card-subtitle mb-3 opacity-90">
							Безопасная карта с повышенным уровнем защиты от мошенничества
						</p>
						<Button variant="secondary" size="sm" disabled class="btn-game-secondary">
							Узнать подробнее
						</Button>
					</div>
				</div>

				<div class="modal-footer-game">
					<Button variant="secondary" onclick={handleExit} class="flex-1 btn-game-secondary">
						В центр
					</Button>
					<Button variant="primary" onclick={handleRestart} class="flex-1 btn-game-primary hover-lift active-press">
						<Zap size={16} class="mr-1" />
						Еще раз
					</Button>
				</div>
			</div>
		</div>
	{:else}
		<div class="game-screen p-4">
			<div class="section-spacing mb-6">
				<ProgressBar
					value={progress}
					max={100}
					color="electric"
					showPercentage={true}
					label="Вопрос {currentQuestionIndex + 1} из {questions.length}"
					shimmer={true}
				/>
			</div>

			<div class="question-container max-w-md mx-auto">
				<div class="game-card glass-effect text-gpb-gray-900 mb-6 stagger-item">
					<div class="game-card-content">
						<h2 class="font-section-title mb-4 text-center leading-tight">
							{currentQuestion.text}
						</h2>
					</div>
				</div>

				<div class="space-y-3 mb-6">
					{#each currentQuestion.answers as answer, index}
						<button
							class="game-card bg-white hover-lift active-press focus-game w-full text-left transition-all duration-200"
							class:gradient-electric={selectedAnswer === index}
							class:text-white={selectedAnswer === index}
							class:opacity-70={showExplanation && selectedAnswer !== index}
							onclick={() => handleAnswerSelect(index)}
							disabled={showExplanation}
							style="--animation-delay: {index * 100}ms"
						>
							<div class="game-card-content flex items-center gap-4">
								<div class="w-8 h-8 rounded-full bg-gpb-violet text-white flex items-center justify-center font-bold text-sm"
									 class:bg-gpb-mint={selectedAnswer === index}
									 class:text-gpb-black={selectedAnswer === index}>
									{String.fromCharCode(65 + index)}
								</div>
								<span class="font-ui-primary flex-1">{answer}</span>
							</div>
						</button>
					{/each}
				</div>

				{#if showExplanation}
					<div class="game-card gradient-mystery text-white mb-6">
						<div class="particles-container">
							{#if showParticles}
								{#each Array(6) as _, i}
									<div class="particle" style="--particle-delay: {i * 100}ms"></div>
								{/each}
							{/if}
						</div>

						<div class="game-card-content">
							<div class="flex items-center gap-2 mb-3">
								{#if selectedAnswer === currentQuestion.correctAnswer}
									<CheckCircle size={20} class="text-gpb-emerald neon-glow" />
								{:else}
									<XCircle size={20} class="text-gpb-warning neon-glow" />
								{/if}
								<h3 class="font-card-title">
									{selectedAnswer === currentQuestion.correctAnswer ? 'Правильно!' : 'Объяснение:'}
								</h3>
							</div>
							<p class="font-ui-primary opacity-90">
								{currentQuestion.explanation}
							</p>
						</div>

						<div class="decoration-shine"></div>
					</div>
				{/if}

				<div class="text-center">
					{#if !showExplanation}
						<Button
							variant="primary"
							size="lg"
							onclick={handleAnswerSubmit}
							disabled={selectedAnswer === null}
							class="btn-game-primary hover-lift active-press"
						>
							<CheckCircle size={20} class="mr-2" />
							Ответить
						</Button>
					{:else}
						<Button
							variant="primary"
							size="lg"
							onclick={handleNext}
							class="btn-game-primary hover-lift active-press"
						>
							{#if currentQuestionIndex < questions.length - 1}
								<Zap size={20} class="mr-2" />
								Далее
							{:else}
								<Trophy size={20} class="mr-2" />
								Завершить
							{/if}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Particle Effects -->
	{#if showParticles}
		<div class="particles-effect-overlay">
			{#each Array(12) as _, i}
				<div class="particle-success" style="--particle-index: {i}"></div>
			{/each}
		</div>
	{/if}

	<!-- Confetti Effect -->
	{#if showConfetti}
		<div class="confetti-overlay">
			{#each Array(20) as _, i}
				<div class="confetti confetti-{(i % 4) + 1}" style="left: {Math.random() * 100}%; animation-delay: {Math.random() * 2}s;"></div>
			{/each}
		</div>
	{/if}
</GameLayout>

<style>

	.welcome-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 80px);
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.6s ease-out;
	}

	.welcome-screen.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.result-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 80px);
	}

	.game-screen {
		min-height: calc(100vh - 80px);
		padding-top: 2rem;
	}

	.particles-effect-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 100;
	}

	.particle-success {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 6px;
		height: 6px;
		background: var(--color-gpb-emerald);
		border-radius: 50%;
		animation: particleSuccess 1.5s ease-out forwards;
		animation-delay: calc(var(--particle-index) * 50ms);
	}

	.confetti-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 90;
	}

	.confetti {
		position: absolute;
		top: -10px;
		width: 10px;
		height: 10px;
		animation: confettiFall 3s linear forwards;
	}

	.confetti-1 { background: var(--color-gpb-gold); }
	.confetti-2 { background: var(--color-gpb-mint); }
	.confetti-3 { background: var(--color-gpb-raspberry); }
	.confetti-4 { background: var(--color-gpb-violet); }

	@keyframes particleSuccess {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0);
		}
		30% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.5);
		}
		100% {
			opacity: 0;
			transform: translate(
				calc(-50% + var(--particle-index) * 15px - 90px),
				calc(-50% - var(--particle-index) * 10px - 60px)
			) scale(0.5);
		}
	}

	@keyframes confettiFall {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translateY(100vh) rotate(720deg);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.welcome-screen, .particle-success, .confetti {
			animation: none !important;
			transition: none !important;
		}

		.welcome-screen {
			opacity: 1;
			transform: none;
		}
	}
</style>
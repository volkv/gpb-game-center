<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { gameStore, currentGameState } from '$lib/stores/gameStore';
	import { Button, LoadingSpinner } from '$lib';

	const dispatch = createEventDispatcher<{
		exit: void;
	}>();

	let currentQuestionIndex = 0;
	let score = 0;
	let showResult = false;
	let selectedAnswer: number | null = null;
	let showExplanation = false;

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

	$: currentQuestion = questions[currentQuestionIndex];
	$: progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
		dispatch('exit');
	}

	function handleRestart() {
		currentQuestionIndex = 0;
		score = 0;
		showResult = false;
		selectedAnswer = null;
		showExplanation = false;
		handleStart();
	}
</script>

<div class="quiz-game">
	<header class="quiz-header">
		<button
			class="back-button"
			on:click={handleExit}
			aria-label="Вернуться в игровой центр"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="quiz-title">
			<h1 class="font-heading text-h4 text-gpb-black">Щит и Рубль</h1>
			<p class="font-body text-body-sm text-gray-600">Квиз по финансовой безопасности</p>
		</div>
	</header>

	{#if !$currentGameState || $currentGameState.status === 'idle'}
		<div class="welcome-screen">
			<div class="welcome-content">
				<div class="icon-container">
					<svg class="shield-icon" width="80" height="80" viewBox="0 0 80 80" fill="none">
						<path d="M40 8L60 20V48C60 56 52 68 40 72C28 68 20 56 20 48V20L40 8Z"
							  fill="var(--color-gpb-mint)" opacity="0.2"/>
						<path d="M40 8L60 20V48C60 56 52 68 40 72C28 68 20 56 20 48V20L40 8Z"
							  fill="none" stroke="var(--color-gpb-violet)" stroke-width="3"/>
						<path d="M32 40L36 44L48 32" stroke="var(--color-gpb-violet)"
							  stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>

				<h2 class="font-heading text-h3 text-gpb-black mb-3">
					Проверьте свои знания финансовой безопасности
				</h2>

				<p class="font-body text-body text-gray-600 mb-6 text-center">
					Ответьте на вопросы и узнайте, сможете ли вы распознать уловки мошенников
				</p>

				<div class="game-stats">
					<div class="stat">
						<span class="stat-number">{questions.length}</span>
						<span class="stat-label">вопросов</span>
					</div>
					<div class="stat">
						<span class="stat-number">~3</span>
						<span class="stat-label">минуты</span>
					</div>
					<div class="stat">
						<span class="stat-number">500</span>
						<span class="stat-label">макс. очков</span>
					</div>
				</div>

				<Button variant="primary" size="lg" onclick={handleStart} class="start-button">
					Начать квиз
				</Button>
			</div>
		</div>
	{:else if showResult}
		<div class="result-screen">
			<div class="result-content">
				<div class="result-icon">
					{#if score >= 150}
						<div class="trophy-icon">🏆</div>
					{:else if score >= 100}
						<div class="medal-icon">🥈</div>
					{:else}
						<div class="try-icon">💪</div>
					{/if}
				</div>

				<h2 class="font-heading text-h3 text-gpb-black mb-2">Результат</h2>

				<div class="score-display">
					<span class="score-value">{score}</span>
					<span class="score-max">из {questions.length * 100}</span>
				</div>

				<p class="result-message font-body text-body text-gray-600 mb-6">
					{#if score >= 150}
						Отлично! Вы настоящий эксперт по финансовой безопасности.
					{:else if score >= 100}
						Хорошо! У вас есть базовые знания, но стоит изучить тему глубже.
					{:else}
						Рекомендуем изучить основы финансовой безопасности.
					{/if}
				</p>

				<div class="product-recommendation">
					<h3 class="font-heading text-base font-semibold text-gpb-black mb-2">
						Рекомендуем
					</h3>
					<div class="product-card">
						<p class="font-body text-body-sm text-gray-700 mb-3">
							Безопасная карта с повышенным уровнем защиты от мошенничества
						</p>
						<Button variant="secondary" size="sm" disabled>
							Узнать подробнее
						</Button>
					</div>
				</div>

				<div class="action-buttons">
					<Button variant="primary" onclick={handleRestart}>
						Пройти еще раз
					</Button>
					<Button variant="secondary" onclick={handleExit}>
						В игровой центр
					</Button>
				</div>
			</div>
		</div>
	{:else}
		<div class="game-screen">
			<div class="progress-container">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {progress}%"></div>
				</div>
				<span class="progress-text font-body text-caption text-gray-600">
					Вопрос {currentQuestionIndex + 1} из {questions.length}
				</span>
			</div>

			<div class="question-container">
				<h2 class="question-text font-heading text-h4 text-gpb-black mb-6">
					{currentQuestion.text}
				</h2>

				<div class="answers-container">
					{#each currentQuestion.answers as answer, index}
						<button
							class="answer-button"
							class:selected={selectedAnswer === index}
							class:disabled={showExplanation}
							on:click={() => handleAnswerSelect(index)}
							disabled={showExplanation}
						>
							<span class="answer-letter">{String.fromCharCode(65 + index)}</span>
							<span class="answer-text font-body text-body">{answer}</span>
						</button>
					{/each}
				</div>

				{#if showExplanation}
					<div class="explanation">
						<h3 class="explanation-title font-heading text-base font-semibold text-gpb-black mb-2">
							Объяснение:
						</h3>
						<p class="explanation-text font-body text-body text-gray-700">
							{currentQuestion.explanation}
						</p>
					</div>
				{/if}

				<div class="action-container">
					{#if !showExplanation}
						<Button
							variant="primary"
							onclick={handleAnswerSubmit}
							disabled={selectedAnswer === null}
						>
							Ответить
						</Button>
					{:else}
						<Button variant="primary" onclick={handleNext}>
							{currentQuestionIndex < questions.length - 1 ? 'Далее' : 'Завершить'}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.quiz-game {
		min-height: 100vh;
		background: linear-gradient(to bottom, #ffffff 0%, var(--color-gpb-lily) 100%);
		padding: 1rem;
	}

	.quiz-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		padding-top: 0.5rem;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: rgba(25, 25, 239, 0.1);
		color: var(--color-gpb-violet);
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.back-button:hover {
		background: rgba(25, 25, 239, 0.15);
		transform: translateX(-2px);
	}

	.quiz-title {
		flex: 1;
	}

	.welcome-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		text-align: center;
	}

	.welcome-content {
		max-width: 360px;
		width: 100%;
		padding: 2rem;
	}

	.icon-container {
		margin-bottom: 2rem;
		display: flex;
		justify-content: center;
	}

	.shield-icon {
		filter: drop-shadow(0 4px 12px rgba(25, 25, 239, 0.2));
	}

	.game-stats {
		display: flex;
		justify-content: space-around;
		margin: 2rem 0;
		gap: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: rgba(88, 255, 255, 0.1);
		border-radius: 12px;
		flex: 1;
	}

	.stat-number {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-gpb-violet);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-gpb-henbane);
		margin-top: 0.25rem;
	}

	.progress-container {
		margin-bottom: 2rem;
	}

	.progress-bar {
		width: 100%;
		height: 6px;
		background: var(--color-gpb-lily);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-gpb-mint) 0%, var(--color-gpb-melissa) 100%);
		transition: width 0.3s ease;
	}

	.progress-text {
		text-align: center;
		display: block;
	}

	.question-container {
		max-width: 480px;
		margin: 0 auto;
	}

	.question-text {
		text-align: center;
		line-height: 1.4;
	}

	.answers-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.answer-button {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: white;
		border: 2px solid var(--color-gpb-lily);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.answer-button:hover:not(.disabled) {
		border-color: var(--color-gpb-violet);
		background: rgba(25, 25, 239, 0.02);
	}

	.answer-button.selected {
		border-color: var(--color-gpb-violet);
		background: rgba(25, 25, 239, 0.05);
	}

	.answer-button.disabled {
		cursor: default;
		opacity: 0.7;
	}

	.answer-letter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--color-gpb-violet);
		color: white;
		border-radius: 50%;
		font-weight: 600;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.answer-button.selected .answer-letter {
		background: var(--color-gpb-mint);
		color: var(--color-gpb-black);
	}

	.answer-text {
		flex: 1;
		color: var(--color-gpb-black);
	}

	.explanation {
		background: rgba(88, 255, 255, 0.1);
		border: 1px solid rgba(88, 255, 255, 0.3);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.explanation-title {
		color: var(--color-gpb-violet);
	}

	.action-container {
		display: flex;
		justify-content: center;
	}

	.result-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		text-align: center;
	}

	.result-content {
		max-width: 400px;
		width: 100%;
		padding: 2rem;
	}

	.result-icon {
		margin-bottom: 1.5rem;
		font-size: 4rem;
	}

	.score-display {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.score-value {
		font-family: var(--font-heading);
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-gpb-violet);
		line-height: 1;
	}

	.score-max {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		color: var(--color-gpb-henbane);
	}

	.product-recommendation {
		background: white;
		border: 1px solid var(--color-gpb-lily);
		border-radius: 12px;
		padding: 1.5rem;
		margin: 2rem 0;
		text-align: left;
	}

	.product-card {
		margin-top: 0.75rem;
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	@media (min-width: 400px) {
		.action-buttons {
			flex-direction: row;
		}
	}
</style>
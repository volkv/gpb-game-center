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
			text: 'На каком сайте безопасно вводить данные банковской карты?',
			answers: [
				'На любом сайте, если есть форма оплаты',
				'Только на сайтах с SSL-сертификатом (https://)',
				'На сайтах с красивым дизайном'
			],
			correctAnswer: 1,
			explanation: 'Правильно! SSL-сертификат (https://) и замок в адресной строке — основные признаки защищенного соединения.'
		},
		{
			id: 4,
			text: 'Что делать, если банкомат "съел" карту?',
			answers: [
				'Уйти и забыть про карту',
				'Немедленно позвонить в банк',
				'Попросить помощи у прохожих'
			],
			correctAnswer: 1,
			explanation: 'Верно! Сразу звоните в банк по номеру на банкомате или с обратной стороны карты для блокировки.'
		},
		{
			id: 5,
			text: 'Безопасно ли пользоваться общественным Wi-Fi для банковских операций?',
			answers: [
				'Да, если сеть требует пароль',
				'Нет, никогда не используйте публичный Wi-Fi для банкинга',
				'Можно, если быстро'
			],
			correctAnswer: 1,
			explanation: 'Правильно! Публичные Wi-Fi сети небезопасны. Используйте мобильный интернет для банковских операций.'
		}
	];

	let currentQuestion = $derived(questions[currentQuestionIndex]);
	let progress = $derived(((currentQuestionIndex + 1) / questions.length) * 100);

	function handleStart() {
		gameStore.startGame('quiz-shield-ruble');
	}

	function handleAnswerSelect(index: number) {
		selectedAnswer = index;
	}

	function handleAnswerSubmit() {
		if (selectedAnswer === null) return;

		const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
		if (isCorrect) {
			score += 100;
		}

		showExplanation = true;
	}

	function handleNext() {
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex++;
			selectedAnswer = null;
			showExplanation = false;
		} else {
			finishGame();
		}
	}

	function finishGame() {
		const finalScore = score;
		const totalQuestions = questions.length;
		const maxScore = totalQuestions * 100;
		const percentage = (finalScore / maxScore) * 100;

		let level = 'Новичок';
		if (percentage >= 80) {
			level = 'Эксперт по безопасности';
		} else if (percentage >= 60) {
			level = 'Защитник';
		} else if (percentage >= 40) {
			level = 'Ученик';
		}

		gameStore.completeGame({
			score: finalScore,
			maxScore,
			correctAnswers: Math.round((finalScore / 100)),
			totalAnswers: totalQuestions,
			accuracy: percentage / 100
		});

		showResult = true;
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

<GameLayout gameName="Щит и Рубль" background="gradient-electric" showScore={true}>

	{#if !$currentGameState || $currentGameState.status === 'idle'}
		<div class="welcome-screen">
			<div class="game-card gradient-electric text-white mx-4">
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

					<Button variant="primary" size="lg" onclick={handleStart} class="btn-game-primary">
						<Zap size={20} class="mr-2" />
						Начать квиз
					</Button>
				</div>
			</div>
		</div>
	{:else if showResult}
		<div class="result-screen p-4">
			<div class="modal-game">
				<div class="modal-header-game">
					<h1 class="modal-title-game">
						<Trophy size={40} class="mx-auto mb-4 text-gpb-gold neon-glow" />
						Квиз завершен!
					</h1>
				</div>

				<div class="modal-content-game">
					<div class="result-stats mb-6">
						<div class="score-display mb-4">
							<Star size={24} class="text-gpb-gold mb-2 mx-auto neon-glow" />
							<div class="score-value">{score}</div>
							<div class="score-label">баллов заработано</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="mini-stat">
								<div class="mini-stat-value">{Math.round(score/100)}</div>
								<div class="mini-stat-label">правильных</div>
							</div>
							<div class="mini-stat">
								<div class="mini-stat-value">{Math.round((score/(questions.length*100))*100)}%</div>
								<div class="mini-stat-label">точность</div>
							</div>
						</div>
					</div>

					<div class="result-level mb-6">
						<Badge variant="pro">
							{score >= 400 ? 'Эксперт по безопасности' :
							 score >= 300 ? 'Защитник' :
							 score >= 200 ? 'Ученик' : 'Новичок'}
						</Badge>
					</div>
				</div>

				<div class="modal-footer-game">
					<Button variant="secondary" onclick={handleRestart} class="btn-game-secondary">
						Пройти снова
					</Button>
					<Button variant="primary" onclick={onexit} class="btn-game-primary">
						Завершить
					</Button>
				</div>
			</div>
		</div>
	{:else}
		<div class="game-screen p-4">
			<div class="mb-6">
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
				<div class="game-card glass-effect text-gpb-gray-900 mb-6">
					<div class="game-card-content">
						<h2 class="font-section-title mb-4 text-center leading-tight">
							{currentQuestion.text}
						</h2>
					</div>
				</div>

				<div class="space-y-3 mb-6">
					{#each currentQuestion.answers as answer, index}
						<button
							class="game-card bg-white w-full text-left"
							class:gradient-electric={selectedAnswer === index}
							class:text-white={selectedAnswer === index}
							class:opacity-70={showExplanation && selectedAnswer !== index}
							onclick={() => handleAnswerSelect(index)}
							disabled={showExplanation}
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
					</div>
				{/if}

				<div class="text-center">
					{#if !showExplanation}
						<Button
							variant="primary"
							size="lg"
							onclick={handleAnswerSubmit}
							disabled={selectedAnswer === null}
							class="btn-game-primary"
						>
							<CheckCircle size={20} class="mr-2" />
							Ответить
						</Button>
					{:else}
						<Button
							variant="primary"
							size="lg"
							onclick={handleNext}
							class="btn-game-primary"
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
</GameLayout>

<style>
	.welcome-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 80px);
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

	.result-stats {
		text-align: center;
	}

	.result-level {
		text-align: center;
	}
</style>
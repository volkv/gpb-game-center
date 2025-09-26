<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Shield, Heart, AlertTriangle, CheckCircle, Clock, Smartphone } from 'lucide-svelte';
	import { gameStore, currentGameState } from '$lib/stores/gameStore';
	import { Button, Counter, ProgressBar, GameLayout } from '$lib';

	interface Props {
		onexit?: () => void;
	}

	let { onexit }: Props = $props();

	function handleExit() {
		clearTimers();
		onexit?.();
	}

	let gameState = $state<'intro' | 'playing' | 'paused' | 'gameOver' | 'completed'>('intro');
	let currentMessage = $state<SMSMessage | null>(null);
	let score = $state(0);
	let lives = $state(3);
	let level = $state(1);
	let messageIndex = $state(0);
	let timeRemaining = $state(10);
	let showResult = $state(false);
	let lastAnswer = $state<boolean | null>(null);
	let correctAnswer = $state<boolean | null>(null);
	let streak = $state(0);
	let totalMessages = $state(0);
	let correctAnswers = $state(0);

	let gameTimer: ReturnType<typeof setTimeout> | null = null;
	let messageTimer: ReturnType<typeof setInterval> | null = null;

	interface SMSMessage {
		id: number;
		text: string;
		sender: string;
		isFraud: boolean;
		explanation: string;
		difficulty: 'easy' | 'medium' | 'hard';
	}

	const smsMessages: SMSMessage[] = [
		// Level 1 - Easy (Obviously fraudulent)
		{
			id: 1,
			text: 'ВНИМАНИЕ! Ваша карта заблокирована. Для разблокировки перейдите по ссылке: http://fake-bank.ru/unlock',
			sender: 'BANK-ALERT',
			isFraud: true,
			explanation: 'Банки никогда не присылают ссылки в SMS. Это классический способ кражи данных.',
			difficulty: 'easy'
		},
		{
			id: 2,
			text: 'Поздравляем! Вы выиграли 1.000.000 рублей в лотерее. Для получения переведите налог 50.000р на номер 1234',
			sender: 'LOTTO-WIN',
			isFraud: true,
			explanation: 'Настоящие лотереи не требуют предоплаты налогов. Это мошенничество.',
			difficulty: 'easy'
		},
		{
			id: 3,
			text: 'Покупка: Супермаркет ПЯТЕРОЧКА, 1 245,67 руб. Доступно: 12 345,23 руб. Время: 14:23',
			sender: 'GAZPROMBANK',
			isFraud: false,
			explanation: 'Типичное уведомление о покупке от банка. Содержит конкретную информацию без подозрительных действий.',
			difficulty: 'easy'
		},
		{
			id: 4,
			text: 'Срочно подтвердите операцию! Списание 25 000р. Если это не вы - введите код CVC: reply STOP',
			sender: 'SECURITY',
			isFraud: true,
			explanation: 'Банки никогда не запрашивают CVC-код в SMS. Это попытка кражи данных карты.',
			difficulty: 'easy'
		},
		{
			id: 5,
			text: 'Баланс по карте *1234: 15 678,90 руб. Запрос от 16:45',
			sender: 'GAZPROMBANK',
			isFraud: false,
			explanation: 'Стандартный ответ на запрос баланса. Никаких подозрительных элементов.',
			difficulty: 'easy'
		},
		// Level 2 - Medium (Mixed scenarios)
		{
			id: 6,
			text: 'Зафиксирована подозрительная активность. Заблокировать карту? Ответьте ДА или НЕТ',
			sender: 'SECURITY-GPB',
			isFraud: true,
			explanation: 'Банки не просят подтверждать блокировку через SMS. Звоните в банк по официальному номеру.',
			difficulty: 'easy'
		},
		{
			id: 7,
			text: 'Уважаемый клиент! Ваш кредитный лимит увеличен до 500 000р. Подробности: 8-800-100-0707',
			sender: 'GAZPROMBANK',
			isFraud: false,
			explanation: 'Банк может уведомлять об изменении лимитов и указывать официальный номер для справок.',
			difficulty: 'easy'
		},
		{
			id: 8,
			text: 'НАЛОГОВАЯ: У вас задолженность 15 000р. Оплатите до 25.12 во избежание штрафа: www.nalog-pay.com',
			sender: 'NALOG-RF',
			isFraud: true,
			explanation: 'Налоговая не присылает ссылки на сторонние сайты. Официальные уведомления приходят почтой.',
			difficulty: 'easy'
		},
		{
			id: 9,
			text: 'Поступление: Зарплата ООО РОГА И КОПЫТА, 85 000,00 руб. Время: 10:15',
			sender: 'GAZPROMBANK',
			isFraud: false,
			explanation: 'Обычное уведомление о поступлении средств с указанием источника.',
			difficulty: 'easy'
		},
		{
			id: 10,
			text: 'Ваш аккаунт взломан! Смените пароль: bank-security.ru/change Код: 7463',
			sender: 'BANK-SECURE',
			isFraud: true,
			explanation: 'Банки не присылают коды для смены паролей и не используют сторонние сайты.',
			difficulty: 'easy'
		},
		// Level 3 - Hard (Sophisticated scams)
		{
			id: 11,
			text: 'Газпромбанк: Напоминание о платеже по кредиту 12 500р до 28.12.2024. Просрочка: штраф 1500р.',
			sender: 'GAZPROMBANK',
			isFraud: false,
			explanation: 'Банк может присылать напоминания о платежах с указанием штрафов за просрочку.',
			difficulty: 'hard'
		},
		{
			id: 12,
			text: 'Отдел Безопасности: Подозрительный вход в систему. Если это не вы, заблокируйте карту по тел. 8-495-555-1234',
			sender: 'GPB-SECURITY',
			isFraud: true,
			explanation: 'Мошенники используют поддельные номера. Звоните только по номеру с обратной стороны карты.',
			difficulty: 'hard'
		},
		{
			id: 13,
			text: 'Курс валют на 26.12: USD 73.45↑ EUR 89.23↓ Инвестиции: gazprombank.ru/invest',
			sender: 'GAZPROMBANK',
			isFraud: false,
			explanation: 'Банки могут присылать информацию о курсах валют и ссылки на официальные разделы сайта.',
			difficulty: 'hard'
		},
		{
			id: 14,
			text: 'СБП: Неизвестное лицо пытается перевести с вашего номера 50 000р. Отменить? sberbank-cancel.com/stop',
			sender: 'SBP-ALERT',
			isFraud: true,
			explanation: 'СБП не присылает ссылки на отмену операций. Это попытка получить доступ к вашему банкингу.',
			difficulty: 'hard'
		},
		{
			id: 15,
			text: 'Автоплатеж: МТС +7901234567, списано 350,00 руб. Остаток лимита: 4 650,00 руб.',
			sender: 'GAZPROMBANK',
			isFraud: false,
			explanation: 'Стандартное уведомление об автоплатеже с информацией об остатке лимита.',
			difficulty: 'hard'
		}
	];

	const levelConfig = {
		1: { messagesCount: 5, timePerMessage: 10 },
		2: { messagesCount: 5, timePerMessage: 8 },
		3: { messagesCount: 5, timePerMessage: 6 }
	};

	onMount(() => {
		startIntro();
	});

	onDestroy(() => {
		clearTimers();
	});

	function startIntro() {
		gameState = 'intro';
	}

	function startGame() {
		gameState = 'playing';
		score = 0;
		lives = 3;
		level = 1;
		messageIndex = 0;
		streak = 0;
		totalMessages = 0;
		correctAnswers = 0;
		currentMessage = null;
		showResult = false;
		showNextMessage();
	}

	function showNextMessage() {
		if (messageIndex >= levelConfig[level as keyof typeof levelConfig].messagesCount) {
			if (level < 3) {
				nextLevel();
			} else {
				endGame(true);
			}
			return;
		}

		const levelMessages = smsMessages.filter(msg => {
			if (level === 1) return msg.difficulty === 'easy';
			if (level === 2) return msg.difficulty === 'medium';
			return msg.difficulty === 'hard';
		});

		const randomMessage = levelMessages[Math.floor(Math.random() * levelMessages.length)];

		if (import.meta.env.DEV) {
			console.log('Level:', level, 'Available messages:', levelMessages.length, 'Selected:', randomMessage);
		}

		currentMessage = randomMessage;
		timeRemaining = levelConfig[level as keyof typeof levelConfig].timePerMessage;
		showResult = false;

		startMessageTimer();
		messageIndex++;
		totalMessages++;
	}

	function startMessageTimer() {
		clearTimers();
		messageTimer = setInterval(() => {
			timeRemaining--;
			if (timeRemaining <= 0) {
				handleTimeout();
			}
		}, 1000);
	}

	function handleTimeout() {
		lives--;
		streak = 0;
		showFeedback(null, currentMessage!.isFraud, currentMessage!.explanation);

		if (lives <= 0) {
			endGame(false);
		} else {
			setTimeout(() => {
				showNextMessage();
			}, 2000);
		}
	}

	function handleAnswer(playerAnswer: boolean) {
		if (!currentMessage || showResult) return;

		clearTimers();
		const isCorrect = playerAnswer === currentMessage.isFraud;

		if (isCorrect) {
			const timeBonus = Math.max(0, timeRemaining * 5);
			const baseScore = 100;
			const streakBonus = streak * 10;
			const totalScore = baseScore + timeBonus + streakBonus;

			score += totalScore;
			streak++;
			correctAnswers++;
		} else {
			lives--;
			streak = 0;
		}

		showFeedback(playerAnswer, currentMessage.isFraud, currentMessage.explanation);

		if (lives <= 0) {
			setTimeout(() => endGame(false), 2000);
		} else {
			setTimeout(() => showNextMessage(), 2000);
		}
	}

	function showFeedback(playerAnswer: boolean | null, correctAnswer: boolean, explanation: string) {
		lastAnswer = playerAnswer;
		correctAnswer = correctAnswer;
		showResult = true;

		// Update game state for analytics
		gameStore.updateGameState(state => ({
			...state,
			score: { ...state.score, current: score }
		}));
	}

	function nextLevel() {
		level++;
		messageIndex = 0;
		setTimeout(() => showNextMessage(), 1000);
	}

	function endGame(completed: boolean) {
		clearTimers();
		gameState = completed ? 'completed' : 'gameOver';

		const accuracy = totalMessages > 0 ? Math.round((correctAnswers / totalMessages) * 100) : 0;

		// Complete game with results
		gameStore.completeGame({
			score: score,
			maxScore: 2000,
			accuracy: accuracy / 100,
			correctAnswers: correctAnswers,
			totalAnswers: totalMessages,
			achievements: completed ? ['anti_fraud_master'] : []
		});
	}

	function restartGame() {
		clearTimers();
		startGame();
	}

	function clearTimers() {
		if (messageTimer) {
			clearInterval(messageTimer);
			messageTimer = null;
		}
		if (gameTimer) {
			clearInterval(gameTimer);
			gameTimer = null;
		}
	}

	function exitGame() {
		clearTimers();
		onexit?.();
	}
</script>

<GameLayout gameName="Охотник за мошенниками">
	<div class="anti-fraud-game">
		{#if gameState === 'intro'}
			<div class="intro-screen">
				<div class="intro-content">
					<div class="intro-icon">
						<Shield size={48} class="shield-icon" />
					</div>
					<h1>Охотник за мошенниками</h1>
					<p class="intro-description">
						Определяйте мошеннические SMS и защитите свои финансы!
						У вас есть ❤️❤️❤️ жизни. Будьте внимательны!
					</p>
					<div class="intro-rules">
						<div class="rule">
							<CheckCircle size={20} class="text-green-500" />
							<div class="rule-text">Правильный ответ: +100 очков</div>
						</div>
						<div class="rule">
							<Clock size={20} class="text-blue-500" />
							<div class="rule-text">Бонус за скорость: +5 очков за секунду</div>
						</div>
						<div class="rule">
							<AlertTriangle size={20} class="text-red-500" />
							<div class="rule-text">Ошибка: -1 жизнь</div>
						</div>
					</div>
					<Button onclick={startGame}>
						Начать охоту
					</Button>
				</div>
			</div>
		{:else if gameState === 'playing'}
			<div class="game-screen">
				<div class="game-header">
					<div class="lives">
						{#each Array(3) as _, i}
							<Heart
								size={20}
								class={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}
							/>
						{/each}
					</div>
					<div class="score">
						<Counter value={score} label="Очки" />
					</div>
					<div class="level">
						Уровень {level}
					</div>
				</div>

				{#if currentMessage && !showResult}
					<div class="message-container">
						<div class="phone-mockup">
							<Smartphone size={24} class="absolute top-4 right-4 text-gray-500" />
							<div class="message-bubble">
								<div class="sender">{currentMessage.sender}</div>
								<div class="message-text">{currentMessage.text}</div>
							</div>
						</div>

						<div class="timer-section">
							<Clock size={16} />
							<span class="timer">{timeRemaining} сек</span>
							<ProgressBar
								value={timeRemaining}
								max={levelConfig[level as keyof typeof levelConfig].timePerMessage}
								class="flex-1 max-w-[200px]"
							/>
						</div>

						<div class="action-buttons">
							<Button
								onclick={() => handleAnswer(true)}
								variant="secondary"
								class="flex-1 text-lg font-semibold px-4 py-3 rounded-xl transition-transform active:scale-95"
							>
								🚨 МОШЕННИК
							</Button>
							<Button
								onclick={() => handleAnswer(false)}
								variant="primary"
								class="flex-1 text-lg font-semibold px-4 py-3 rounded-xl transition-transform active:scale-95"
							>
								✅ БЕЗОПАСНО
							</Button>
						</div>
					</div>
				{:else if showResult && currentMessage}
					<div class="result-screen">
						<div class="result-icon">
							{#if lastAnswer === null}
								<Clock size={48} class="text-orange-500" />
								<h3>Время истекло!</h3>
							{:else if lastAnswer === correctAnswer}
								<CheckCircle size={48} class="text-green-500" />
								<h3>Правильно!</h3>
							{:else}
								<AlertTriangle size={48} class="text-red-500" />
								<h3>Неверно!</h3>
							{/if}
						</div>

						<div class="explanation">
							<p><strong>Правильный ответ:</strong> {correctAnswer ? 'МОШЕННИК' : 'БЕЗОПАСНО'}</p>
							<p class="explanation-text">{currentMessage.explanation}</p>
						</div>

						{#if streak > 1}
							<div class="streak-bonus">
								🔥 Серия: {streak} правильных ответов!
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{:else if gameState === 'gameOver'}
			<div class="game-over-screen">
				<AlertTriangle size={64} class="text-red-500" />
				<h2>Игра окончена</h2>
				<div class="final-stats">
					<div class="stat">
						<Counter value={score} label="Итоговый счёт" />
					</div>
					<div class="stat">
						<span class="stat-value">{Math.round((correctAnswers / totalMessages) * 100)}%</span>
						<span class="stat-label">Точность</span>
					</div>
					<div class="stat">
						<span class="stat-value">{level}</span>
						<span class="stat-label">Достигнутый уровень</span>
					</div>
				</div>
				<div class="game-over-actions">
					<Button onclick={restartGame} variant="primary">
						Попробовать снова
					</Button>
					<Button onclick={exitGame} variant="secondary">
						В главное меню
					</Button>
				</div>
			</div>
		{:else if gameState === 'completed'}
			<div class="victory-screen">
				<Shield size={64} class="text-gpb-mint" />
				<h2>Поздравляем!</h2>
				<p>Вы успешно прошли все уровни!</p>
				<div class="final-stats">
					<div class="stat">
						<Counter value={score} label="Итоговый счёт" />
					</div>
					<div class="stat">
						<span class="stat-value">{Math.round((correctAnswers / totalMessages) * 100)}%</span>
						<span class="stat-label">Точность</span>
					</div>
					<div class="stat">
						<span class="stat-value">{correctAnswers}/{totalMessages}</span>
						<span class="stat-label">Правильных ответов</span>
					</div>
				</div>
				<div class="victory-actions">
					<Button onclick={restartGame} variant="primary">
						Играть снова
					</Button>
					<Button onclick={exitGame} variant="secondary">
						В главное меню
					</Button>
				</div>
			</div>
		{/if}
	</div>
</GameLayout>

<style>
	.anti-fraud-game {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.intro-screen, .game-over-screen, .victory-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		overflow-y: auto;
	}

	.intro-content {
		text-align: center;
	}

	.intro-content h1 {
		font-size: 1.8rem;
		font-weight: 700;
		margin: 0.75rem 0;
		color: #58ffff;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		line-height: 1.2;
	}

	.intro-description {
		font-size: 1rem;
		margin-bottom: 1.5rem;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.9);
		max-width: 320px;
		margin: 0 auto 1.5rem auto;
		text-align: center;
	}

	.intro-icon {
		margin-bottom: 0.75rem;
		padding: 1rem;
		background: linear-gradient(135deg, #58ffff, #50c878);
		border-radius: 50%;
		display: inline-flex;
		box-shadow: 0 4px 16px rgba(88, 255, 255, 0.3);
	}


	.intro-rules {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0 auto 1.5rem auto;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		padding: 1.25rem;
		max-width: 320px;
		width: 100%;
	}

	.rule {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.5rem 0;
		width: 100%;
	}

	.rule :global(svg) {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		margin-top: 0.1rem;
	}

	.rule-text {
		flex: 1;
		font-size: 0.95rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.95);
		text-align: left;
		line-height: 1.4;
	}


	.game-screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
		color: #1e293b;
		position: relative;
		overflow: hidden;
	}

	.game-screen::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
		            radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.08) 0%, transparent 50%);
		animation: float 20s ease-in-out infinite;
		pointer-events: none;
		z-index: 1;
	}

	@keyframes float {
		0%, 100% { transform: translate(0, 0) rotate(0deg); }
		33% { transform: translate(30px, -30px) rotate(120deg); }
		66% { transform: translate(-20px, 20px) rotate(240deg); }
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding: 1rem 1.25rem;
		background: linear-gradient(135deg, white 0%, #f8fafc 100%);
		border-radius: 1.25rem;
		box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(226, 232, 240, 0.6);
		position: relative;
		z-index: 10;
		backdrop-filter: blur(10px);
	}

	.lives {
		display: flex;
		gap: 0.25rem;
	}

	.level {
		font-weight: 600;
		color: var(--color-gpb-violet);
	}

	.message-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-top: 1rem;
		position: relative;
		z-index: 10;
		animation: slideInUp 0.6s ease-out;
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.phone-mockup {
		background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
		border: 2px solid transparent;
		background-clip: padding-box;
		border-radius: 2rem;
		padding: 1.5rem;
		position: relative;
		box-shadow:
			0 20px 40px -10px rgba(0, 0, 0, 0.1),
			0 0 0 1px rgba(255, 255, 255, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.7);
		margin: 0 auto;
		max-width: 350px;
		transform: translateY(0);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		z-index: 10;
	}

	.phone-mockup::before {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
		border-radius: 2rem;
		z-index: -1;
		opacity: 0.6;
	}


	.message-bubble {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border-radius: 1.25rem;
		padding: 1.5rem;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 2px 8px rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(226, 232, 240, 0.5);
		color: #1e293b;
		position: relative;
		overflow: hidden;
	}

	.message-bubble::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
		border-radius: 0 2px 2px 0;
	}

	.sender {
		font-weight: 600;
		font-size: 0.85rem;
		color: #6366f1;
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.message-text {
		line-height: 1.6;
		color: #1e293b;
		font-size: 0.95rem;
	}

	.timer-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		justify-content: center;
		padding: 1.25rem;
		background: linear-gradient(135deg, white 0%, #fefefe 100%);
		border: 1px solid rgba(226, 232, 240, 0.6);
		border-radius: 1.25rem;
		box-shadow:
			0 8px 25px -5px rgba(0, 0, 0, 0.1),
			0 0 0 1px rgba(255, 255, 255, 0.9),
			inset 0 1px 0 rgba(255, 255, 255, 0.7);
		position: relative;
		z-index: 10;
		backdrop-filter: blur(10px);
	}

	.timer {
		font-weight: 700;
		font-size: 1.2rem;
		color: #dc2626;
		min-width: 60px;
		text-align: center;
	}


	.action-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		position: relative;
		z-index: 10;
	}


	.result-screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2rem;
		gap: 1.5rem;
	}

	.result-icon h3 {
		margin-top: 0.5rem;
		font-size: 1.5rem;
	}

	.explanation {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.explanation-text {
		margin-top: 0.75rem;
		color: #64748b;
		line-height: 1.6;
		font-size: 0.95rem;
	}

	.streak-bonus {
		background: linear-gradient(135deg, #ff6b35, #f7931e);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 2rem;
		font-weight: 600;
		animation: pulse 1s ease-in-out;
	}

	.final-stats {
		display: flex;
		gap: 2rem;
		margin: 2rem 0;
		flex-wrap: wrap;
		justify-content: center;
	}

	.stat {
		text-align: center;
		min-width: 100px;
	}

	.stat-value {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-gpb-mint);
	}

	.stat-label {
		display: block;
		font-size: 0.9rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.game-over-actions, .victory-actions {
		display: flex;
		gap: 1rem;
		flex-direction: column;
		width: 100%;
		max-width: 300px;
	}

	.victory-screen h2 {
		color: #58ffff;
		font-size: 2.5rem;
		margin-bottom: 1rem;
		font-weight: 800;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.game-over-screen h2 {
		color: #ff6b6b;
		font-size: 2.5rem;
		margin-bottom: 1rem;
		font-weight: 800;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
	}

	@media (max-width: 480px) {
		.intro-screen, .game-over-screen, .victory-screen {
			padding: 0.75rem;
		}

		.intro-content h1 {
			font-size: 1.5rem;
			margin: 0.5rem 0;
		}

		.intro-description {
			font-size: 0.9rem;
			margin-bottom: 1rem;
		}

		.intro-icon {
			padding: 0.75rem;
			margin-bottom: 0.5rem;
		}

		.intro-rules {
			padding: 0.75rem;
			margin-bottom: 1rem;
			max-width: 280px;
		}

		.rule {
			font-size: 0.85rem;
		}

		.final-stats {
			gap: 1rem;
		}

		.action-buttons {
			flex-direction: column;
		}
	}

	@media (max-height: 700px) {
		.intro-screen {
			justify-content: flex-start;
			padding-top: 1rem;
		}

		.intro-content h1 {
			font-size: 1.6rem;
		}

		.intro-description {
			margin-bottom: 1rem;
		}

		.intro-rules {
			margin-bottom: 1rem;
		}
	}
</style>
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    Shield,
    Heart,
    AlertTriangle,
    CheckCircle,
    Clock,
    Smartphone,
    ShieldCheck,
    ShieldAlert,
    Zap,
    Sparkles
  } from 'lucide-svelte';
  import { gameStore } from '$lib/stores/gameStore';
  import { Button, Counter, ProgressBar, GameLayout } from '$lib';

  interface Props {
    onexit?: () => void;
  }

  interface SMSMessage {
    id: number;
    text: string;
    sender: string;
    isFraud: boolean;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }

  let { onexit }: Props = $props();

  const totalLevels = 3;

  let gameState = $state<'intro' | 'playing' | 'paused' | 'gameOver' | 'completed'>('intro');
  let currentMessage = $state<SMSMessage | null>(null);
  let score = $state(0);
  let lives = $state(3);
  let level = $state(1);
  let messageIndex = $state(0);
  let timeRemaining = $state(10);
  let showResult = $state(false);
  let lastAnswer = $state<boolean | null>(null);
  let expectedFraudStatus = $state<boolean | null>(null);
  let streak = $state(0);
  let totalMessages = $state(0);
  let correctAnswers = $state(0);

  let messageTimer: ReturnType<typeof setInterval> | null = null;

  const levelConfig: Record<number, { messagesCount: number; timePerMessage: number }> = {
    1: { messagesCount: 5, timePerMessage: 12 },
    2: { messagesCount: 5, timePerMessage: 9 },
    3: { messagesCount: 5, timePerMessage: 7 }
  };

  const difficultyCopy: Record<SMSMessage['difficulty'], string> = {
    easy: 'Начальный риск',
    medium: 'Повышенный риск',
    hard: 'Высокий риск'
  };

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
      text: 'Срочно подтвердите операцию! Списание 25 000р. Если это не вы — введите код CVC: reply STOP',
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
      difficulty: 'medium'
    },
    {
      id: 7,
      text: 'Уважаемый клиент! Ваш кредитный лимит увеличен до 500 000р. Подробности: 8-800-100-0707',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Банк может уведомлять об изменении лимитов и указывать официальный номер для справок.',
      difficulty: 'medium'
    },
    {
      id: 8,
      text: 'НАЛОГОВАЯ: У вас задолженность 15 000р. Оплатите до 25.12 во избежание штрафа: www.nalog-pay.com',
      sender: 'NALOG-RF',
      isFraud: true,
      explanation: 'Налоговая не присылает ссылки на сторонние сайты. Официальные уведомления приходят почтой.',
      difficulty: 'medium'
    },
    {
      id: 9,
      text: 'Поступление: Зарплата ООО РОГА И КОПЫТА, 85 000,00 руб. Время: 10:15',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Обычное уведомление о поступлении средств с указанием источника.',
      difficulty: 'medium'
    },
    {
      id: 10,
      text: 'Ваш аккаунт взломан! Смените пароль: bank-security.ru/change Код: 7463',
      sender: 'BANK-SECURE',
      isFraud: true,
      explanation: 'Банки не присылают коды для смены паролей и не используют сторонние сайты.',
      difficulty: 'medium'
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

  const currentLevelConfig = $derived(levelConfig[level]);
  const levelProgress = $derived(Math.min(messageIndex, currentLevelConfig.messagesCount));
  const accuracyPercent = $derived(totalMessages > 0 ? Math.round((correctAnswers / totalMessages) * 100) : 0);

  onMount(() => {
    startIntro();
  });

  onDestroy(() => {
    clearTimers();
  });

  function handleExit() {
    clearTimers();
    onexit?.();
  }

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
    lastAnswer = null;
    expectedFraudStatus = null;
    gameStore.startGame('anti-fraud-hunter');
    showNextMessage();
  }

  function showNextMessage() {
    clearTimers();

    if (messageIndex >= currentLevelConfig.messagesCount) {
      if (level < totalLevels) {
        nextLevel();
      } else {
        endGame(true);
      }
      return;
    }

    const levelMessages = smsMessages.filter((msg) => {
      if (level === 1) return msg.difficulty === 'easy';
      if (level === 2) return msg.difficulty === 'medium';
      return msg.difficulty === 'hard';
    });

    if (!levelMessages.length) {
      console.warn('Нет сообщений для уровня', level);
      endGame(false);
      return;
    }

    const randomMessage = levelMessages[Math.floor(Math.random() * levelMessages.length)];

    if (import.meta.env.DEV) {
      console.log('Level', level, 'message', randomMessage);
    }

    currentMessage = randomMessage;
    timeRemaining = currentLevelConfig.timePerMessage;
    showResult = false;
    lastAnswer = null;
    expectedFraudStatus = null;

    startMessageTimer();
    messageIndex++;
    totalMessages++;
  }

  function startMessageTimer() {
    clearTimers();
    messageTimer = setInterval(() => {
      timeRemaining -= 1;
      if (timeRemaining <= 0) {
        handleTimeout();
      }
    }, 1000);
  }

  function handleTimeout() {
    clearTimers();
    lives -= 1;
    streak = 0;
    showFeedback(null, currentMessage?.isFraud ?? false, currentMessage?.explanation ?? 'Время истекло. Проверьте сообщение внимательнее.');

    if (lives <= 0) {
      setTimeout(() => endGame(false), 1600);
    } else {
      setTimeout(() => showNextMessage(), 1600);
    }
  }

  function handleAnswer(playerAnswer: boolean) {
    if (!currentMessage || showResult) return;

    clearTimers();
    const isCorrect = playerAnswer === currentMessage.isFraud;

    if (isCorrect) {
      const timeBonus = Math.max(0, timeRemaining * 5);
      const baseScore = 100;
      const streakBonus = streak * 12;
      const totalScore = baseScore + timeBonus + streakBonus;

      score += totalScore;
      streak++;
      correctAnswers++;
    } else {
      lives -= 1;
      streak = 0;
    }

    showFeedback(playerAnswer, currentMessage.isFraud, currentMessage.explanation);

    if (lives <= 0) {
      setTimeout(() => endGame(false), 1600);
    } else {
      setTimeout(() => showNextMessage(), 1600);
    }
  }

  function showFeedback(playerAnswer: boolean | null, correctAnswer: boolean, explanation: string) {
    lastAnswer = playerAnswer;
    expectedFraudStatus = correctAnswer;
    showResult = true;

    gameStore.updateGameState((state) => ({
      ...state,
      score: { ...state.score, current: score }
    }));
  }

  function nextLevel() {
    level += 1;
    messageIndex = 0;
    setTimeout(() => showNextMessage(), 900);
  }

  function endGame(completed: boolean) {
    clearTimers();
    gameState = completed ? 'completed' : 'gameOver';

    gameStore.completeGame({
      score,
      maxScore: 2000,
      accuracy: accuracyPercent / 100,
      correctAnswers,
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
  }
</script>

<GameLayout gameName="Стоп-мошенник" background="gradient-mystery">
  <div class="anti-fraud-game">
    {#if gameState === 'intro'}
      <section class="game-stage game-stage--intro" aria-labelledby="intro-title">
        <article class="intro-panel surface-card">
          <div class="intro-panel__icon" aria-hidden="true">
            <Shield size={40} />
          </div>
          <span class="chip intro-panel__badge">Финансовая разведка</span>
          <h1 id="intro-title" class="intro-panel__title">Стоп-мошенник</h1>
          <p class="intro-panel__subtitle text-balance">
            Распознавайте мошеннические SMS за секунды. Внимательность и скорость помогут защитить средства.
          </p>

          <div class="intro-panel__metrics">
            <div class="metric-tile">
              <span class="metric-tile__label">Жизни</span>
              <span class="metric-tile__value">3</span>
            </div>
            <div class="metric-tile">
              <span class="metric-tile__label">Уровней</span>
              <span class="metric-tile__value">{totalLevels}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-tile__label">Реакция</span>
              <span class="metric-tile__value">{levelConfig[1].timePerMessage}–{levelConfig[3].timePerMessage} сек</span>
            </div>
          </div>

          <div class="intro-panel__actions">
            <Button variant="primary" size="lg" onclick={startGame}>
              <Zap size={18} aria-hidden="true" />
              Начать тренировку
            </Button>
            {#if onexit}
              <Button variant="secondary" size="md" onclick={handleExit}>
                Вернуться назад
              </Button>
            {/if}
          </div>
        </article>
      </section>

    {:else if gameState === 'playing'}
      <section class="game-stage game-stage--playing" aria-live="polite">
        <header class="game-hud surface-card">
          <div class="hud-section">
            <div class="hud-lives">
              {#each Array(3) as _, i}
                <Heart size={16} class={`hud-heart ${i < lives ? 'hud-heart--active' : ''}`} aria-hidden="true" />
              {/each}
            </div>
          </div>
          <div class="hud-section">
            <Counter value={score} class="hud-counter" />
          </div>
          <div class="hud-section">
            <span class="hud-section__value">{level}/{totalLevels}</span>
          </div>
          <div class="hud-section hud-section--timer">
            <div class="timer-pill">
              <Clock size={14} aria-hidden="true" />
              {timeRemaining}с
            </div>
            <ProgressBar
              value={timeRemaining}
              max={currentLevelConfig.timePerMessage}
              color="electric"
              shimmer={false}
            />
          </div>
        </header>

        {#if currentMessage && !showResult}
          <article class="message-panel surface-card" aria-labelledby={`message-title-${currentMessage.id}`}>
            <div class="message-panel__header">
              <div class="message-panel__sender">
                <span class="chip chip--sender">{currentMessage.sender}</span>
                <span class="message-panel__difficulty">{difficultyCopy[currentMessage.difficulty]}</span>
              </div>
              <div class="message-panel__progress">
                <span class="progress-label">Сообщение</span>
                <span class="progress-value">{levelProgress}/{currentLevelConfig.messagesCount}</span>
              </div>
            </div>

            <div class="message-panel__body">
              <h2 id={`message-title-${currentMessage.id}`} class="message-panel__title">Новая SMS</h2>
              <p class="message-text text-balance">{currentMessage.text}</p>
            </div>

            <div class="message-panel__device" aria-hidden="true">
              <Smartphone size={46} />
            </div>
          </article>

          <div class="decision-grid" role="group" aria-label="Выберите, мошенничество это или нет">
            <button
              type="button"
              class="decision-button decision-button--fraud"
              onclick={() => handleAnswer(true)}
            >
              <AlertTriangle size={20} aria-hidden="true" />
              <span>Мошенник</span>
            </button>
            <button
              type="button"
              class="decision-button decision-button--safe"
              onclick={() => handleAnswer(false)}
            >
              <CheckCircle size={20} aria-hidden="true" />
              <span>Безопасно</span>
            </button>
          </div>
        {:else if showResult && currentMessage}
          <article class="feedback-panel surface-card" aria-live="polite">
            <div class={`feedback-icon ${lastAnswer === expectedFraudStatus ? 'feedback-icon--success' : lastAnswer === null ? 'feedback-icon--warning' : 'feedback-icon--error'}`}>
              {#if lastAnswer === null}
                <Clock size={28} aria-hidden="true" />
              {:else if lastAnswer === expectedFraudStatus}
                <CheckCircle size={28} aria-hidden="true" />
              {:else}
                <AlertTriangle size={28} aria-hidden="true" />
              {/if}
            </div>

            <div class="feedback-copy">
              <h2 class="feedback-title">
                {#if lastAnswer === null}
                  Время истекло
                {:else if lastAnswer === expectedFraudStatus}
                  Верный ответ
                {:else}
                  Ошибка
                {/if}
              </h2>
              <p class="feedback-text">{currentMessage.explanation}</p>
            </div>

            <div class="feedback-status">
              <span class="feedback-status__label">Правильный ответ</span>
              <span class={`feedback-status__value ${expectedFraudStatus ? 'is-fraud' : 'is-safe'}`}>
                {expectedFraudStatus ? 'Мошенник' : 'Безопасно'}
              </span>
            </div>

            {#if streak > 1 && lastAnswer === expectedFraudStatus}
              <span class="streak-chip">
                <Sparkles size={16} aria-hidden="true" />
                Серия: {streak}
              </span>
            {/if}
          </article>
        {/if}
      </section>

    {:else if gameState === 'gameOver'}
      <section class="game-stage game-stage--result" aria-live="polite">
        <article class="end-panel surface-card end-panel--danger">
          <div class="end-panel__icon" aria-hidden="true">
            <ShieldAlert size={36} />
          </div>
          <h2 class="end-panel__title">Игра завершена</h2>
          <p class="end-panel__subtitle text-balance">
            Вы потеряли все жизни. Попробуйте ещё раз и укрепите навыки распознавания мошенников.
          </p>

          <div class="end-panel__stats">
            <div class="end-stat">
              <Counter value={score} label="Итоговый счёт" variant="score" />
            </div>
            <div class="end-stat">
              <span class="end-stat__value">{accuracyPercent}%</span>
              <span class="end-stat__label">Точность</span>
            </div>
            <div class="end-stat">
              <span class="end-stat__value">Уровень {level}</span>
              <span class="end-stat__label">Достигнутый прогресс</span>
            </div>
          </div>

          <div class="end-panel__actions">
            <Button variant="primary" size="lg" onclick={restartGame}>
              Попробовать снова
            </Button>
            <Button variant="secondary" size="md" onclick={handleExit}>
              В главное меню
            </Button>
          </div>
        </article>
      </section>

    {:else if gameState === 'completed'}
      <section class="game-stage game-stage--result" aria-live="polite">
        <article class="end-panel surface-card end-panel--success">
          <div class="end-panel__icon" aria-hidden="true">
            <ShieldCheck size={36} />
          </div>
          <h2 class="end-panel__title">Поздравляем!</h2>
          <p class="end-panel__subtitle text-balance">
            Вы успешно прошли все уровни и заработали достижение «Anti Fraud Master».
          </p>

          <div class="end-panel__stats">
            <div class="end-stat">
              <Counter value={score} label="Итоговый счёт" variant="score" />
            </div>
            <div class="end-stat">
              <span class="end-stat__value">{accuracyPercent}%</span>
              <span class="end-stat__label">Точность</span>
            </div>
            <div class="end-stat">
              <span class="end-stat__value">{correctAnswers}/{totalMessages}</span>
              <span class="end-stat__label">Правильных ответов</span>
            </div>
          </div>

          <div class="end-panel__actions">
            <Button variant="primary" size="lg" onclick={restartGame}>
              Играть снова
            </Button>
            <Button variant="secondary" size="md" onclick={handleExit}>
              В главное меню
            </Button>
          </div>
        </article>
      </section>
    {/if}
  </div>
</GameLayout>

<style>
  .anti-fraud-game {
    display: flex;
    justify-content: center;
    align-items: stretch;
    flex: 1;
    height: 100%;
    min-height: 0;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2.5rem);
  }

  .game-stage {
    width: min(720px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
   
  }

  .game-stage--intro,
  .game-stage--result {
    align-items: center;
    text-align: center;
  }

  .intro-panel,
  .end-panel,
  .game-hud,
  .message-panel,
  .feedback-panel {
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .intro-panel {
    padding: clamp(1.5rem, 1rem + 2vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .intro-panel__icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-full);
    background: var(--gradient-brand-soft);
    color: var(--color-fg-on-brand);
    display: grid;
    place-items: center;
  }

  .intro-panel__badge {
    background: var(--layer-brand-100);
    color: var(--color-brand-700);
  }

  .intro-panel__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 1.2rem + 1vw, 1.85rem);
    color: var(--color-fg-primary);
  }

  .intro-panel__subtitle {
    margin: 0;
    max-width: 40ch;
    color: var(--color-fg-muted);
    font-size: 0.95rem;
  }

  .intro-panel__metrics {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .intro-panel__metrics .metric-tile {
    background: var(--color-surface-muted);
    border-color: var(--color-border-subtle);
    text-align: center;
    padding: 0.75rem 1rem;
    gap: 0.2rem;
  }

  .intro-panel__metrics .metric-tile__label {
    font-size: 0.7rem;
  }

  .intro-panel__metrics .metric-tile__value {
    font-size: 1.15rem;
  }

  .intro-panel__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .game-hud {
    padding: 0.75rem 1rem;
    display: grid;
    gap: 0.75rem;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
  }

  .hud-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hud-section__value {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--color-fg-primary);
  }

  .hud-section--timer {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .hud-lives {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  :global(svg.hud-heart) {
    color: var(--color-border-muted);
    transition: transform 160ms ease, color 160ms ease;
  }

  :global(svg.hud-heart--active) {
    color: var(--color-state-danger);
    transform: scale(1.05);
  }

  .hud-counter {
    font-size: 1.1rem;
  }

  .timer-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-050);
    color: var(--color-brand-700);
    font-weight: 600;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .message-panel {
    padding: clamp(1.5rem, 1rem + 2vw, 2rem);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .message-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, var(--layer-brand-150), transparent 55%);
    pointer-events: none;
  }

  .message-panel__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .message-panel__sender {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .chip--sender {
    background: var(--layer-brand-100);
    color: var(--color-brand-700);
  }

  .message-panel__difficulty {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    background: var(--color-surface-muted);
    color: var(--color-fg-secondary);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .message-panel__progress {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .progress-label {
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-size: 0.72rem;
  }

  .progress-value {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--color-fg-primary);
  }

  .message-panel__title {
    margin: 0;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-fg-muted);
  }

  .message-text {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--color-fg-primary);
  }

  .message-panel__device {
    position: absolute;
    right: clamp(1.5rem, 4vw, 2.5rem);
    bottom: clamp(1.25rem, 4vw, 2rem);
    color: color-mix(in srgb, var(--color-brand-500) 18%, transparent);
  }

  .decision-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .decision-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.85rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  }

  .decision-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }

  .decision-button:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .decision-button--fraud {
    background: linear-gradient(135deg, #d13c6a 0%, #c73360 100%);
    color: var(--color-fg-inverse);
  }

  .decision-button--fraud:hover {
    background: linear-gradient(135deg, #c73360 0%, #b82c56 100%);
  }

  .decision-button--safe {
    background: linear-gradient(135deg, #0fa9c2 0%, #1fc4d9 100%);
    color: var(--color-fg-inverse);
  }

  .decision-button--safe:hover {
    background: linear-gradient(135deg, #0e98ad 0%, #1caebd 100%);
  }

  .feedback-panel {
    padding: clamp(1.6rem, 1.2rem + 1.5vw, 2.1rem);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
    text-align: center;
  }

  .feedback-icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    display: grid;
    place-items: center;
    color: var(--color-fg-on-brand);
  }

  .feedback-icon--success {
    background: var(--gradient-brand-soft);
  }

  .feedback-icon--warning {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-state-warning) 80%, transparent) 0%,
      color-mix(in srgb, var(--color-state-warning) 60%, transparent) 100%
    );
  }

  .feedback-icon--error {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-state-danger) 85%, transparent) 0%,
      color-mix(in srgb, var(--color-state-danger) 60%, transparent) 100%
    );
  }

  .feedback-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.35rem;
    color: var(--color-fg-primary);
  }

  .feedback-text {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-fg-muted);
    max-width: 38ch;
  }

  .feedback-status {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
  }

  .feedback-status__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .feedback-status__value {
    font-family: var(--font-display);
    font-size: 1.1rem;
    padding: 0.35rem 1.1rem;
    border-radius: var(--radius-full);
  }

  .feedback-status__value.is-fraud {
    background: color-mix(in srgb, var(--color-state-danger) 18%, transparent);
    color: var(--color-state-danger);
  }

  .feedback-status__value.is-safe {
    background: color-mix(in srgb, var(--color-accent-500) 18%, transparent);
    color: var(--color-accent-600);
  }

  .streak-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.9rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-150);
    color: var(--color-fg-on-brand);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .end-panel {
    padding: clamp(1.85rem, 1.3rem + 2vw, 2.5rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .end-panel__icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    display: grid;
    place-items: center;
    color: var(--color-fg-on-brand);
  }

  .end-panel--success .end-panel__icon {
    background: var(--gradient-accent-soft);
  }

  .end-panel--danger .end-panel__icon {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-state-danger) 90%, transparent) 0%,
      color-mix(in srgb, var(--color-brand-800) 75%, transparent) 100%
    );
  }

  .end-panel__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
    color: var(--color-fg-primary);
  }

  .end-panel__subtitle {
    margin: 0;
    max-width: 38ch;
    color: var(--color-fg-muted);
    font-size: 0.95rem;
  }

  .end-panel__stats {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .end-stat {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
    text-align: center;
  }

  .end-stat__value {
    font-family: var(--font-display);
    font-size: 1.4rem;
    color: var(--color-fg-primary);
  }

  .end-stat__label {
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .end-panel__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    width: 100%;
  }

  @media (max-width: 640px) {
    .anti-fraud-game {
      padding: 1rem;
      padding-block: 1rem 1.5rem;
    }

    .game-hud {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .hud-section {
      justify-content: space-between;
    }

    .hud-section--timer {
      grid-column: 1;
    }

    .decision-grid {
      grid-template-columns: 1fr;
    }

    .message-panel__device {
      display: none;
    }
  }

</style>

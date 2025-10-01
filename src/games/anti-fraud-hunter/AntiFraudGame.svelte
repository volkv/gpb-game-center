<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gameStore } from '$lib/stores/gameStore';
  import { GameLayout } from '$lib';
  import type { SMSMessage } from './types';
  import IntroScreen from './components/IntroScreen.svelte';
  import PlayingScreen from './components/PlayingScreen.svelte';
  import EndScreen from './components/EndScreen.svelte';

  interface Props {
    onexit?: () => void;
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

  const smsMessages: SMSMessage[] = [
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
    {
      id: 16,
      text: 'СДЭК: Посылка №7812934 ожидает получения. Отсканируйте QR для оплаты: cdek-delivery.site/qr7812934',
      sender: 'CDEK-INFO',
      isFraud: true,
      explanation: 'СДЭК не запрашивает оплату через сторонние сайты. Проверяйте трек-номер на официальном сайте.',
      difficulty: 'easy'
    },
    {
      id: 17,
      text: 'WILDBERRIES: Возврат средств за заказ №234567890 задержан. Подтвердите данные карты: wb-refund.com',
      sender: 'WB-RETURN',
      isFraud: true,
      explanation: 'Маркетплейсы не запрашивают данные карты через SMS. Возвраты оформляются автоматически.',
      difficulty: 'easy'
    },
    {
      id: 18,
      text: 'Начислен кешбэк: 567,80 руб за покупки в категории АЗС. Баланс Бонусов: 3 450,12',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Банк регулярно информирует о начислении кешбэка и бонусов по программе лояльности.',
      difficulty: 'easy'
    },
    {
      id: 19,
      text: 'Пополнение: Перевод от Иванов И.И., 12 000,00 руб. Доступно на счёте: 45 678,90 руб.',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Стандартное уведомление о поступлении перевода с указанием отправителя.',
      difficulty: 'easy'
    },
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
    {
      id: 20,
      text: 'ГОСУСЛУГИ: Ваша учетная запись заблокирована. Пройдите верификацию: gosuslugi-verify.ru/check',
      sender: 'GOSUSLUGI',
      isFraud: true,
      explanation: 'Госуслуги не блокируют аккаунты через SMS и не присылают ссылки. Используйте только официальный сайт.',
      difficulty: 'medium'
    },
    {
      id: 21,
      text: 'ЖКХ: Переплата по коммунальным услугам 4 560р. Получите возврат: zhkh-refund.com/claim',
      sender: 'GKH-RETURN',
      isFraud: true,
      explanation: 'Управляющие компании не возвращают средства через сторонние сайты. Обращайтесь напрямую в УК.',
      difficulty: 'medium'
    },
    {
      id: 22,
      text: 'Уведомление: Изменение тарифа SMS-информирования с 01.01.2025. Стоимость 99р/мес. Отказ: 8-800-100-0707',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Банк информирует об изменении условий обслуживания и указывает официальный номер.',
      difficulty: 'medium'
    },
    {
      id: 23,
      text: 'Автоподписка OKKO отменена по вашему запросу. Списаний не будет. Остаток: 23 456,78 руб.',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Банк подтверждает отмену регулярных платежей и информирует об остатке на счёте.',
      difficulty: 'medium'
    },
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
      text: 'Курс валют на 26.12: USD 92.45↑ EUR 101.23↓ CNY 12.85↑ Справка: 8-800-100-0707',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Банки информируют клиентов о курсах валют. Для уточнений указывается официальный номер.',
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
    },
    {
      id: 24,
      text: 'ЦБ РФ: Проверка законности средств на счете. Подтвердите источник дохода: cbr-check.org/verify',
      sender: 'CBR-RF',
      isFraud: true,
      explanation: 'ЦБ РФ не проводит проверки через SMS. Это изощрённая схема для кражи данных и денег.',
      difficulty: 'hard'
    },
    {
      id: 25,
      text: 'Служба безопасности: Требуется обновление данных клиента до 31.12. Заполните форму: gpb-update.site',
      sender: 'GPB-SERVICE',
      isFraud: true,
      explanation: 'Банк не запрашивает обновление данных через SMS-ссылки. Используйте приложение или офис банка.',
      difficulty: 'hard'
    },
    {
      id: 26,
      text: 'Изменение условий вклада: ставка по депозиту "Управляемый" повышена до 18% годовых с 01.01.2025',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Банк уведомляет об изменении условий депозитов. Такие сообщения не содержат ссылок и запросов данных.',
      difficulty: 'hard'
    },
    {
      id: 27,
      text: 'Push-уведомления подключены для карты *5678. Контроль операций 24/7. Отключить: 8-800-100-0707',
      sender: 'GAZPROMBANK',
      isFraud: false,
      explanation: 'Банк информирует о подключении дополнительных сервисов безопасности. Указан официальный номер.',
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
      <IntroScreen
        {totalLevels}
        {levelConfig}
        onStart={startGame}
        onExit={handleExit}
      />
    {:else if gameState === 'playing'}
      <PlayingScreen
        {lives}
        {score}
        {level}
        {totalLevels}
        {timeRemaining}
        {currentLevelConfig}
        {currentMessage}
        {showResult}
        {lastAnswer}
        {expectedFraudStatus}
        {streak}
        {levelProgress}
        onAnswer={handleAnswer}
      />
    {:else if gameState === 'gameOver' || gameState === 'completed'}
      <EndScreen
        {gameState}
        {score}
        {accuracyPercent}
        {level}
        {correctAnswers}
        {totalMessages}
        onRestart={restartGame}
        onExit={handleExit}
      />
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

  @media (max-width: 640px) {
    .anti-fraud-game {
      padding: 1rem;
      padding-block: 1rem 1.5rem;
    }
  }
</style>


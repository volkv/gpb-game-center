<script lang="ts">
  import { Shield, Trophy, CheckCircle, XCircle, Star, Zap } from 'lucide-svelte';
  import { gameStore, currentGameState } from '$lib/stores/gameStore';
  import { Button, ProgressBar, GameLayout } from '$lib';

  interface Props {
    onexit?: () => void;
  }

  interface ResultStats {
    accuracy: number;
    correctAnswers: number;
    level: string;
  }

  const scorePerQuestion = 100;

  let { onexit }: Props = $props();

  let currentQuestionIndex = $state(0);
  let score = $state(0);
  let showResult = $state(false);
  let selectedAnswer = $state<number | null>(null);
  let showExplanation = $state(false);
  let resultStats = $state<ResultStats>({ accuracy: 0, correctAnswers: 0, level: 'Новичок' });

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
      explanation: 'Банки никогда не присылают ссылки для разблокировки карт в SMS. Всегда звоните в банк по номеру на обороте карты.'
    },
    {
      id: 2,
      text: 'Незнакомец звонит и говорит, что вы выиграли миллион, но нужно заплатить налог. Ваши действия?',
      answers: [
        'Заплатить налог, чтобы получить выигрыш',
        'Попросить прислать документы на выигрыш',
        'Повесить трубку — это мошенничество'
      ],
      correctAnswer: 2,
      explanation: 'Настоящие лотереи никогда не требуют предоплаты налогов. Это классическая схема мошенничества.'
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
      explanation: 'SSL-сертификат (https://) и значок замка в адресной строке — основные признаки защищённого соединения.'
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
      explanation: 'Сразу звоните в банк по номеру на банкомате или с обратной стороны карты для блокировки.'
    },
    {
      id: 5,
      text: 'Безопасно ли пользоваться общественным Wi‑Fi для банковских операций?',
      answers: [
        'Да, если сеть требует пароль',
        'Нет, публичные сети небезопасны',
        'Можно, если быстро'
      ],
      correctAnswer: 1,
      explanation: 'Публичные Wi‑Fi сети небезопасны. Для банковских операций используйте мобильный интернет.'
    }
  ];

  const currentQuestion = $derived(questions[currentQuestionIndex]);
  const progress = $derived(((currentQuestionIndex + 1) / questions.length) * 100);
  const maxScore = $derived(questions.length * scorePerQuestion);
  const isAnswerCorrect = $derived(selectedAnswer !== null && selectedAnswer === currentQuestion.correctAnswer);

  function resetGameState() {
    currentQuestionIndex = 0;
    score = 0;
    showResult = false;
    selectedAnswer = null;
    showExplanation = false;
    resultStats = { accuracy: 0, correctAnswers: 0, level: 'Новичок' };
  }

  function handleStart() {
    resetGameState();
    gameStore.startGame('quiz-shield-ruble');
  }

  function handleAnswerSelect(index: number) {
    if (showExplanation) return;
    selectedAnswer = index;
  }

  function handleAnswerSubmit() {
    if (selectedAnswer === null || showExplanation) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      score += scorePerQuestion;
    }

    showExplanation = true;
  }

  function handleNext() {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex += 1;
      selectedAnswer = null;
      showExplanation = false;
    } else {
      finishGame();
    }
  }

  function finishGame() {
    const finalScore = score;
    const totalQuestions = questions.length;
    const maxScoreValue = totalQuestions * scorePerQuestion;
    const correctAnswers = Math.round(finalScore / scorePerQuestion);
    const accuracyPercent = Math.round((finalScore / maxScoreValue) * 100);

    let level = 'Новичок';
    if (accuracyPercent >= 80) {
      level = 'Эксперт по безопасности';
    } else if (accuracyPercent >= 60) {
      level = 'Защитник';
    } else if (accuracyPercent >= 40) {
      level = 'Ученик';
    }

    gameStore.completeGame({
      score: finalScore,
      maxScore: maxScoreValue,
      correctAnswers,
      totalAnswers: totalQuestions,
      accuracy: accuracyPercent / 100
    });

    resultStats = { accuracy: accuracyPercent, correctAnswers, level };
    showResult = true;
  }

  function handleRestart() {
    handleStart();
  }
</script>

<GameLayout gameName="Щит и Рубль" background="gradient-electric" showScore={true}>
  <div class="quiz-game">
    {#if !$currentGameState || $currentGameState.status === 'idle'}
      <section class="quiz-stage quiz-stage--intro" aria-label="Информация об игре">
        <article class="intro-card surface-card">
          <div class="intro-card__icon">
            <Shield size={36} aria-hidden="true" />
          </div>

          <div class="intro-card__copy">
            <span class="chip intro-card__chip">Финансовая безопасность</span>
            <h1 class="intro-card__title">Щит и Рубль</h1>
            <p class="intro-card__subtitle text-balance">
              Проверьте, насколько уверенно вы распознаёте мошенников в повседневных сценариях.
            </p>
          </div>

          <div class="intro-card__metrics">
            <div class="intro-metric">
              <span class="intro-metric__value">{questions.length}</span>
              <span class="intro-metric__label">вопросов</span>
            </div>
            <div class="intro-metric">
              <span class="intro-metric__value">≈3</span>
              <span class="intro-metric__label">минуты</span>
            </div>
            <div class="intro-metric">
              <span class="intro-metric__value">{maxScore}</span>
              <span class="intro-metric__label">максимум очков</span>
            </div>
          </div>

          <div class="intro-card__actions">
            <Button variant="primary" size="lg" onclick={handleStart}>
              <Zap size={18} aria-hidden="true" />
              Начать тренировку
            </Button>
            {#if onexit}
              <Button variant="secondary" size="md" onclick={onexit}>
                Вернуться назад
              </Button>
            {/if}
          </div>
        </article>
      </section>
    {:else if showResult}
      <section class="quiz-stage quiz-stage--result" aria-live="polite">
        <article class="result-card surface-card">
          <div class="result-card__icon">
            <Trophy size={32} aria-hidden="true" />
          </div>

          <div>
            <h2 class="result-card__title">Вы прошли тренировку!</h2>
            <p class="result-card__subtitle text-balance">
              {resultStats.level}. Вы укрепили свою защиту от финансовых мошенников.
            </p>
          </div>

          <div class="result-score">
            <span class="result-score__label">Ваш результат</span>
            <span class="result-score__value">{score}</span>
            <div class="score-pill score-pill--accent">
              <Star size={16} aria-hidden="true" />
              <span>из {maxScore}</span>
            </div>
          </div>

          <div class="result-level">
            <span class="level-badge">
              <Shield size={16} aria-hidden="true" />
              {resultStats.level}
            </span>
          </div>

          <div class="result-metrics">
            <div class="result-metric">
              <span class="result-metric__label">Правильных</span>
              <span class="result-metric__value">{resultStats.correctAnswers}</span>
              <span class="result-metric__hint">из {questions.length}</span>
            </div>
            <div class="result-metric">
              <span class="result-metric__label">Точность</span>
              <span class="result-metric__value">{resultStats.accuracy}%</span>
            </div>
            <div class="result-metric">
              <span class="result-metric__label">Максимум</span>
              <span class="result-metric__value">{maxScore}</span>
              <span class="result-metric__hint">очков</span>
            </div>
          </div>

          <div class="result-actions">
            <Button variant="secondary" size="md" onclick={handleRestart}>
              Пройти снова
            </Button>
            <Button variant="primary" size="md" onclick={onexit}>
              Завершить
            </Button>
          </div>
        </article>
      </section>
    {:else}
      <section class="quiz-stage quiz-stage--playing" aria-live="polite">
        <header class="quiz-hud surface-card">
          <div class="quiz-hud__top">
            <div>
              <span class="quiz-hud__label">Вопрос</span>
              <p class="quiz-hud__value">
                {currentQuestionIndex + 1}
                <span class="quiz-hud__total">/ {questions.length}</span>
              </p>
            </div>
            <div class="score-pill" aria-label={`Набрано очков: ${score}`}>
              <Star size={16} aria-hidden="true" />
              <span>{score}</span>
            </div>
          </div>

          <div class="quiz-progress">
            <div class="quiz-progress__meta">
              <span>Прогресс</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} max={100} color="electric" shimmer={false} />
          </div>
        </header>

        <article class="question-card surface-card" aria-live="polite">
          <h2 class="question-text">{currentQuestion.text}</h2>
        </article>

        <div class="answer-list">
          {#each currentQuestion.answers as answer, index}
            <button
              type="button"
              class="answer-option"
              class:selected={!showExplanation && selectedAnswer === index}
              class:revealed-correct={showExplanation && index === currentQuestion.correctAnswer}
              class:revealed-incorrect={
                showExplanation &&
                selectedAnswer === index &&
                index !== currentQuestion.correctAnswer
              }
              onclick={() => handleAnswerSelect(index)}
              disabled={showExplanation}
              aria-pressed={selectedAnswer === index}
            >
              <span class="answer-option__prefix">{String.fromCharCode(65 + index)}</span>
              <span class="answer-option__text">{answer}</span>

              {#if showExplanation}
                {#if index === currentQuestion.correctAnswer}
                  <span class="answer-option__indicator" aria-hidden="true">
                    <CheckCircle size={18} />
                  </span>
                {:else if selectedAnswer === index}
                  <span class="answer-option__indicator" aria-hidden="true">
                    <XCircle size={18} />
                  </span>
                {/if}
              {/if}
            </button>
          {/each}
        </div>

        {#if showExplanation}
          <aside class="explanation-card" aria-live="polite">
            <div class="explanation-header">
              <div class={`explanation-icon ${isAnswerCorrect ? '' : 'error'}`}>
                {#if isAnswerCorrect}
                  <CheckCircle size={18} aria-hidden="true" />
                {:else}
                  <XCircle size={18} aria-hidden="true" />
                {/if}
              </div>
              <div>
                <h3 class="explanation-title">
                  {isAnswerCorrect ? 'Верно — так вы в безопасности' : 'Запомните на будущее'}
                </h3>
                <p class="explanation-text">{currentQuestion.explanation}</p>
              </div>
            </div>
          </aside>
        {/if}

        <div class="quiz-actions">
          {#if !showExplanation}
            <Button
              variant="primary"
              size="lg"
              onclick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
            >
              <CheckCircle size={18} aria-hidden="true" />
              Ответить
            </Button>
          {:else}
            <Button variant="primary" size="lg" onclick={handleNext}>
              {#if currentQuestionIndex < questions.length - 1}
                <Zap size={18} aria-hidden="true" />
                Далее
              {:else}
                <Trophy size={18} aria-hidden="true" />
                Завершить
              {/if}
            </Button>
          {/if}
        </div>
      </section>
    {/if}
  </div>
</GameLayout>

<style>
  .quiz-game {
    min-height: calc(100vh - 80px);
    padding: clamp(1.5rem, 5vw, 3rem) clamp(1rem, 5vw, 2.25rem);
    display: flex;
    justify-content: center;
    align-items: stretch;
  }

  .quiz-stage {
    width: min(640px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .quiz-stage--intro,
  .quiz-stage--result {
    margin-block: auto;
    align-items: center;
    text-align: center;
  }

  .intro-card,
  .result-card,
  .quiz-hud,
  .question-card,
  .explanation-card {
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .intro-card {
    width: 100%;
    padding: clamp(1.75rem, 3vw + 1.25rem, 2.5rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .intro-card__icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    background: var(--gradient-brand-muted);
    display: grid;
    place-items: center;
    color: var(--color-brand-600);
  }

  .intro-card__chip {
    background: var(--layer-brand-100);
    color: var(--color-brand-700);
  }

  .intro-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
    color: var(--color-fg-primary);
  }

  .intro-card__subtitle {
    margin: 0;
    color: var(--color-fg-muted);
    font-size: 0.95rem;
    max-width: 32ch;
  }

  .intro-card__metrics {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .intro-metric {
    padding: 0.85rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
  }

  .intro-metric__value {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .intro-metric__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .intro-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    width: 100%;
  }

  .result-card {
    width: 100%;
    padding: clamp(1.75rem, 3vw + 1.25rem, 2.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .result-card__icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-full);
    background: var(--gradient-accent-soft);
    display: grid;
    place-items: center;
    color: var(--color-fg-on-brand);
  }

  .result-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 1.1rem + 1vw, 1.9rem);
    color: var(--color-fg-primary);
  }

  .result-card__subtitle {
    margin: 0;
    color: var(--color-fg-muted);
    font-size: 0.95rem;
    max-width: 32ch;
  }

  .result-score {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .result-score__label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-fg-muted);
  }

  .result-score__value {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 1.8rem + 1vw, 2.8rem);
    font-weight: 700;
    color: var(--color-brand-600);
  }

  .result-level {
    display: flex;
    justify-content: center;
  }

  .level-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.1rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-150);
    color: var(--color-brand-700);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .level-badge :global(svg) {
    width: 18px;
    height: 18px;
  }

  .result-metrics {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
  }

  .result-metric {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
  }

  .result-metric__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .result-metric__value {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .result-metric__hint {
    font-size: 0.8rem;
    color: var(--color-fg-muted);
  }

  .result-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .result-actions :global(button) {
    min-width: 180px;
  }

  .quiz-hud {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .quiz-hud__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .quiz-hud__label {
    display: block;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    margin-bottom: 0.25rem;
  }

  .quiz-hud__value {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .quiz-hud__total {
    font-size: 1rem;
    color: var(--color-fg-muted);
    margin-left: 0.25rem;
  }

  .score-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-100);
    color: var(--color-brand-600);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .score-pill--accent {
    background: var(--gradient-accent-soft);
    color: var(--color-fg-on-brand);
  }

  .score-pill :global(svg) {
    width: 18px;
    height: 18px;
  }

  .quiz-progress {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quiz-progress__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .question-card {
    padding: clamp(1.5rem, 1.25rem + 1vw, 2rem);
  }

  .question-text {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 1rem + 0.8vw, 1.5rem);
    line-height: 1.35;
    color: var(--color-fg-primary);
  }

  .answer-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .answer-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.9rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    color: var(--color-fg-primary);
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease, background-color 160ms ease, color 160ms ease;
    text-align: left;
    cursor: pointer;
  }

  .answer-option:not([disabled]):hover {
    border-color: var(--layer-brand-150);
    box-shadow: var(--shadow-soft);
    transform: translateY(-1px);
  }

  .answer-option:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
  }

  .answer-option[disabled] {
    cursor: default;
  }

  .answer-option.selected {
    border-color: var(--color-brand-500);
    background: rgba(25, 25, 239, 0.08);
    box-shadow: var(--shadow-soft);
  }

  .answer-option.revealed-correct {
    border-color: var(--color-state-success);
    background: rgba(43, 180, 138, 0.12);
  }

  .answer-option.revealed-incorrect {
    border-color: var(--color-state-danger);
    background: rgba(209, 60, 106, 0.12);
  }

  .answer-option__prefix {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.95rem;
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
    flex-shrink: 0;
  }

  .answer-option.selected .answer-option__prefix,
  .answer-option.revealed-correct .answer-option__prefix {
    background: var(--color-brand-500);
    color: var(--color-fg-on-brand);
  }

  .answer-option.revealed-incorrect .answer-option__prefix {
    background: rgba(209, 60, 106, 0.18);
    color: var(--color-state-danger);
  }

  .answer-option__text {
    flex: 1;
    font-size: 0.95rem;
  }

  .answer-option__indicator {
    margin-left: 0.75rem;
    display: flex;
    align-items: center;
  }

  .answer-option.revealed-correct .answer-option__indicator {
    color: var(--color-state-success);
  }

  .answer-option.revealed-incorrect .answer-option__indicator {
    color: var(--color-state-danger);
  }

  .explanation-card {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .explanation-header {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .explanation-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background: rgba(43, 180, 138, 0.12);
    color: var(--color-state-success);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .explanation-icon.error {
    background: rgba(209, 60, 106, 0.12);
    color: var(--color-state-danger);
  }

  .explanation-title {
    margin: 0 0 0.35rem;
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--color-fg-primary);
  }

  .explanation-text {
    margin: 0;
    color: var(--color-fg-secondary);
    font-size: 0.95rem;
  }

  .quiz-actions {
    display: flex;
    justify-content: flex-end;
  }

  .quiz-actions :global(button) {
    min-width: 200px;
  }

  @media (max-width: 768px) {
    .quiz-game {
      padding: 1.5rem 1rem 2.5rem;
    }

    .quiz-hud__top {
      flex-direction: column;
      align-items: flex-start;
    }

    .score-pill {
      align-self: flex-start;
    }

    .quiz-actions :global(button) {
      min-width: 0;
      width: 100%;
    }

    .quiz-actions {
      justify-content: stretch;
    }
  }

  @media (max-width: 480px) {
    .intro-card,
    .result-card,
    .quiz-hud,
    .question-card,
    .explanation-card {
      border-radius: var(--radius-lg);
    }

    .result-actions :global(button) {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
</style>

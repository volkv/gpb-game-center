
<script lang="ts">
  import {
    Star,
    ShieldCheck,
    CheckCircle,
    XCircle,
    BookOpen,
    Zap,
    Trophy
  } from 'lucide-svelte';
  import { ProgressBar, Button } from '$lib';
  import EvidencePreview from './EvidencePreview.svelte';
  import ExpertAdvice from './ExpertAdvice.svelte';
  import type { QuizQuestion, Difficulty, MicroLesson } from '../types';

  let {
    currentQuestionIndex,
    questions,
    quizProgress,
    score,
    scorePulse,
    defenseScore,
    stageInfo,
    difficultyLabels,
    selectedAnswer,
    showExplanation,
    isAnswerCorrect,
    currentMicroLesson,
    onAnswerSelect,
    onAnswerSubmit,
    onNext
  }: {
    currentQuestionIndex: number;
    questions: QuizQuestion[];
    quizProgress: number;
    score: number;
    scorePulse: boolean;
    defenseScore: number;
    stageInfo: any;
    difficultyLabels: Record<Difficulty, string>;
    selectedAnswer: number | null;
    showExplanation: boolean;
    isAnswerCorrect: boolean;
    currentMicroLesson: MicroLesson;
    onAnswerSelect: (index: number) => void;
    onAnswerSubmit: () => void;
    onNext: () => void;
  } = $props();

  const currentQuestion = $derived(questions[currentQuestionIndex]);

</script>

<section
  class="quiz-stage quiz-stage--playing"
  aria-live="polite"
>
  <header class="quiz-hud surface-card">
    <span class="quiz-hud__question">
      {currentQuestionIndex + 1} / {questions.length}
    </span>
    <div class="quiz-hud__progress">
      <ProgressBar value={quizProgress} max={100} color="electric" shimmer={false} />
    </div>
    <div class="quiz-hud__pills">
      <div
        class="score-pill"
        class:score-pill--pulse={scorePulse}
        aria-label={`Набрано очков: ${score}`}
      >
        <Star size={16} aria-hidden="true" />
        <span>{score}</span>
      </div>
      <div
        class="score-pill score-pill--defense"
        aria-label={`Уровень защиты: ${defenseScore}`}
      >
        <ShieldCheck size={16} aria-hidden="true" />
        <span>+{defenseScore}</span>
      </div>
    </div>
  </header>

  <article class="question-card surface-card" aria-live="polite">
    {#if stageInfo.isStageStart}
      <div class="stage-banner" role="status">
        <span class="stage-banner__stage">Этап {stageInfo.stageIndex} из {stageInfo.totalStages}</span>
        <span class="stage-banner__label">{stageInfo.stageLabel}</span>
      </div>
    {/if}

    <div class="question-meta">
      <span class="question-chip">{currentQuestion.category}</span>
      <span class="question-threat">{currentQuestion.threat}</span>
      <span class={`question-difficulty question-difficulty--${currentQuestion.difficulty}`}>
        {difficultyLabels[currentQuestion.difficulty]}
      </span>
    </div>
    <h2 class="question-text">{currentQuestion.text}</h2>

    {#if currentQuestion.evidence}
      <EvidencePreview evidence={currentQuestion.evidence} />
    {/if}

    {#if currentQuestion.relatedProduct}
      <aside class="product-context-card" aria-live="polite">
        <span class="product-context-card__label">
          <ShieldCheck size={14} aria-hidden="true" />
          {currentQuestion.relatedProduct.name}
        </span>
        <p class="product-context-card__description text-balance">
          {currentQuestion.relatedProduct.description}
        </p>
        <span class="product-context-card__hint">{currentQuestion.relatedProduct.highlight}</span>
      </aside>
    {/if}

    {#if currentQuestion.tip}
      <p class="question-tip">{currentQuestion.tip}</p>
    {/if}
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
        onclick={() => onAnswerSelect(index)}
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
    <div class="post-answer-stack">
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
            <p class="explanation-text">{currentQuestion.explanation.summary}</p>
          </div>
        </div>

        <ul class="explanation-list">
          {#each currentQuestion.explanation.insights as insight}
            <li>{insight}</li>
          {/each}
        </ul>
      </aside>

      <ExpertAdvice
        title={currentQuestion.expertAdvice.title}
        items={currentQuestion.expertAdvice.recommendations}
      />

      <aside class="micro-lesson-card" aria-live="polite">
        <div class="micro-lesson-card__icon">
          <BookOpen size={18} aria-hidden="true" />
        </div>
        <div>
          <span class="micro-lesson-card__title">{currentMicroLesson.title}</span>
          <p class="micro-lesson-card__text">{currentMicroLesson.fact}</p>
        </div>
      </aside>
    </div>
  {/if}

  <div class="quiz-actions">
    {#if !showExplanation}
      <Button
        variant="primary"
        size="lg"
        onclick={onAnswerSubmit}
        disabled={selectedAnswer === null}
      >
        <CheckCircle size={18} aria-hidden="true" />
        Ответить
      </Button>
    {:else}
      <Button variant="primary" size="lg" onclick={onNext}>
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

<style>
  .quiz-stage {
    width: min(640px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .quiz-hud {
    padding: 1rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-sm);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .quiz-hud__question {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-fg-default);
    white-space: nowrap;
  }

  .quiz-hud__progress {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  .quiz-hud__progress :global(.progress-container) {
    width: 100%;
  }

  .quiz-hud__progress :global(.progress-bar) {
    height: 4px !important;
    border-radius: var(--radius-full);
    background: var(--color-border-muted);
    overflow: hidden;
    position: relative;
  }

  .quiz-hud__progress :global(.progress-fill) {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 300ms ease;
  }

  .quiz-hud__pills {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
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
    transition: transform 220ms ease, box-shadow 220ms ease;
  }

  .score-pill--pulse {
    animation: score-pulse 420ms ease;
    box-shadow: var(--shadow-soft);
  }

  .score-pill--defense {
    background: var(--layer-brand-080);
    color: var(--color-brand-700);
  }

  .score-pill :global(svg) {
    width: 18px;
    height: 18px;
  }

  .question-card {
    padding: clamp(1.5rem, 1.25rem + 1vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .stage-banner {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-080);
    color: var(--color-brand-700);
    margin-bottom: 0.75rem;
  }

  .stage-banner__stage {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
  }

  .stage-banner__label {
    font-family: var(--font-display);
    font-size: 1rem;
  }

  .question-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .question-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .question-threat {
    display: inline-flex;
    padding: 0.3rem 0.65rem;
    border-radius: var(--radius-lg);
    background: rgba(255, 214, 107, 0.18);
    color: rgba(156, 105, 9, 0.85);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .question-difficulty {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.7rem;
    border-radius: var(--radius-lg);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .question-difficulty--easy {
    background: var(--layer-brand-050);
    color: var(--color-brand-600);
  }

  .question-difficulty--medium {
    background: rgba(255, 214, 107, 0.22);
    color: rgba(156, 105, 9, 0.85);
  }

  .question-difficulty--hard {
    background: rgba(209, 60, 106, 0.18);
    color: var(--color-state-danger);
  }

  .question-text {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 1rem + 0.8vw, 1.5rem);
    line-height: 1.35;
    color: var(--color-fg-primary);
  }

  .product-context-card {
    margin-top: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .product-context-card__label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .product-context-card__description {
    margin: 0;
    color: var(--color-fg-primary);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .product-context-card__hint {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .question-tip {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-fg-secondary);
    border-left: 3px solid var(--color-brand-500);
    padding-left: 0.65rem;
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

  .post-answer-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .explanation-card {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
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

  .explanation-list {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--color-fg-secondary);
    font-size: 0.9rem;
  }

  .explanation-list li {
    line-height: 1.45;
  }

  .micro-lesson-card {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.1rem 1.25rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
  }

  .micro-lesson-card__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: var(--layer-mint-080);
    color: var(--color-accent-500);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .micro-lesson-card__title {
    display: inline-block;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    margin-bottom: 0.2rem;
  }

  .micro-lesson-card__text {
    margin: 0;
    color: var(--color-fg-secondary);
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .quiz-actions {
    display: flex;
    justify-content: flex-end;
  }

  .quiz-actions :global(button) {
    min-width: 200px;
    width: 100%;
  }

  @keyframes score-pulse {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1);
    }
  }
</style>

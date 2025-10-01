
<script lang="ts">
  import { Shield, Zap, BarChart3 } from 'lucide-svelte';
  import { Button, ProgressBar } from '$lib';
  import type { LevelOverview } from '../types';
  import type { QuizQuestion } from '../types';

  let { 
    questions, 
    maxScore, 
    levelOverview, 
    hasRecordedSessions,
    isProgressLoaded,
    onStart,
    onStatsOpen
  }: {
    questions: QuizQuestion[];
    maxScore: number;
    levelOverview: LevelOverview;
    hasRecordedSessions: boolean;
    isProgressLoaded: boolean;
    onStart: () => void;
    onStatsOpen: () => void;
  } = $props();
</script>

<section
  class="quiz-stage quiz-stage--intro"
  aria-label="Информация об игре"
>
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

    {#if hasRecordedSessions}
      <div class="intro-card__progress" aria-live="polite">
        <div class="intro-progress__header">
          <span class="intro-progress__label">Ваш уровень</span>
          <span class="intro-progress__value">{levelOverview.name}</span>
        </div>
        <p class="intro-progress__hint text-balance">{levelOverview.description}</p>
        <ProgressBar
          value={levelOverview.progressPercent}
          max={100}
          color="wealth"
          shimmer={false}
          showPercentage={false}
          class="intro-progress__bar"
        />
        {#if levelOverview.nextName}
          <span class="intro-progress__next">До уровня «{levelOverview.nextName}»: {levelOverview.xpToNext} XP</span>
        {:else}
          <span class="intro-progress__next">Вы на вершине — продолжайте тренировки для закрепления навыков.</span>
        {/if}
      </div>
    {/if}

    <div class="intro-card__actions">
      <Button variant="primary" size="lg" onclick={onStart}>
        <Zap size={18} aria-hidden="true" />
        Начать тренировку
      </Button>
      <Button variant="secondary" size="md" onclick={onStatsOpen} disabled={!isProgressLoaded}>
        <BarChart3 size={16} aria-hidden="true" />
        Статистика и достижения
      </Button>
    </div>
  </article>
</section>

<style>
  .quiz-stage {
    width: min(640px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .quiz-stage--intro {
    align-items: center;
    text-align: center;
  }

  .intro-card {
    width: 100%;
    padding: clamp(1.75rem, 3vw + 1.25rem, 2.5rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
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

  .intro-card__copy {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .chip {
    align-self: center;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-weight: 600;
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
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .intro-metric {
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: row;
    gap: 0.4rem;
    align-items: center;
  }

  .intro-metric__value {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .intro-metric__label {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    white-space: nowrap;
  }

  .intro-card__progress {
    width: 100%;
    padding: 1.1rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    text-align: left;
  }

  .intro-progress__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .intro-progress__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .intro-progress__value {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--color-fg-primary);
  }

  .intro-progress__hint {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-fg-muted);
  }


  .intro-progress__next {
    font-size: 0.8rem;
    color: var(--color-fg-muted);
  }

  .intro-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    width: 100%;
  }

  @media (max-width: 480px) {
    .intro-metric {
      padding: 0.4rem 0.6rem;
      gap: 0.3rem;
    }

    .intro-metric__value {
      font-size: 1rem;
    }

    .intro-metric__label {
      font-size: 0.65rem;
    }
  }
</style>

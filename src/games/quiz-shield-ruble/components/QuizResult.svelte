
<script lang="ts">
  import {
    Trophy,
    Star,
    Shield,
    ShieldCheck,
    BarChart3
  } from 'lucide-svelte';
  import { Button, ProgressBar } from '$lib';
  import ReminderOptIn from './ReminderOptIn.svelte';
  import type { AchievementView, LevelOverview, ResultStats, QuizQuestion } from '../types';
  import type { ReminderSettingsState, ReminderPermissionState } from '../notifications';

  let {
    resultStats,
    score,
    scorePulse,
    maxScore,
    questions,
    defenseScore,
    maxDefenseScore,
    defenseProgress,
    levelOverview,
    reminderSettings,
    reminderProcessing,
    nextReminderFireAt,
    recentAchievements,
    finalCtaMessage,
    isProgressLoaded,
    onexit,
    onStatsOpen,
    onRestart,
    onReminderEnable,
    onReminderDisable
  }: {
    resultStats: ResultStats;
    score: number;
    scorePulse: boolean;
    maxScore: number;
    questions: QuizQuestion[];
    defenseScore: number;
    maxDefenseScore: number;
    defenseProgress: number;
    levelOverview: LevelOverview;
    reminderSettings: ReminderSettingsState;
    reminderProcessing: boolean;
    nextReminderFireAt: number | undefined;
    recentAchievements: AchievementView[];
    finalCtaMessage: string;
    isProgressLoaded: boolean;
    onexit?: () => void;
    onStatsOpen: () => void;
    onRestart: () => void;
    onReminderEnable: () => void;
    onReminderDisable: () => void;
  } = $props();

  const reminderPermission = $derived<ReminderPermissionState>(reminderSettings.permission);

</script>

<section
  class="quiz-stage quiz-stage--result"
  aria-live="polite"
>
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
      <span class="result-score__value" class:result-score__value--pulse={scorePulse}>{score}</span>
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

    <div class="result-defense" aria-live="polite">
      <div class="result-defense__icon">
        <ShieldCheck size={20} aria-hidden="true" />
      </div>
      <div class="result-defense__body">
        <span class="result-defense__label">Защитные бонусы</span>
        <div class="result-defense__values">
          <span class="result-defense__score">+{defenseScore}</span>
          <span class="result-defense__hint">из {maxDefenseScore}</span>
        </div>
        <ProgressBar
          value={defenseProgress}
          max={100}
          color="wealth"
          shimmer={false}
          showPercentage={false}
          class="result-defense__progress"
        />
        <span class="result-defense__percent">{defenseProgress}% защитного потенциала</span>
      </div>
    </div>

    <div class="result-level-progress" aria-live="polite">
      <div class="result-level-progress__header">
        <span class="result-level-progress__label">Прогресс профиля</span>
        <span class="result-level-progress__value">{levelOverview.name}</span>
      </div>
      <ProgressBar
        value={levelOverview.progressPercent}
        max={100}
        color="wealth"
        shimmer={false}
        showPercentage={false}
        class="result-level-progress__bar"
      />
      <span class="result-level-progress__hint">
        {#if levelOverview.nextName}
          До уровня «{levelOverview.nextName}»: {levelOverview.xpToNext} XP
        {:else}
          Вы достигли мастерства — продолжайте закреплять навыки.
        {/if}
      </span>
    </div>

    <ReminderOptIn
      enabled={reminderSettings.enabled}
      permission={reminderPermission}
      isProcessing={reminderProcessing}
      onEnable={onReminderEnable}
      onDisable={onReminderDisable}
      nextFireAt={nextReminderFireAt}
    />

    {#if recentAchievements.length > 0}
      <div class="result-achievements" aria-live="polite">
        <span class="result-achievements__label">Новые достижения</span>
        <ul class="result-achievements__list">
          {#each recentAchievements as achievement}
            <li class="result-achievements__item">
              <span class="result-achievements__icon">
                {#if achievement.icon}
                  {@const IconComponent = achievement.icon}
                  <IconComponent aria-hidden="true" />
                {/if}
              </span>
              <span class="result-achievements__title">{achievement.title}</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="result-actions">
      <Button variant="secondary" size="md" onclick={onStatsOpen} disabled={!isProgressLoaded}>
        <BarChart3 size={16} aria-hidden="true" />
        Статистика
      </Button>
      <Button variant="secondary" size="md" onclick={onRestart}>
        Пройти снова
      </Button>
      {#if onexit}
        <Button variant="primary" size="md" onclick={onexit}>
          Завершить
        </Button>
      {/if}
    </div>
  </article>

  <article class="cta-card surface-card" aria-live="polite">
    <div class="cta-card__header">
      <div class="cta-card__icon">
        <ShieldCheck size={24} aria-hidden="true" />
      </div>
      <div>
        <span class="cta-card__eyebrow">Персональное предложение</span>
        <h3 class="cta-card__title">Страхование карт и счетов</h3>
      </div>
    </div>
    <p class="cta-card__lead text-balance">{finalCtaMessage}</p>
    <ul class="cta-card__bullets">
      <li>Компенсация при подтверждённых мошеннических транзакциях</li>
      <li>Круглосуточное сопровождение и помощь в оформлении заявления</li>
      <li>Защита операций по картам, счетам и в мобильном банке</li>
    </ul>
    <div class="cta-card__actions">
      <Button
        variant="primary"
        size="md"
        href="https://www.gazprombank.ru/personal/insurance/insurance_cards/"
        target="_blank"
        rel="noreferrer noopener"
      >
        <ShieldCheck size={18} aria-hidden="true" />
        Усилить защиту
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

  .quiz-stage--result {
    align-items: center;
    text-align: center;
  }

  .result-card {
    width: 100%;
    padding: clamp(1.75rem, 3vw + 1.25rem, 2.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
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
    transition: transform 220ms ease;
  }

  .result-score__value--pulse {
    animation: score-pulse 420ms ease;
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

  .result-defense {
    width: 100%;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
  }

  .result-defense__icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-full);
    background: var(--gradient-brand-muted);
    display: grid;
    place-items: center;
    color: var(--color-brand-600);
  }

  .result-defense__body {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    align-items: flex-start;
    width: 100%;
  }

  .result-defense__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .result-defense__values {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .result-defense__score {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .result-defense__hint {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }


  .result-defense__percent {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .result-level-progress {
    width: 100%;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  .result-level-progress__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .result-level-progress__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .result-level-progress__value {
    font-family: var(--font-display);
    font-size: 1.05rem;
    color: var(--color-fg-primary);
  }


  .result-level-progress__hint {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .result-achievements {
    width: 100%;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .result-achievements__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .result-achievements__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    justify-content: center;
  }

  .result-achievements__item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.9rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-100);
    color: var(--color-brand-600);
    font-weight: 600;
    font-size: 0.85rem;
  }

  .result-achievements__icon {
    display: grid;
    place-items: center;
  }

  .result-achievements__title {
    white-space: nowrap;
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

  .cta-card {
    margin-top: 1.5rem;
    padding: clamp(1.5rem, 1.25rem + 1vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
  }

  .cta-card__header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .cta-card__icon {
    width: 54px;
    height: 54px;
    border-radius: var(--radius-full);
    background: var(--gradient-accent-soft);
    display: grid;
    place-items: center;
    color: var(--color-fg-on-brand);
  }

  .cta-card__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .cta-card__title {
    margin: 0.25rem 0 0;
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 1rem + 1vw, 1.6rem);
    color: var(--color-fg-primary);
  }

  .cta-card__lead {
    margin: 0;
    color: var(--color-fg-muted);
    line-height: 1.5;
  }

  .cta-card__bullets {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--color-fg-primary);
  }

  .cta-card__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
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

<script lang="ts">
  import { Button, ProgressBar } from '$lib';
  import { BarChart3, Sparkles } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import type { ComponentType } from 'svelte';

  export interface LevelOverview {
    name: string;
    description: string;
    xp: number;
    progressPercent: number;
    nextName?: string;
    xpToNext?: number;
  }

  export interface SummaryMetrics {
    totalSessions: number;
    bestScore: number;
    bestAccuracy: number;
    averageAccuracy: number;
    bestDefense: number;
    totalCorrect: number;
    totalQuestions: number;
  }

  export interface FavoriteCategory {
    name: string;
    accuracy: number;
    total: number;
    bestStreak: number;
  }

  export interface AchievementView {
    id: string;
    title: string;
    description: string;
    icon: ComponentType;
    unlocked: boolean;
    unlockedAt?: string;
    progressLabel: string;
    isNew?: boolean;
  }

  interface Props {
    levelInfo: LevelOverview;
    metrics: SummaryMetrics;
    favoriteCategories: FavoriteCategory[];
    achievements: AchievementView[];
    hasHistory: boolean;
    isLoaded: boolean;
    onClose?: () => void;
  }

  let {
    levelInfo,
    metrics,
    favoriteCategories,
    achievements,
    hasHistory,
    isLoaded,
    onClose
  }: Props = $props();

  const unlockedCount = $derived(achievements.filter((achievement) => achievement.unlocked).length);
  const averageAccuracyText = $derived(() => `${metrics.averageAccuracy}%`);

  onMount(() => {
    // sync focus to container for accessibility when stats open
    requestAnimationFrame(() => {
      const container = document.querySelector<HTMLDivElement>('[data-stats-dashboard]');
      container?.focus();
    });
  });

  function handleClose() {
    onClose?.();
  }
</script>

<div class="stats-dashboard" data-stats-dashboard tabindex="-1">
  <header class="stats-header">
    <div>
      <span class="stats-eyebrow">Мотивация</span>
      <h2 class="stats-title">Статистика и достижения</h2>
    </div>
    <Button variant="secondary" size="sm" onclick={handleClose} aria-label="Закрыть статистику">
      Закрыть
    </Button>
  </header>

  {#if !isLoaded}
    <article class="stats-card surface-card stats-card--placeholder" aria-live="polite">
      <div class="stats-placeholder">
        <Sparkles size={20} aria-hidden="true" />
        <p class="stats-placeholder__text">Загружаем ваши предыдущие тренировки…</p>
      </div>
    </article>
  {:else if !hasHistory}
    <article class="stats-card surface-card stats-card--placeholder" aria-live="polite">
      <div class="stats-placeholder">
        <BarChart3 size={20} aria-hidden="true" />
        <p class="stats-placeholder__text text-balance">
          Статистика появится после первой тренировки. Пройдите квиз, чтобы отслеживать прогресс и открывать
          достижения.
        </p>
        <Button variant="primary" size="md" onclick={handleClose}>Вернуться к старту</Button>
      </div>
    </article>
  {:else}
    <article class="stats-card surface-card stats-card--level" aria-live="polite">
      <div class="stats-card__header">
        <span class="stats-card__eyebrow">Личный прогресс</span>
        <h3 class="stats-card__title">{levelInfo.name}</h3>
      </div>
      <p class="stats-card__description text-balance">{levelInfo.description}</p>
      <ProgressBar
        value={levelInfo.progressPercent}
        max={100}
        color="wealth"
        showPercentage={false}
        shimmer={false}
      />
      <div class="stats-level__footer">
        <span class="stats-level__xp">XP: {levelInfo.xp}</span>
        <span class="stats-level__next">
          {#if levelInfo.nextName}
            До «{levelInfo.nextName}»: {levelInfo.xpToNext} XP
          {:else}
            Максимальный уровень достигнут — поддерживайте форму!
          {/if}
        </span>
      </div>
    </article>

    <article class="stats-card surface-card">
      <div class="stats-card__header stats-card__header--compact">
        <span class="stats-card__eyebrow">Ключевые показатели</span>
        <span class="stats-card__hint">Обновлено за все сессии</span>
      </div>
      <div class="stats-metrics">
        <div class="stats-metric">
          <span class="stats-metric__label">Сессий</span>
          <span class="stats-metric__value">{metrics.totalSessions}</span>
        </div>
        <div class="stats-metric">
          <span class="stats-metric__label">Средняя точность</span>
          <span class="stats-metric__value">{averageAccuracyText}</span>
        </div>
        <div class="stats-metric">
          <span class="stats-metric__label">Лучший результат</span>
          <span class="stats-metric__value">{metrics.bestScore}</span>
        </div>
        <div class="stats-metric">
          <span class="stats-metric__label">Лучший щит</span>
          <span class="stats-metric__value">+{metrics.bestDefense}</span>
        </div>
      </div>
      <div class="stats-metric-footnote">
        <span>Правильных ответов: {metrics.totalCorrect} из {metrics.totalQuestions}</span>
      </div>
    </article>

    <article class="stats-card surface-card">
      <div class="stats-card__header">
        <span class="stats-card__eyebrow">Любимые темы</span>
        <h3 class="stats-card__title">Где вы сильнее всего</h3>
      </div>
      {#if favoriteCategories.length > 0}
        <ul class="stats-category-list">
          {#each favoriteCategories as category}
            <li class="stats-category-item">
              <div class="stats-category__header">
                <span class="stats-category__name">{category.name}</span>
                <span class="stats-category__accuracy">{category.accuracy}%</span>
              </div>
              <div class="stats-category__meta">
                <span>Всего вопросов: {category.total}</span>
                <span>Серия: {category.bestStreak}</span>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="stats-placeholder__text">История по темам появится после нескольких тренировок.</p>
      {/if}
    </article>

    <article class="stats-card surface-card">
      <div class="stats-card__header">
        <span class="stats-card__eyebrow">Достижения</span>
        <h3 class="stats-card__title">{unlockedCount} из {achievements.length} открыто</h3>
      </div>
      <ul class="stats-achievements">
        {#each achievements as achievement}
          <li
            class="stats-achievement"
            class:stats-achievement--unlocked={achievement.unlocked}
            aria-live={achievement.isNew ? 'polite' : undefined}
          >
            <div class="stats-achievement__icon" aria-hidden="true">
              {@render achievement.icon({ size: 20 })}
            </div>
            <div class="stats-achievement__body">
              <span class="stats-achievement__title">{achievement.title}</span>
              <span class="stats-achievement__description text-balance">{achievement.description}</span>
              <span class="stats-achievement__status">{achievement.progressLabel}</span>
            </div>
            {#if achievement.isNew}
              <span class="stats-achievement__badge">Новое</span>
            {/if}
          </li>
        {/each}
      </ul>
    </article>
  {/if}
</div>

<style>
  .stats-dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    outline: none;
  }

  .stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .stats-eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .stats-title {
    margin: 0.2rem 0 0;
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 1.1rem + 0.5vw, 1.6rem);
    color: var(--color-fg-primary);
  }

  .stats-card {
    padding: clamp(1.25rem, 1rem + 1vw, 1.75rem);
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
  }

  .stats-card--placeholder {
    align-items: center;
    text-align: center;
  }

  .stats-card__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .stats-card__header--compact {
    gap: 0.15rem;
  }

  .stats-card__eyebrow {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    font-weight: 600;
  }

  .stats-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
    color: var(--color-fg-primary);
  }

  .stats-card__description {
    margin: 0;
    color: var(--color-fg-muted);
    font-size: 0.95rem;
  }

  .stats-card__hint {
    font-size: 0.75rem;
    color: var(--color-fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .stats-level__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .stats-level__xp {
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .stats-level__next {
    font-style: italic;
  }

  .stats-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .stats-metric {
    padding: 0.9rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: flex-start;
  }

  .stats-metric__label {
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .stats-metric__value {
    font-family: var(--font-display);
    font-size: 1.3rem;
    color: var(--color-fg-primary);
  }

  .stats-metric-footnote {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .stats-category-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stats-category-item {
    padding: 0.85rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .stats-category__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .stats-category__name {
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .stats-category__accuracy {
    font-family: var(--font-display);
    color: var(--color-brand-600);
  }

  .stats-category__meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--color-fg-muted);
    flex-wrap: wrap;
  }

  .stats-achievements {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .stats-achievement {
    display: flex;
    gap: 0.9rem;
    align-items: flex-start;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-muted);
    position: relative;
  }

  .stats-achievement--unlocked {
    border-color: var(--color-brand-300);
    background: var(--layer-brand-050);
  }

  .stats-achievement__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    background: var(--layer-brand-150);
    display: grid;
    place-items: center;
    color: var(--color-brand-600);
    flex-shrink: 0;
  }

  .stats-achievement__body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stats-achievement__title {
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .stats-achievement__description {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .stats-achievement__status {
    font-size: 0.8rem;
    color: var(--color-brand-600);
  }

  .stats-achievement__badge {
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: var(--color-brand-500);
    color: var(--color-fg-on-brand);
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-full);
  }

  .stats-placeholder {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--color-fg-muted);
  }

  .stats-placeholder__text {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-fg-muted);
  }

  @media (max-width: 520px) {
    .stats-header {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .stats-header :global(button) {
      width: 100%;
    }

    .stats-metric {
      align-items: center;
    }

    .stats-level__footer {
      justify-content: center;
    }
  }
</style>

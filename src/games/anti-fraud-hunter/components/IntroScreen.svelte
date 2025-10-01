<script lang="ts">
  import { Shield, Zap } from 'lucide-svelte';
  import { Button } from '$lib';

  interface Props {
    totalLevels: number;
    levelConfig: Record<number, { messagesCount: number; timePerMessage: number }>;
    onStart: () => void;
    onExit?: () => void;
  }

  let { totalLevels, levelConfig, onStart, onExit }: Props = $props();
</script>

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
      <Button variant="primary" size="lg" onclick={onStart}>
        <Zap size={18} aria-hidden="true" />
        Начать тренировку
      </Button>
      {#if onExit}
        <Button variant="secondary" size="md" onclick={onExit}>
          Вернуться назад
        </Button>
      {/if}
    </div>
  </article>
</section>

<style>
  .game-stage {
    width: min(720px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .game-stage--intro {
    align-items: center;
    text-align: center;
  }

  .intro-panel {
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
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

  .metric-tile {
    background: var(--color-surface-muted);
    border-color: var(--color-border-subtle);
    text-align: center;
    padding: 0.75rem 1rem;
    gap: 0.2rem;
  }

  .metric-tile__label {
    font-size: 0.7rem;
  }

  .metric-tile__value {
    font-size: 1.15rem;
  }

  .intro-panel__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }
</style>

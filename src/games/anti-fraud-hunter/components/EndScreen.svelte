<script lang="ts">
  import { ShieldAlert, ShieldCheck } from 'lucide-svelte';
  import { Button, Counter } from '$lib';

  interface Props {
    gameState: 'gameOver' | 'completed';
    score: number;
    accuracyPercent: number;
    level: number;
    correctAnswers: number;
    totalMessages: number;
    onRestart: () => void;
    onExit?: () => void;
  }

  let { gameState, score, accuracyPercent, level, correctAnswers, totalMessages, onRestart, onExit }: Props = $props();
</script>

<section class="game-stage game-stage--result" aria-live="polite">
  {#if gameState === 'gameOver'}
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
        <Button variant="primary" size="lg" onclick={onRestart}>
          Попробовать снова
        </Button>
        {#if onExit}
          <Button variant="secondary" size="md" onclick={onExit}>
            В главное меню
          </Button>
        {/if}
      </div>
    </article>
  {:else if gameState === 'completed'}
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
        <Button variant="primary" size="lg" onclick={onRestart}>
          Играть снова
        </Button>
        {#if onExit}
          <Button variant="secondary" size="md" onclick={onExit}>
            В главное меню
          </Button>
        {/if}
      </div>
    </article>
  {/if}
</section>

<style>
  .game-stage {
    width: min(720px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .game-stage--result {
    align-items: center;
    text-align: center;
  }

  .end-panel {
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    box-shadow: var(--shadow-soft);
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
</style>

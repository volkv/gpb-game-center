<script lang="ts">
  import { Lightbulb } from 'lucide-svelte';

  interface Props {
    title: string;
    items: string[];
  }

  let { title, items }: Props = $props();
</script>

<aside class="expert-advice-card surface-card" aria-label={title}>
  <div class="expert-advice-card__header">
    <span class="expert-advice-card__icon">
      <Lightbulb size={18} aria-hidden="true" />
    </span>
    <h4 class="expert-advice-card__title">{title}</h4>
  </div>

  <ul class="expert-advice-card__list">
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</aside>

<style>
  .expert-advice-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.1rem 1.25rem;
    border-radius: var(--radius-xl);
  }

  .expert-advice-card__header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .expert-advice-card__icon {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-full);
    background: var(--layer-brand-080);
    color: var(--color-brand-600);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .expert-advice-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--color-fg-primary);
  }

  .expert-advice-card__list {
    margin: 0;
    padding-left: 1.05rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--color-fg-secondary);
    font-size: 0.9rem;
  }

  .expert-advice-card__list li {
    line-height: 1.4;
  }

</style>

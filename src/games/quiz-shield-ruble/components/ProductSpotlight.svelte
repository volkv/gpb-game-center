<script lang="ts">
  import type { ComponentType } from 'svelte';
  import { Button } from '$lib';

  export interface ProductSpotlightData {
    id: string;
    name: string;
    tagline: string;
    description: string;
    features: string[];
    bonusLabel: string;
    bonusValue: number;
    icon: ComponentType;
    contextLabel: string;
    cta?: {
      label: string;
      href?: string;
      external?: boolean;
    };
  }

  interface Props {
    product: ProductSpotlightData;
    onContinue: () => void;
  }

  let { product, onContinue }: Props = $props();
  const IconComponent = $derived(product.icon);
</script>

<section class="product-card surface-card" aria-live="polite">
  <header class="product-card__header">
    <span class="product-card__badge">Бонус от банка</span>
    <span class="product-card__context">{product.contextLabel}</span>
  </header>

  <div class="product-card__icon" aria-hidden="true">
    <IconComponent size={32} />
  </div>

  <div class="product-card__body">
    <span class="product-card__tagline">{product.tagline}</span>
    <h2 class="product-card__title">{product.name}</h2>
    <p class="product-card__description text-balance">{product.description}</p>

    <div class="product-card__bonus" aria-label={`${product.bonusLabel}: +${product.bonusValue}`}>
      <span class="product-card__bonus-label">{product.bonusLabel}</span>
      <span class="product-card__bonus-value">+{product.bonusValue}</span>
    </div>

    <ul class="product-card__features">
      {#each product.features as feature}
        <li>{feature}</li>
      {/each}
    </ul>
  </div>

  <footer class="product-card__actions">
    {#if product.cta}
      <Button
        variant="secondary"
        size="md"
        href={product.cta.href}
        target={product.cta.external ? '_blank' : undefined}
        rel={product.cta.external ? 'noreferrer noopener' : undefined}
      >
        {product.cta.label}
      </Button>
    {/if}

    <Button variant="primary" size="lg" onclick={onContinue}>
      Продолжить тренинг
    </Button>
  </footer>
</section>

<style>
  .product-card {
    padding: clamp(1.5rem, 1.25rem + 1vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-muted);
    background: linear-gradient(135deg, rgba(32, 74, 135, 0.12), rgba(52, 165, 207, 0.18));
    text-align: left;
  }

  .product-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .product-card__badge {
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-100);
    color: var(--color-brand-700);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
  }

  .product-card__context {
    font-size: 0.85rem;
    color: var(--color-fg-muted);
  }

  .product-card__icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-full);
    background: var(--color-surface-muted);
    display: grid;
    place-items: center;
    color: var(--color-brand-600);
  }

  .product-card__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .product-card__tagline {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-500);
    font-weight: 600;
  }

  .product-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 1rem + 0.8vw, 1.6rem);
    color: var(--color-fg-primary);
  }

  .product-card__description {
    margin: 0;
    color: var(--color-fg-muted);
    line-height: 1.45;
  }

  .product-card__bonus {
    display: inline-flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-080);
    color: var(--color-brand-700);
    font-weight: 600;
  }

  .product-card__bonus-label {
    font-size: 0.8rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .product-card__bonus-value {
    font-family: var(--font-display);
    font-size: 1.1rem;
  }

  .product-card__features {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    color: var(--color-fg-primary);
    line-height: 1.4;
  }

  .product-card__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

</style>

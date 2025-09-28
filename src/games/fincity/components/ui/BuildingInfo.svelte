<script lang="ts">
  import { Button, Modal } from '.';
  import { Badge } from '$lib';
  import { modal, closeModal } from '../../stores/ui';
  import { getProductByBuildingType } from '../../lib/ProductCatalog';
  import { productIntegration } from '../../lib/ProductIntegration';
  import { trackProductLearning } from '../../stores/quests';
  import { BuildingType } from '../../types/Building';
  import { Building, Shield, TrendingUp, CheckCircle, Star, Book } from 'lucide-svelte';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const isOpen = $derived($modal.type === 'building_info' && $modal.isOpen);
  const buildingType = $derived($modal.data?.buildingType as BuildingType | undefined);
  const product = $derived(buildingType ? getProductByBuildingType(buildingType) : null);

  function handleLearnMore() {
    if (product) {
      productIntegration.navigateToProduct(product, 'building_info_modal');
      closeModal();
    }
  }

  function handleViewDetails() {
    if (product) {
      productIntegration.viewProductDetails(product, 'building_info_modal');
      trackProductLearning(product.id);
    }
  }

  $effect(() => {
    if (isOpen && product) {
      handleViewDetails();
    }
  });

  function getDifficultyVariant(difficulty: string) {
    switch (difficulty) {
      case 'beginner':
        return 'new';
      case 'intermediate':
        return 'hot';
      case 'advanced':
        return 'pro';
      default:
        return 'online';
    }
  }

  function getDifficultyText(difficulty: string) {
    switch (difficulty) {
      case 'beginner':
        return 'Для начинающих';
      case 'intermediate':
        return 'Средний уровень';
      case 'advanced':
        return 'Для опытных';
      default:
        return 'Не указан';
    }
  }

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'savings':
        return Building;
      case 'investment':
        return TrendingUp;
      case 'protection':
        return Shield;
      case 'services':
        return Star;
      case 'education':
        return Book;
      default:
        return Building;
    }
  }
</script>

{#if isOpen && product}
  <Modal
    open={isOpen}
    onclose={closeModal}
    size="lg"
    class="building-info-modal {className}"
  >
    {#snippet header()}
      {@const IconComponent = getCategoryIcon(product.category)}
      <div class="building-info__header">
        <div class="building-info__icon">
          <IconComponent size={28} />
        </div>
        <div class="building-info__heading">
          <Badge variant={getDifficultyVariant(product.difficulty)} size="sm">
            {getDifficultyText(product.difficulty)}
          </Badge>
          <h1 class="building-info__title">{product.title}</h1>
          <p class="building-info__subtitle">{product.subtitle}</p>
        </div>
        <Badge variant="pro" size="sm" class="building-info__category">
          {product.category === 'savings'
            ? 'Накопления'
            : product.category === 'investment'
              ? 'Инвестиции'
              : product.category === 'protection'
                ? 'Защита'
                : product.category === 'services'
                  ? 'Услуги'
                  : product.category === 'education'
                    ? 'Обучение'
                    : 'Продукт'}
        </Badge>
      </div>
    {/snippet}

    <div class="building-info__content">
      <section class="building-info__section">
        <div class="building-info__section-heading">
          <Book size={18} />
          <h2>О продукте</h2>
        </div>
        <p>{product.detailedDescription}</p>
      </section>

      {#if product.benefits.length > 0}
        <section class="building-info__section">
          <div class="building-info__section-heading">
            <CheckCircle size={18} />
            <h2>Преимущества</h2>
          </div>
          <ul class="building-info__list">
            {#each product.benefits as benefit}
              <li>
                <Badge variant="new" size="sm" class="building-info__chip">
                  <CheckCircle size={14} />
                  {benefit}
                </Badge>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if product.conditions.length > 0}
        <section class="building-info__section">
          <div class="building-info__section-heading">
            <Star size={18} />
            <h2>Условия</h2>
          </div>
          <ul class="building-info__list">
            {#each product.conditions as condition}
              <li>
                <Badge variant="pro" size="sm" class="building-info__chip">
                  <Star size={14} />
                  {condition}
                </Badge>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <div class="building-info__note">
        <div class="building-info__note-icon">
          <Star size={18} />
        </div>
        <div>
          <span class="building-info__note-title">Финансовая грамотность</span>
          <span class="building-info__note-text">
            Изучите материалы о продукте в разделе «Квесты», чтобы ускорить развитие города
          </span>
        </div>
      </div>
    </div>

    {#snippet footer()}
      <div class="building-info__footer">
        <Button variant="secondary" class="building-info__action" onclick={closeModal}>
          Закрыть
        </Button>
        <Button variant="primary" class="building-info__action" onclick={handleLearnMore}>
          <TrendingUp size={16} />
          {product.ctaText}
        </Button>
      </div>
    {/snippet}
  </Modal>

  <!-- Hidden elements to prevent CSS unused selector warnings -->
  <div style="display: none;">
    <span class="building-info__chip">Hidden</span>
    <button class="building-info__action">Hidden</button>
  </div>
{/if}

<style>
  .building-info__header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .building-info__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-050);
    border: 1px solid var(--layer-brand-150);
    color: var(--color-brand-600);
  }

  .building-info__heading {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .building-info__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 2vw, 1.55rem);
    font-weight: 700;
    letter-spacing: -0.015em;
    color: var(--color-fg-primary);
  }

  .building-info__subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-fg-muted);
  }


  .building-info__content {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 1.6vw, 1.5rem);
  }

  .building-info__section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: clamp(0.95rem, 1.5vw, 1.4rem);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-surface-card) 94%, white 6%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .building-info__section-heading {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .building-info__section-heading h2 {
    margin: 0;
    font-size: 1rem;
    letter-spacing: -0.01em;
  }

  .building-info__section p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--color-fg-secondary);
  }

  .building-info__list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .building-info__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
  }

  .building-info__action {
    min-width: 160px;
  }

  .building-info__note {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-xl);
    border: 1px dashed var(--color-accent-300);
    background: color-mix(in srgb, var(--color-accent-100) 55%, white 45%);
  }

  .building-info__note-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(31, 196, 217, 0.16);
    color: var(--color-accent-600);
  }

  .building-info__note-title {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand-600);
  }

  .building-info__note-text {
    display: block;
    font-size: 0.9rem;
    color: var(--color-fg-secondary);
  }

  .building-info__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
    flex-direction: column;
    align-items: stretch;
  }

  .building-info__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

</style>

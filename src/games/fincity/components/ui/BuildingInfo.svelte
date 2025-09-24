<script lang="ts">
  import { Icon, Button, Modal, Bubble } from '.';
  import { modal, closeModal } from '../../stores/ui';
  import { getProductByBuildingType } from '../../lib/ProductCatalog';
  import { productIntegration } from '../../lib/ProductIntegration';
  import { trackProductLearning } from '../../stores/quests';
  import { BuildingType } from '../../types/Building';
  import type { IconName } from '../../types/Icon';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const isOpen = $derived($modal.type === 'building_info' && $modal.isOpen);
  const buildingType = $derived($modal.data?.buildingType as BuildingType | undefined);
  const product = $derived(buildingType ? getProductByBuildingType(buildingType) : null);

  $effect(() => {
    console.log('BuildingInfo state:', {
      isOpen,
      buildingType,
      hasProduct: !!product,
      modalType: $modal.type,
      modalIsOpen: $modal.isOpen,
      modalData: $modal.data
    });
    if ($modal.type === 'building_info' && $modal.isOpen) {
      console.log('BuildingInfo should be visible now!');
    }
  });

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
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'info';
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
        return 'bank';
      case 'investment':
        return 'trending-up';
      case 'protection':
        return 'shield';
      case 'services':
        return 'gift';
      case 'education':
        return 'book';
      default:
        return 'building';
    }
  }
</script>

{#if isOpen && product}
  <Modal class="product-showcase-modal {className}">
    <div class="product-showcase-header">
      <div class="product-visual">
        <div class="product-image">
          <Icon
            name={(product.iconName || getCategoryIcon(product.category)) as IconName}
            size="3xl"
            color="var(--color-violet)"
          />
        </div>
        <Bubble
          variant={getDifficultyVariant(product.difficulty)}
          tag="Уровень"
          size="sm"
          class="difficulty-bubble"
        >
          {getDifficultyText(product.difficulty)}
        </Bubble>
      </div>

      <div class="product-details">
        <h1 class="product-title text-heading-xl">{product.title}</h1>
        <p class="product-subtitle text-body-lg">{product.subtitle}</p>
        <Bubble color="violet" size="sm" class="category-badge">
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
        </Bubble>
      </div>
    </div>

    <div class="product-showcase-content">
      <div class="description-module">
        <h2 class="module-title text-heading-md">О продукте</h2>
        <p class="description text-body">{product.detailedDescription}</p>
      </div>

      {#if product.benefits.length > 0}
        <div class="benefits-module">
          <h2 class="module-title text-heading-md">
            <Icon name="check" size="sm" color="var(--color-melissa)" />
            Преимущества
          </h2>
          <div class="benefits-grid">
            {#each product.benefits as benefit}
              <Bubble variant="success" size="sm" class="benefit-bubble">
                <Icon name="check" size="xs" color="var(--color-melissa)" />
                {benefit}
              </Bubble>
            {/each}
          </div>
        </div>
      {/if}

      {#if product.conditions.length > 0}
        <div class="conditions-module">
          <h2 class="module-title text-heading-md">
            <Icon name="book" size="sm" color="var(--color-violet)" />
            Условия
          </h2>
          <div class="conditions-grid">
            {#each product.conditions as condition}
              <Bubble color="violet" size="sm" class="condition-bubble">
                <Icon name="book" size="xs" color="var(--color-violet)" />
                {condition}
              </Bubble>
            {/each}
          </div>
        </div>
      {/if}

      <Bubble variant="notification" class="education-note">
        <Icon name="star" size="sm" color="var(--color-mint)" />
        <div class="note-content">
          <span class="note-title text-body font-heading">Финансовая грамотность</span>
          <span class="note-description text-body-sm">
            Изучите материалы о продукте в разделе "Квесты" для лучшего понимания
          </span>
        </div>
      </Bubble>
    </div>

    <div class="product-showcase-footer">
      <Button variant="tertiary" onclick={closeModal} class="close-button">Закрыть</Button>

      <Button variant="primary" onclick={handleLearnMore} class="cta-button">
        <Icon name="trending-up" size="sm" />
        {product.ctaText}
      </Button>
    </div>
  </Modal>
{/if}


<style>
  /* svelte-ignore css-unused-selector */

  :global(.product-showcase-modal .modal-content-wrapper) {
    @apply max-width: 1200px max-h-90vh;
  }

  .product-showcase-header {
    @apply p-md bg-lily;
    @apply border-b border-henbane-20;
    @apply grid grid-cols-1 gap: 1rem items-center text-center;
  }

  .product-visual {
    @apply flex flex-col items-center;
    gap: 1rem;
  }

  .product-image {
    @apply w-24 h-24 flex items-center justify-center;
    @apply background: white rounded-[var(--radius-xl)];
    @apply shadow-sm border border-henbane-10;
  }

  :global(.difficulty-bubble) {
    @apply mx-auto;
  }

  .product-details {
    @apply md:col-span-2 space-y-4;
  }

  .product-title {
    @apply text-black mb-2;
  }

  .product-subtitle {
    @apply text-henbane mb-4 leading-relaxed;
  }

  .product-showcase-content {
    @apply flex-1 overflow-y-auto p-md gap: 1rem;
    @apply bg-lily-50 space-y-6;
  }

  .description-module,
  .benefits-module,
  .conditions-module {
    @apply space-y-4;
  }

  .module-title {
    @apply flex items-center gap: 0.75rem text-black mb-4;
  }

  .description {
    @apply text-henbane leading-relaxed;
    @apply background: white p-md rounded-[var(--radius)];
    @apply border border-henbane-10;
  }

  .benefits-grid,
  .conditions-grid {
    @apply grid grid-cols-1 gap-sm;
  }

  :global(.benefit-bubble),
  :global(.condition-bubble) {
    @apply justify-start text-left;
  }

  :global(.education-note) {
    @apply p-6 mt-6;
  }

  .note-content {
    @apply flex items-start gapadding: 1rem;
  }

  .note-title {
    @apply block mb-2;
  }

  .note-description {
    @apply block opacity-90;
  }

  .product-showcase-footer {
    @apply flex flex-col gap: 1rem p-md;
    @apply bg-lily border-t border-henbane-20;
  }

  :global(.close-button),
  :global(.cta-button) {
    @apply w-full touch-target;
  }

  @media (max-width: 400px) {
    .product-showcase-header {
      @apply p-sm;
    }

    .product-visual {
      @apply flex-row justify-center items-center;
      gap: var(--spacing-mobile);
    }

    .product-image {
      @apply w-16 h-16;
    }

    .product-showcase-content {
      @apply p-sm space-y-4;
    }

    .product-showcase-footer {
      @apply p-sm gap-sm;
    }
  }
</style>

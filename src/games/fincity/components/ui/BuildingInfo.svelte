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
  <Modal class="fincity-product-showcase-modal {className}">
    <div class="fincity-product-showcase-header">
      <div class="fincity-product-visual">
        <div class="fincity-product-image">
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
          class="fincity-difficulty-bubble"
        >
          {getDifficultyText(product.difficulty)}
        </Bubble>
      </div>

      <div class="fincity-product-details">
        <h1 class="fincity-product-title text-heading-xl">{product.title}</h1>
        <p class="fincity-product-subtitle text-body-lg">{product.subtitle}</p>
        <Bubble color="violet" size="sm" class="fincity-category-badge">
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

    <div class="fincity-product-showcase-content">
      <div class="fincity-description-module">
        <h2 class="fincity-module-title text-heading-md">О продукте</h2>
        <p class="fincity-description text-body">{product.detailedDescription}</p>
      </div>

      {#if product.benefits.length > 0}
        <div class="fincity-benefits-module">
          <h2 class="fincity-module-title text-heading-md">
            <Icon name="check" size="sm" color="var(--color-melissa)" />
            Преимущества
          </h2>
          <div class="fincity-benefits-grid">
            {#each product.benefits as benefit}
              <Bubble variant="success" size="sm" class="fincity-benefit-bubble">
                <Icon name="check" size="xs" color="var(--color-melissa)" />
                {benefit}
              </Bubble>
            {/each}
          </div>
        </div>
      {/if}

      {#if product.conditions.length > 0}
        <div class="fincity-conditions-module">
          <h2 class="fincity-module-title text-heading-md">
            <Icon name="book" size="sm" color="var(--color-violet)" />
            Условия
          </h2>
          <div class="fincity-conditions-grid">
            {#each product.conditions as condition}
              <Bubble color="violet" size="sm" class="fincity-condition-bubble">
                <Icon name="book" size="xs" color="var(--color-violet)" />
                {condition}
              </Bubble>
            {/each}
          </div>
        </div>
      {/if}

      <Bubble variant="notification" class="fincity-education-note">
        <Icon name="star" size="sm" color="var(--color-mint)" />
        <div class="fincity-note-content">
          <span class="fincity-note-title text-body font-heading">Финансовая грамотность</span>
          <span class="fincity-note-description text-body-sm">
            Изучите материалы о продукте в разделе "Квесты" для лучшего понимания
          </span>
        </div>
      </Bubble>
    </div>

    <div class="fincity-product-showcase-footer">
      <Button variant="tertiary" onclick={closeModal} class="fincity-close-button">Закрыть</Button>

      <Button variant="primary" onclick={handleLearnMore} class="fincity-cta-button">
        <Icon name="trending-up" size="sm" />
        {product.ctaText}
      </Button>
    </div>
  </Modal>
{/if}


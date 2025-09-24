<script lang="ts">
  import { Button, Modal, ProgressBar } from '.';
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
  <div class="modal-overlay-game">
    <div class="modal-game">
      <!-- Декоративные элементы -->
      <div class="particles-container">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>

      <div class="modal-header-game gradient-electric text-white">
        <div class="decoration-orb bg-gpb-mint w-6 h-6 -top-2 -right-2"></div>
        <div class="decoration-shine"></div>

        <div class="game-card-icon neon-glow mb-4">
          {#if product.category}
            {@const IconComponent = getCategoryIcon(product.category)}
            <IconComponent
              size={48}
              class="text-white neon-glow"
            />
          {:else}
            <Building size={48} class="text-white neon-glow" />
          {/if}
        </div>

        <Badge
          variant={getDifficultyVariant(product.difficulty)}
          size="sm"
          class="mb-2"
        >
          {getDifficultyText(product.difficulty)}
        </Badge>

        <h1 class="modal-title-game">{product.title}</h1>
        <p class="opacity-90 text-center">{product.subtitle}</p>

        <Badge variant="pro" size="sm" class="mt-2">
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

      <div class="modal-content-game space-y-6">
        <!-- Описание продукта -->
        <div class="game-card gradient-wealth text-white p-4">
          <h2 class="font-section-title flex items-center gap-2 mb-3">
            <Book size={20} class="neon-glow" />
            О продукте
          </h2>
          <p class="font-ui-primary opacity-90">{product.detailedDescription}</p>
        </div>

        {#if product.benefits.length > 0}
          <!-- Преимущества -->
          <div class="game-card gradient-power text-white p-4">
            <h2 class="font-section-title flex items-center gap-2 mb-4">
              <CheckCircle size={20} class="neon-glow" />
              Преимущества
            </h2>
            <div class="grid gap-2">
              {#each product.benefits as benefit}
                <Badge variant="new" size="sm" class="justify-start">
                  <CheckCircle size={12} />
                  {benefit}
                </Badge>
              {/each}
            </div>
          </div>
        {/if}

        {#if product.conditions.length > 0}
          <!-- Условия -->
          <div class="game-card gradient-mystery text-white p-4">
            <h2 class="font-section-title flex items-center gap-2 mb-4">
              <Star size={20} class="neon-glow" />
              Условия
            </h2>
            <div class="grid gap-2">
              {#each product.conditions as condition}
                <Badge variant="pro" size="sm" class="justify-start">
                  <Star size={12} />
                  {condition}
                </Badge>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Образовательная заметка -->
        <div class="glass-effect p-4 rounded-xl border border-white/20 bg-gpb-mint/10">
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-full bg-gpb-mint/20">
              <Star size={16} class="text-gpb-mint neon-glow" />
            </div>
            <div>
              <span class="font-badge block text-gpb-mint">Финансовая грамотность</span>
              <span class="font-ui-secondary text-sm opacity-80">
                Изучите материалы о продукте в разделе "Квесты" для лучшего понимания
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer-game">
        <Button
          variant="secondary"
          onclick={closeModal}
          class="btn-game-secondary flex-1"
        >
          Закрыть
        </Button>

        <Button
          variant="primary"
          onclick={handleLearnMore}
          class="btn-game-primary flex-1 hover-lift active-press"
        >
          <TrendingUp size={16} class="neon-glow" />
          {product.ctaText}
        </Button>
      </div>
    </div>
  </div>
{/if}


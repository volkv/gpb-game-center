<script lang="ts">
  import { Icon, Button, Card, Bubble, Modal } from '.';
  import { modal, closeModal, openModal } from '../../stores/ui';
  import { buildingConfigs, hasBuildingOfType } from '../../stores/buildings';
  import { resources, level } from '../../stores/playerData';
  import { showToast } from '../../stores/ui';
  import { startBuildingMode } from '../../stores/gameState';
  import { BuildingType } from '../../types/Building';
  import type { GameEngine } from '../game/GameEngine';

  interface Props {
    class?: string;
    gameEngine?: GameEngine | null;
  }

  let { class: className = '', gameEngine }: Props = $props();

  const isOpen = $derived($modal.isOpen && $modal.type === 'build_menu');

  let searchTerm = $state('');
  let selectedCategory = $state<'all' | 'unlocked' | 'locked'>('unlocked');

  const availableBuildings = $derived(
    Object.entries(buildingConfigs).filter(([, config]) => {
      const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          config.bankProduct.toLowerCase().includes(searchTerm.toLowerCase());

      const levelUnlocked = $level >= config.unlockLevel;
      const requiredBuildingExists = !config.requiresBuilding || $hasBuildingOfType(config.requiresBuilding);
      const isUnlocked = levelUnlocked && requiredBuildingExists;

      if (selectedCategory === 'unlocked') return isUnlocked && matchesSearch;
      if (selectedCategory === 'locked') return !isUnlocked && matchesSearch;
      return matchesSearch;
    })
  );

  function canAfford(price: { coins?: number; crystals?: number; energy?: number }) {
    return (!price.coins || $resources.coins >= price.coins) &&
           (!price.crystals || $resources.crystals >= price.crystals) &&
           (!price.energy || $resources.energy >= price.energy);
  }

  function selectBuilding(type: BuildingType) {
    const config = buildingConfigs[type];

    if ($level < config.unlockLevel) {
      showToast('warning', 'Здание заблокировано', `Требуется ${config.unlockLevel} уровень`);
      return;
    }

    if (config.requiresBuilding && !$hasBuildingOfType(config.requiresBuilding)) {
      const requiredConfig = buildingConfigs[config.requiresBuilding];
      showToast('warning', 'Здание заблокировано', `Сначала постройте: ${requiredConfig.name}`);
      return;
    }

    if (!canAfford(config.basePrice)) {
      showToast('error', 'Недостаточно ресурсов', 'Нужно больше монет или кристаллов');
      return;
    }

    if (gameEngine && gameEngine.buildingManager) {
      const success = gameEngine.buildingManager.startBuildingMode(type);
      if (success) {
        startBuildingMode(type);
        closeModal();
      }
    } else {
      showToast('error', 'Ошибка', 'Игровой движок не готов');
    }
  }

  function clearSearch() {
    searchTerm = '';
  }

  function getBuildingSpritePath(buildingType: BuildingType): string | null {
    const spriteMap: Record<BuildingType, string> = {
      [BuildingType.CENTRAL_BANK]: '/games/fincity/assets/buildings/B1.png',
      [BuildingType.SECURITY_HQ]: '/games/fincity/assets/buildings/B2.png',
      [BuildingType.CAPITAL_TOWER]: '',
      [BuildingType.LONGEVITY_PARK]: '',
      [BuildingType.PARTNER_MALL]: '',
      [BuildingType.RESEARCH_INSTITUTE]: ''
    };
    return spriteMap[buildingType] || null;
  }

  function showProductInfo(type: BuildingType) {
    console.log('Opening building info modal for:', type);
    // Открываем модалку с информацией о здании напрямую без закрытия текущей
    openModal('building_info', { buildingType: type });
    console.log('Modal opened, current modal state should be building_info');
  }
</script>

<Modal
  open={isOpen}
  onclose={closeModal}
  title="Меню строительства"
  size="lg"
  class="build-menu-modal {className}"
>
  {#snippet header()}
    <div class="title-section">
      <Icon name="hammer" color="var(--color-gpb-blue)" size="lg" />
      <h2 class="modal-title">Меню строительства</h2>
    </div>
  {/snippet}

  <div class="search-controls">
    <div class="search-bar">
      <Icon name="search" size="sm" color="var(--color-gray-400)" />
      <input
        type="text"
        placeholder="Поиск зданий..."
        bind:value={searchTerm}
        class="search-input"
      />
      {#if searchTerm}
        <button onclick={clearSearch} class="clear-search">
          <Icon name="close" size="sm" />
        </button>
      {/if}
    </div>

    <div class="category-tabs">
      <button
        class="tab-button {selectedCategory === 'all' ? 'active' : ''}"
        onclick={() => selectedCategory = 'all'}
      >
        Все
      </button>
      <button
        class="tab-button {selectedCategory === 'unlocked' ? 'active' : ''}"
        onclick={() => selectedCategory = 'unlocked'}
      >
        Доступные
      </button>
      <button
        class="tab-button {selectedCategory === 'locked' ? 'active' : ''}"
        onclick={() => selectedCategory = 'locked'}
      >
        Заблокированные
      </button>
    </div>
  </div>

  <div class="buildings-grid">
    {#each availableBuildings as [type, config] (type)}
    {@const levelUnlocked = $level >= config.unlockLevel}
    {@const requiredBuildingExists = !config.requiresBuilding || $hasBuildingOfType(config.requiresBuilding)}
    {@const isUnlocked = levelUnlocked && requiredBuildingExists}
    {@const affordable = canAfford(config.basePrice)}
    {@const spritePath = getBuildingSpritePath(type as BuildingType)}

    <Card
      variant={!isUnlocked ? 'default' : affordable ? 'elevated' : 'default'}
      size="none"
      padding="sm"
      class="building-card {!isUnlocked ? 'locked' : !affordable ? 'expensive' : 'available'}"
      clickable={false}
    >
      <div class="card-body">
        <div class="card-visual">
          <div class="building-render">
            {#if spritePath}
              <img
                src={spritePath}
                alt={config.name}
                class="building-sprite {!isUnlocked ? 'locked' : ''}"
              />
            {:else}
              <Icon name="building" size="lg" color={isUnlocked ? 'var(--color-violet)' : 'var(--color-henbane)'} />
            {/if}
          </div>

          {#if !isUnlocked}
            <Bubble variant="info" size="sm" class="lock-badge">
              <Icon name="shield" size="xs" />
              Уровень {config.unlockLevel}
            </Bubble>
          {/if}
        </div>

        <div class="card-details">
          <div class="card-header">
            <h3 class="card-title">{config.name}</h3>
            <Bubble color="violet" size="sm" class="category-pill">
              {config.bankProduct}
            </Bubble>
          </div>

          <p class="card-description">{config.description}</p>

          <div class="card-stats">
            <Bubble variant="info" size="sm" class="stat-bubble">
              <Icon name="building" size="xs" color="var(--color-violet)" />
              {config.size.width}×{config.size.height}
            </Bubble>

            {#if config.income.interval > 0}
              {#if config.income.coins > 0}
                <Bubble color="mint" size="sm" class="stat-bubble">
                  <Icon name="coin" size="xs" color="var(--color-mint)" />
                  +{config.income.coins}
                </Bubble>
              {/if}
              {#if config.income.crystals > 0}
                <Bubble color="raspberry" size="sm" class="stat-bubble">
                  <Icon name="crystal" size="xs" color="var(--color-raspberry)" />
                  +{config.income.crystals}
                </Bubble>
              {/if}
            {/if}
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="card-price">
          <span class="price-label">Стоимость:</span>
          <div class="price-list">
            {#if config.basePrice.coins > 0}
              <Bubble
                color={$resources.coins >= config.basePrice.coins ? 'mint' : 'raspberry-light'}
                size="sm"
                class="price-bubble"
              >
                <Icon name="coin" size="xs" color="var(--color-mint)" />
                {config.basePrice.coins.toLocaleString()}
              </Bubble>
            {/if}

            {#if config.basePrice.crystals > 0}
              <Bubble
                color={$resources.crystals >= config.basePrice.crystals ? 'raspberry' : 'raspberry-light'}
                size="sm"
                class="price-bubble"
              >
                <Icon name="crystal" size="xs" color="var(--color-raspberry)" />
                {config.basePrice.crystals.toLocaleString()}
              </Bubble>
            {/if}
          </div>
        </div>

        <div class="card-actions">
          <Button
            variant="ghost"
            size="sm"
            onclick={() => showProductInfo(type as BuildingType)}
            class="info-button"
          >
            <Icon name="book" size="sm" />
          </Button>

          {#if !isUnlocked}
            <Bubble variant="warning" size="sm" class="status-badge">
              <Icon name="shield" size="xs" />
              Заблокировано
            </Bubble>
          {:else if !affordable}
            <Bubble variant="error" size="sm" class="status-badge">
              <Icon name="coin" size="xs" />
              Не хватает
            </Bubble>
          {:else}
            <Button
              variant="primary"
              size="sm"
              onclick={() => selectBuilding(type as BuildingType)}
              class="build-button"
            >
              <Icon name="hammer" size="sm" />
              Построить
            </Button>
          {/if}
        </div>
      </div>
    </Card>
    {/each}

    {#if availableBuildings.length === 0}
      <div class="no-results">
        <Icon name="search" size="lg" color="var(--color-gray-400)" />
        <p>Здания не найдены</p>
        <p class="text-sm text-gray-500">Попробуйте изменить поисковый запрос</p>
      </div>
    {/if}
  </div>
</Modal>

<style>
  .title-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .search-controls {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .search-bar {
    position: relative;
    display: flex;
    align-items: center;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: 0;
    outline: 0;
    margin-left: 0.75rem;
    color: #111827;
  }

  .search-input::placeholder {
    color: #6b7280;
  }

  .clear-search {
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .clear-search:hover {
    background-color: #e5e7eb;
  }

  .category-tabs {
    display: flex;
    gap: 0.5rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.5rem;
    transition: all 0.2s;
    border: 1px solid #e5e7eb;
    background-color: white;
    color: #374151;
    cursor: pointer;
  }

  .tab-button.active {
    background-color: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  .tab-button:hover:not(.active) {
    background-color: #f9fafb;
  }

  .buildings-grid {
    padding: 1rem;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  :global(.building-card) {
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  :global(.building-card.locked) {
    opacity: 0.75;
    cursor: not-allowed;
  }

  :global(.building-card.expensive) {
    border: 1px solid #fecaca;
    background-color: #fef2f2;
  }

  :global(.building-card.available:hover) {
    transform: translateY(-2px);
  }

  :global(.card-body) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global(.card-visual) {
    position: relative;
    flex-shrink: 0;
  }

  :global(.building-render) {
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f6;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  @media (min-width: 768px) {
    :global(.building-render) {
      width: 5rem;
      height: 5rem;
    }
  }

  :global(.building-sprite) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  :global(.building-sprite.locked) {
    opacity: 0.6;
    filter: grayscale(1);
  }

  :global(.lock-badge) {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
  }

  .no-results {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    text-align: center;
    color: #6b7280;
  }

  @media (max-width: 640px) {
    .search-controls {
      padding: 0.75rem;
    }

    .buildings-grid {
      padding: 0.75rem;
      gap: 0.75rem;
    }
  }
</style>

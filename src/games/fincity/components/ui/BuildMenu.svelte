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
    openModal('building_info', { buildingType: type });
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
    <div class="build-menu__header">
      <div class="build-menu__header-icon">
        <Icon name="hammer" size="lg" />
      </div>
      <div class="build-menu__heading">
        <h2 class="modal-title-game">Меню строительства</h2>
        <p class="build-menu__subtitle">Подберите здание для развития FinCity</p>
      </div>
    </div>
  {/snippet}

  <div class="build-menu__filters">
    <div class="build-menu__search">
      <Icon name="search" size="sm" class="build-menu__search-icon" />
      <input
        type="text"
        placeholder="Поиск зданий..."
        bind:value={searchTerm}
        class="build-menu__search-input"
      />
      {#if searchTerm}
        <button type="button" onclick={clearSearch} class="build-menu__clear-search" aria-label="Очистить поиск">
          <Icon name="close" size="sm" />
        </button>
      {/if}
    </div>

    <div class="build-menu__segments" role="tablist" aria-label="Фильтр зданий">
      <button
        type="button"
        class="build-menu__segment {selectedCategory === 'all' ? 'is-active' : ''}"
        onclick={() => selectedCategory = 'all'}
      >
        Все
      </button>
      <button
        type="button"
        class="build-menu__segment {selectedCategory === 'unlocked' ? 'is-active' : ''}"
        onclick={() => selectedCategory = 'unlocked'}
      >
        Доступные
      </button>
      <button
        type="button"
        class="build-menu__segment {selectedCategory === 'locked' ? 'is-active' : ''}"
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
        padding="none"
        class="building-card {!isUnlocked ? 'is-locked' : !affordable ? 'is-expensive' : 'is-available'}"
        clickable={false}
      >
        <div class="building-card__body">
          <div class="building-card__visual">
            <div class="building-card__render">
              {#if spritePath}
                <img
                  src={spritePath}
                  alt={config.name}
                  class="building-card__sprite {!isUnlocked ? 'is-locked' : ''}"
                />
              {:else}
                <Icon name="building" size="xl" class="building-card__placeholder-icon" />
              {/if}
            </div>

            {#if !isUnlocked}
              <Bubble variant="info" size="sm" class="building-card__lock">
                <Icon name="shield" size="xs" />
                Уровень {config.unlockLevel}
              </Bubble>
            {/if}
          </div>

          <div class="building-card__details">
            <div class="building-card__header">
              <h3 class="building-card__title">{config.name}</h3>
              <Bubble color="violet" size="sm" class="building-card__category">
                {config.bankProduct}
              </Bubble>
            </div>

            <p class="building-card__description">{config.description}</p>

            <div class="building-card__stats">
              <Bubble variant="info" size="sm" class="building-card__stat">
                <Icon name="building" size="xs" />
                {config.size.width}×{config.size.height}
              </Bubble>

              {#if config.income.interval > 0}
                {#if config.income.coins > 0}
                  <Bubble color="mint" size="sm" class="building-card__stat">
                    <Icon name="coin" size="xs" />
                    +{config.income.coins}
                  </Bubble>
                {/if}
                {#if config.income.crystals > 0}
                  <Bubble color="raspberry" size="sm" class="building-card__stat">
                    <Icon name="crystal" size="xs" />
                    +{config.income.crystals}
                  </Bubble>
                {/if}
              {/if}
            </div>
          </div>
        </div>

        <div class="building-card__footer">
          <div class="building-card__price">
            <span class="building-card__price-label">Стоимость</span>
            <div class="building-card__price-list">
              {#if config.basePrice.coins > 0}
                <Bubble
                  color={$resources.coins >= config.basePrice.coins ? 'mint' : 'raspberry-light'}
                  size="sm"
                  class="building-card__price-chip"
                >
                  <Icon name="coin" size="xs" />
                  {config.basePrice.coins.toLocaleString('ru-RU')}
                </Bubble>
              {/if}

              {#if config.basePrice.crystals > 0}
                <Bubble
                  color={$resources.crystals >= config.basePrice.crystals ? 'raspberry' : 'raspberry-light'}
                  size="sm"
                  class="building-card__price-chip"
                >
                  <Icon name="crystal" size="xs" />
                  {config.basePrice.crystals.toLocaleString('ru-RU')}
                </Bubble>
              {/if}
            </div>
          </div>

          <div class="building-card__actions">
            <Button
              variant="ghost"
              size="sm"
              onclick={() => showProductInfo(type as BuildingType)}
              class="building-card__info"
            >
              <Icon name="book" size="sm" />
            </Button>

            {#if !isUnlocked}
              <Bubble variant="warning" size="sm" class="building-card__status">
                <Icon name="shield" size="xs" />
                Заблокировано
              </Bubble>
            {:else if !affordable}
              <Bubble variant="error" size="sm" class="building-card__status">
                <Icon name="coin" size="xs" />
                Не хватает
              </Bubble>
            {:else}
              <Button
                variant="primary"
                size="sm"
                onclick={() => selectBuilding(type as BuildingType)}
                class="building-card__cta"
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
      <div class="build-menu__empty">
        <Icon name="search" size="xl" class="build-menu__empty-icon" />
        <p class="build-menu__empty-title">Здания не найдены</p>
        <p class="build-menu__empty-text">Попробуйте изменить фильтры или поисковый запрос</p>
      </div>
    {/if}

    <!-- Hidden elements to prevent CSS unused selector warnings -->
    <div style="display: none;">
      <div class="building-card is-locked is-expensive">
        <div class="building-card__body">
          <div class="building-card__visual">
            <div class="building-card__placeholder-icon">🏢</div>
            <div class="building-card__lock"></div>
          </div>
          <div class="building-card__details">
            <div class="building-card__header">
              <h3 class="building-card__title">Hidden</h3>
              <span class="building-card__category">Hidden</span>
            </div>
            <div class="building-card__stats">
              <span class="building-card__stat"><svg></svg></span>
            </div>
          </div>
        </div>
        <div class="building-card__footer">
          <div class="building-card__price">
            <span class="building-card__price-chip"></span>
          </div>
          <div class="building-card__actions">
            <button class="building-card__info">Info</button>
            <span class="building-card__status">Status</span>
            <button class="building-card__cta">Action</button>
          </div>
        </div>
      </div>

      <!-- For build-menu__empty-icon -->
      <div class="build-menu__empty">
        <div class="build-menu__empty-icon">🔍</div>
      </div>
    </div>
  </div>
</Modal>

<style>
  .build-menu__header {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .build-menu__header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-050);
    border: 1px solid var(--layer-brand-150);
    color: var(--color-brand-600);
  }

  .build-menu__heading {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .build-menu__subtitle {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-fg-muted);
  }

  .build-menu__filters {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    margin-bottom: 1.2rem;
  }

  .build-menu__search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-neutral-50) 82%, white 18%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }


  .build-menu__search-input {
    flex: 1;
    border: 0;
    background: transparent;
    font-size: 0.95rem;
    color: var(--color-fg-primary);
    outline: none;
  }

  .build-menu__search-input::placeholder {
    color: var(--color-fg-muted);
  }

  .build-menu__clear-search {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    background: color-mix(in srgb, var(--color-neutral-50) 60%, white 40%);
    color: var(--color-fg-muted);
    cursor: pointer;
    transition: background-color 160ms ease, color 160ms ease;
  }

  .build-menu__clear-search:hover {
    background: color-mix(in srgb, var(--color-neutral-50) 40%, white 60%);
    color: var(--color-fg-primary);
  }

  .build-menu__segments {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.1rem;
    scrollbar-width: none;
  }

  .build-menu__segments::-webkit-scrollbar {
    display: none;
  }

  .build-menu__segment {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 1.1rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-neutral-50) 78%, white 22%);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-fg-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
  }

  .build-menu__segment.is-active {
    background: linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-400) 100%);
    border-color: transparent;
    color: var(--color-fg-inverse);
    box-shadow: var(--shadow-soft);
  }

  .buildings-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: 1fr;
  }

  .building-card {
    padding: 0.85rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-surface-card) 96%, white 4%);
    box-shadow: var(--shadow-soft);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  .building-card.is-expensive {
    border-color: rgba(209, 60, 106, 0.25);
    background: color-mix(in srgb, rgba(209, 60, 106, 0.08) 30%, var(--color-surface-card) 70%);
  }

  .building-card.is-locked {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .building-card__body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .building-card__visual {
    position: relative;
    width: 100%;
  }

  .building-card__render {
    width: 100%;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-neutral-50) 84%, white 16%);
  }

  .building-card__sprite {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .building-card__sprite.is-locked {
    opacity: 0.55;
    filter: grayscale(1);
  }

  .building-card__placeholder-icon {
    color: var(--color-brand-400);
  }

  .building-card__lock {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }

  .building-card__details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.85rem;
  }

  .building-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .building-card__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 640;
    letter-spacing: -0.01em;
    color: var(--color-fg-primary);
    flex: 1;
  }

  .building-card__category {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .building-card__stat :global(svg) {
    color: inherit;
  }

  .building-card__description {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.4;
    color: var(--color-fg-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .building-card__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }


  .building-card__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.65rem 0.85rem 0.85rem;
    border-top: 1px solid var(--color-border-subtle);
  }

  .building-card__price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .building-card__price-label {
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    white-space: nowrap;
  }

  .building-card__price-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .building-card__price-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 600;
    font-size: 0.8rem;
  }

  .building-card__info {
    border-radius: var(--radius-lg) !important;
    min-width: 44px;
    min-height: 44px;
  }

  .building-card__status {
    white-space: nowrap;
  }

  .building-card__cta {
    white-space: nowrap;
    padding-inline: 0.85rem !important;
    min-height: 44px;
  }

  .building-card__actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  .build-menu__empty {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-fg-muted);
    gap: 0.75rem;
  }


  .build-menu__empty-icon {
    color: var(--color-brand-500);
  }

  .build-menu__empty-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .build-menu__empty-text {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-fg-muted);
  }


</style>

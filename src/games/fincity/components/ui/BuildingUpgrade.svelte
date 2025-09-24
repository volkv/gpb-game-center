<script lang="ts">
  import { Icon, Button, Modal, Bubble, ProgressBar } from '.';
  import { modal, closeModal } from '../../stores/ui';
  import {
    buildingConfigs,
    buildings,
    getUpgradeCost,
    canUpgrade,
    startBuildingUpgrade,
    getUpgradeProgress
  } from '../../stores/buildings';
  import { resources } from '../../stores/playerData';
  import { showToast } from '../../stores/ui';
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const isOpen = $derived($modal.type === 'building_upgrade' && $modal.isOpen);
  const buildingId = $derived($modal.data?.buildingId as string | undefined);


  const building = $derived(
    buildingId ? $buildings.find(b => b.id === buildingId) || null : null
  );

  const config = $derived(
    building ? buildingConfigs[building.type] : null
  );

  const upgradeCost = $derived(
    buildingId ? getUpgradeCost(buildingId) : null
  );

  const canUpgradeBuilding = $derived(
    buildingId ? canUpgrade(buildingId) : false
  );

  const isUpgrading = $derived(building?.isUpgrading || false);

  let upgradeProgress = $state(0);
  let progressInterval: number;

  const currentIncome = $derived({
    coins: building && config ? config.income.coins * building.level : 0,
    crystals: building && config ? config.income.crystals * building.level : 0
  });

  const nextIncome = $derived({
    coins: building && config ? config.income.coins * (building.level + 1) : 0,
    crystals: building && config ? config.income.crystals * (building.level + 1) : 0
  });

  const incomeIncrease = $derived({
    coins: nextIncome.coins - currentIncome.coins,
    crystals: nextIncome.crystals - currentIncome.crystals
  });

  const isMaxLevel = $derived(
    building && config ? building.level >= config.maxLevel : false
  );

  const canAffordUpgrade = $derived(
    upgradeCost ?
      $resources.coins >= upgradeCost.coins && $resources.crystals >= upgradeCost.crystals
      : false
  );

  function handleUpgrade() {
    if (!buildingId || !canUpgradeBuilding) return;

    const success = startBuildingUpgrade(buildingId);

    if (success) {
      showToast('success', 'Прокачка началась!', 'Здание будет улучшено через 10 секунд');
      startProgressTracking();
    } else {
      showToast('error', 'Ошибка прокачки', 'Не удалось начать улучшение здания');
    }
  }

  function startProgressTracking() {
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    progressInterval = setInterval(() => {
      if (!buildingId) {
        clearInterval(progressInterval);
        return;
      }

      upgradeProgress = getUpgradeProgress(buildingId);

      if (upgradeProgress >= 1) {
        clearInterval(progressInterval);
        upgradeProgress = 0;
        showToast('success', 'Прокачка завершена!', 'Здание улучшено до следующего уровня');
      }
    }, 100);
  }

  onMount(() => {
    if (isUpgrading && buildingId) {
      upgradeProgress = getUpgradeProgress(buildingId);
      if (upgradeProgress > 0 && upgradeProgress < 1) {
        startProgressTracking();
      }
    }
  });

  onDestroy(() => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  });

  $effect(() => {
    if (!isUpgrading && progressInterval) {
      clearInterval(progressInterval);
      upgradeProgress = 0;
    }
  });

  function getReasonDisabled(): string {
    if (!building || !config) return '';
    if (isMaxLevel) return 'Достигнут максимальный уровень';
    if (!canAffordUpgrade) return 'Недостаточно ресурсов';
    if (isUpgrading) return 'Здание прокачивается';
    return '';
  }
</script>

{#if isOpen && building && config}
  <Modal open={isOpen} onclose={closeModal} class="building-upgrade-modal {className}">
    <div class="upgrade-header">
      <div class="building-visual">
        <div class="building-icon">
          <Icon name="building" size="2xl" color="var(--color-violet)" />
        </div>
        <div class="building-level">
          <Bubble color="violet" size="sm">
            Уровень {building.level}
          </Bubble>
        </div>
      </div>

      <div class="building-details">
        <h1 class="building-title text-lg">{config.name}</h1>
        <p class="building-description text-body">{config.description}</p>
      </div>
    </div>

    <div class="upgrade-content">
      <!-- Текущее состояние -->
      <div class="current-stats">
        <h2 class="stats-title text-heading-md">
          <Icon name="book" size="sm" color="var(--color-violet)" />
          Текущее состояние
        </h2>

        <div class="stats-grid">
          <div class="stat-item">
            <Icon name="coin" size="sm" color="var(--color-mint)" />
            <span class="stat-value">{currentIncome.coins}</span>
            <span class="stat-label">монет в час</span>
          </div>

          <div class="stat-item">
            <Icon name="crystal" size="sm" color="var(--color-raspberry)" />
            <span class="stat-value">{currentIncome.crystals}</span>
            <span class="stat-label">кристаллов в час</span>
          </div>
        </div>
      </div>

      {#if !isMaxLevel}
        <!-- Прокачка -->
        <div class="upgrade-section">
          <h2 class="stats-title text-heading-md">
            <Icon name="trending-up" size="sm" color="var(--color-melissa)" />
            Прокачка до уровня {building.level + 1}
          </h2>

          {#if isUpgrading}
            <!-- Прогресс прокачки -->
            <div class="upgrade-progress">
              <div class="progress-info">
                <span class="text-body font-heading">Прокачка в процессе...</span>
                <span class="text-body-sm">{Math.round(upgradeProgress * 100)}%</span>
              </div>
              <ProgressBar
                value={upgradeProgress * 100}
                max={100}
                variant="linear"
                color="melissa"
                animated={true}
                glowing={true}
                size="lg"
              />
            </div>
          {:else}
            <!-- Стоимость и улучшения -->
            <div class="upgrade-info">
              <div class="cost-section">
                <h3 class="cost-title text-body font-heading">Стоимость:</h3>
                <div class="cost-grid">
                  <Bubble
                    color="mint"
                    size="sm"
                    class={!canAffordUpgrade && upgradeCost?.coins ? 'insufficient-funds' : ''}
                  >
                    <Icon name="coin" size="xs" />
                    {upgradeCost?.coins || 0}
                  </Bubble>

                  <Bubble
                    color="raspberry"
                    size="sm"
                    class={!canAffordUpgrade && upgradeCost?.crystals ? 'insufficient-funds' : ''}
                  >
                    <Icon name="crystal" size="xs" />
                    {upgradeCost?.crystals || 0}
                  </Bubble>
                </div>
              </div>

              <div class="benefits-section">
                <h3 class="benefits-title text-body font-heading">Улучшения:</h3>
                <div class="benefits-grid">
                  <Bubble variant="success" size="sm">
                    <Icon name="trending-up" size="xs" />
                    +{incomeIncrease.coins} монет в час
                  </Bubble>

                  <Bubble variant="success" size="sm">
                    <Icon name="trending-up" size="xs" />
                    +{incomeIncrease.crystals} кристаллов в час
                  </Bubble>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Максимальный уровень -->
        <div class="max-level-section">
          <Bubble variant="notification" class="max-level-bubble">
            <Icon name="star" size="sm" color="var(--color-mint)" />
            <div class="max-level-content">
              <span class="text-body font-heading">Максимальный уровень достигнут!</span>
              <span class="text-body-sm">Это здание нельзя улучшить дальше</span>
            </div>
          </Bubble>
        </div>
      {/if}
    </div>

    <div class="upgrade-footer">
      <Button variant="tertiary" onclick={closeModal} class="close-button">
        Закрыть
      </Button>

      {#if !isMaxLevel}
        <Button
          variant="primary"
          onclick={handleUpgrade}
          disabled={!canUpgradeBuilding}
          class="upgrade-button"
        >
          <Icon name={isUpgrading ? 'check' : 'star'} size="sm" />
          {#if isUpgrading}
            Прокачивается...
          {:else}
            Прокачать
          {/if}
        </Button>
      {/if}
    </div>

    {#if !canUpgradeBuilding && !isMaxLevel}
      <div class="reason-disabled">
        <span class="text-body-sm text-warning-orange">
          {getReasonDisabled()}
        </span>
      </div>
    {/if}
  </Modal>
{/if}

<style>

  :global(.building-upgrade-modal .modal-content-wrapper) {
    @apply max-width: 32rem max-h-90vh;
  }

  .upgrade-header {
    @apply p-md bg-lily;
    @apply border-b border-violet-20;
    @apply flex items-center gap: 1rem;
  }

  .building-visual {
    @apply flex flex-col items-center gap-sm;
  }

  .building-icon {
    @apply w-16 h-16 flex items-center justify-center;
    @apply background: white rounded-[var(--radius-xl)];
    @apply shadow-sm border border-violet-10;
  }

  .building-level {
    @apply flex justify-center;
  }

  .building-details {
    @apply flex-1 gap: 0.5rem;
  }

  .building-title {
    @apply text-black;
  }

  .building-description {
    @apply text-henbane leading-relaxed;
  }

  .upgrade-content {
    @apply flex-1 overflow-y-auto p-md;
    @apply bg-lily-50 space-y-6;
  }

  .current-stats,
  .upgrade-section {
    @apply space-y-4;
  }

  .max-level-section {
    @apply flex flex-col;
  }

  .stats-title {
    @apply flex items-center gap: 0.75rem text-black;
  }

  .stats-grid {
    @apply grid grid-cols-2 gap-sm;
  }

  .stat-item {
    @apply flex items-center gap-2 p-md;
    @apply background: white rounded-[var(--radius)];
    @apply border border-henbane-10;
  }

  .stat-value {
    @apply text-body font-heading text-black;
  }

  .stat-label {
    @apply text-body-xs text-henbane;
  }

  .upgrade-progress {
    @apply space-y-3;
  }

  .progress-info {
    @apply flex justify-between items-center;
  }

  .upgrade-info {
    @apply space-y-4;
  }

  .cost-section,
  .benefits-section {
    @apply space-y-3;
  }

  .cost-title,
  .benefits-title {
    @apply text-black;
  }

  .cost-grid,
  .benefits-grid {
    @apply flex gap-sm;
  }

  :global(.insufficient-funds) {
    @apply opacity-60 bg-warning-orange-10 border-warning-orange-20;
  }

  :global(.max-level-bubble) {
    @apply p-6;
  }

  .max-level-content {
    @apply gap: 0.5rem;
  }

  .upgrade-footer {
    @apply flex gap: 1rem p-md;
    @apply bg-lily border-t border-violet-20;
  }

  :global(.close-button),
  :global(.upgrade-button) {
    @apply flex-1 touch-target;
  }

  .reason-disabled {
    @apply px-md pb-sm text-center;
    @apply bg-lily;
  }

  @media (max-width: 400px) {
    .upgrade-header {
      @apply p-sm;
    }

    .upgrade-content {
      @apply p-sm space-y-4;
    }

    .upgrade-footer {
      @apply p-sm gap-sm;
    }

    .stats-grid {
      @apply grid-cols-1;
    }

    .cost-grid,
    .benefits-grid {
      @apply flex-col;
    }
  }
</style>
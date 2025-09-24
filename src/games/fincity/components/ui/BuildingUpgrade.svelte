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
  <Modal open={isOpen} onclose={closeModal} class="fincity-building-upgrade-modal {className}">
    <div class="fincity-upgrade-header">
      <div class="fincity-upgrade-visual">
        <div class="fincity-upgrade-image">
          <Icon name="building" size="2xl" color="var(--color-violet)" />
        </div>
        <div class="fincity-building-level">
          <Bubble color="violet" size="sm">
            Уровень {building.level}
          </Bubble>
        </div>
      </div>

      <div class="fincity-upgrade-details">
        <h1 class="fincity-upgrade-title text-lg">{config.name}</h1>
        <p class="fincity-upgrade-subtitle text-body">{config.description}</p>
      </div>
    </div>

    <div class="fincity-upgrade-showcase-content">
      <!-- Текущее состояние -->
      <div class="fincity-current-stats">
        <h2 class="fincity-stats-title text-heading-md">
          <Icon name="book" size="sm" color="var(--color-violet)" />
          Текущее состояние
        </h2>

        <div class="fincity-stats-grid">
          <div class="fincity-stat-item">
            <Icon name="coin" size="sm" color="var(--color-mint)" />
            <span class="fincity-stat-value">{currentIncome.coins}</span>
            <span class="fincity-stat-label">монет в час</span>
          </div>

          <div class="fincity-stat-item">
            <Icon name="crystal" size="sm" color="var(--color-raspberry)" />
            <span class="fincity-stat-value">{currentIncome.crystals}</span>
            <span class="fincity-stat-label">кристаллов в час</span>
          </div>
        </div>
      </div>

      {#if !isMaxLevel}
        <!-- Прокачка -->
        <div class="fincity-upgrade-section">
          <h2 class="fincity-stats-title text-heading-md">
            <Icon name="trending-up" size="sm" color="var(--color-melissa)" />
            Прокачка до уровня {building.level + 1}
          </h2>

          {#if isUpgrading}
            <!-- Прогресс прокачки -->
            <div class="fincity-upgrade-progress">
              <div class="fincity-progress-info">
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
            <div class="fincity-upgrade-info">
              <div class="fincity-cost-section">
                <h3 class="fincity-cost-title text-body font-heading">Стоимость:</h3>
                <div class="fincity-cost-grid">
                  <Bubble
                    color="mint"
                    size="sm"
                    class={!canAffordUpgrade && upgradeCost?.coins ? 'fincity-insufficient-funds' : ''}
                  >
                    <Icon name="coin" size="xs" />
                    {upgradeCost?.coins || 0}
                  </Bubble>

                  <Bubble
                    color="raspberry"
                    size="sm"
                    class={!canAffordUpgrade && upgradeCost?.crystals ? 'fincity-insufficient-funds' : ''}
                  >
                    <Icon name="crystal" size="xs" />
                    {upgradeCost?.crystals || 0}
                  </Bubble>
                </div>
              </div>

              <div class="fincity-benefits-section">
                <h3 class="fincity-benefits-title text-body font-heading">Улучшения:</h3>
                <div class="fincity-benefits-grid">
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
        <div class="fincity-max-level-section">
          <Bubble variant="notification" class="fincity-max-level-bubble">
            <Icon name="star" size="sm" color="var(--color-mint)" />
            <div class="fincity-max-level-content">
              <span class="text-body font-heading">Максимальный уровень достигнут!</span>
              <span class="text-body-sm">Это здание нельзя улучшить дальше</span>
            </div>
          </Bubble>
        </div>
      {/if}
    </div>

    <div class="fincity-upgrade-showcase-footer">
      <Button variant="tertiary" onclick={closeModal} class="fincity-close-button">
        Закрыть
      </Button>

      {#if !isMaxLevel}
        <Button
          variant="primary"
          onclick={handleUpgrade}
          disabled={!canUpgradeBuilding}
          class="fincity-upgrade-button"
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
      <div class="fincity-reason-disabled">
        <span class="text-body-sm text-warning-orange">
          {getReasonDisabled()}
        </span>
      </div>
    {/if}
  </Modal>
{/if}


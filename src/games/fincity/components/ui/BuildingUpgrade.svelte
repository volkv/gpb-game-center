<script lang="ts">
  import { Button, Modal, ProgressBar, Bubble } from '.';
  import { Badge } from '$lib';
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
  import { Building, Coins, Gem, TrendingUp, Star } from 'lucide-svelte';

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
  let progressInterval: ReturnType<typeof setInterval>;

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
      showToast('success', 'Прокачка началась!', 'Здание будет улучшено через 3 секунды');
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
  <Modal
    open={isOpen}
    onclose={closeModal}
    size="lg"
    class="building-upgrade-modal {className}"
  >
    {#snippet header()}
      <div class="building-upgrade__header">
        <div class="building-upgrade__icon">
          <Building size={28} />
        </div>
        <div class="building-upgrade__heading">
          <Badge variant="pro" size="sm">Уровень {building.level}</Badge>
          <h1 class="building-upgrade__title">{config.name}</h1>
          <p class="building-upgrade__subtitle">{config.description}</p>
        </div>
      </div>
    {/snippet}

    <div class="building-upgrade__content">
      <section class="building-upgrade__section">
        <div class="building-upgrade__section-heading">
          <Star size={18} />
          <h2>Текущее состояние</h2>
        </div>
        <div class="building-upgrade__stats">
          <Bubble variant="info" size="sm" class="building-upgrade__stat">
            <Coins size={16} />
            <span class="building-upgrade__stat-value">{currentIncome.coins}</span>
            <span class="building-upgrade__stat-label">монет в час</span>
          </Bubble>
          <Bubble variant="info" size="sm" class="building-upgrade__stat">
            <Gem size={16} />
            <span class="building-upgrade__stat-value">{currentIncome.crystals}</span>
            <span class="building-upgrade__stat-label">кристаллов в час</span>
          </Bubble>
        </div>
      </section>

      {#if isMaxLevel}
        <div class="building-upgrade__message building-upgrade__message--success">
          <div class="building-upgrade__message-icon">
            <Star size={18} />
          </div>
          <div>
            <span class="building-upgrade__message-title">Максимальный уровень достигнут</span>
            <span class="building-upgrade__message-text">Это здание уже полностью улучшено</span>
          </div>
        </div>
      {:else if isUpgrading}
        <section class="building-upgrade__section">
          <div class="building-upgrade__section-heading">
            <TrendingUp size={18} />
            <h2>Прокачка в процессе</h2>
          </div>
          <div class="building-upgrade__progress">
            <div class="building-upgrade__progress-info">
              <span>Прогресс</span>
              <span>{Math.round(upgradeProgress * 100)}%</span>
            </div>
            <ProgressBar
              value={upgradeProgress * 100}
              max={100}
              variant="linear"
              color="emerald"
              animated={true}
              glowing={true}
              size="lg"
            />
          </div>
        </section>
      {:else}
        <section class="building-upgrade__section">
          <div class="building-upgrade__section-heading">
            <TrendingUp size={18} />
            <h2>Прокачка до уровня {building.level + 1}</h2>
          </div>
          <div class="building-upgrade__grid">
            <div class="building-upgrade__card">
              <h3>Стоимость</h3>
              <div class="building-upgrade__chips">
                <Bubble
                  color={canAffordUpgrade || !upgradeCost?.coins ? 'mint' : 'raspberry-light'}
                  size="sm"
                >
                  <Coins size={14} />
                  {upgradeCost?.coins || 0}
                </Bubble>
                <Bubble
                  color={canAffordUpgrade || !upgradeCost?.crystals ? 'raspberry' : 'raspberry-light'}
                  size="sm"
                >
                  <Gem size={14} />
                  {upgradeCost?.crystals || 0}
                </Bubble>
              </div>
            </div>
            <div class="building-upgrade__card">
              <h3>Улучшения</h3>
              <div class="building-upgrade__chips">
                <Bubble variant="info" size="sm">
                  <TrendingUp size={14} />
                  +{incomeIncrease.coins} монет / час
                </Bubble>
                <Bubble variant="info" size="sm">
                  <TrendingUp size={14} />
                  +{incomeIncrease.crystals} кристаллов / час
                </Bubble>
              </div>
            </div>
          </div>
        </section>
      {/if}

      {#if !isMaxLevel && !canUpgradeBuilding}
        <div class="building-upgrade__message building-upgrade__message--warning">
          <div class="building-upgrade__message-icon">
            <Coins size={16} />
          </div>
          <div>
            <span class="building-upgrade__message-title">Невозможно прокачать</span>
            <span class="building-upgrade__message-text">{getReasonDisabled()}</span>
          </div>
        </div>
      {/if}
    </div>

    {#snippet footer()}
      <div class="building-upgrade__footer">
        <Button variant="secondary" class="building-upgrade__action" onclick={closeModal}>
          Закрыть
        </Button>

        {#if !isMaxLevel}
          <Button
            variant="primary"
            class="building-upgrade__action"
            onclick={handleUpgrade}
            disabled={!canUpgradeBuilding}
          >
            {#if isUpgrading}
              <TrendingUp size={16} />
              Прокачивается...
            {:else}
              <Star size={16} />
              Прокачать
            {/if}
          </Button>
        {/if}
      </div>
    {/snippet}
  </Modal>

  <!-- Hidden elements to prevent CSS unused selector warnings -->
  <div style="display: none;">
    <span class="building-upgrade__stat">Hidden</span>
    <button class="building-upgrade__action">Hidden</button>
  </div>
{/if}

<style>
  .building-upgrade__header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .building-upgrade__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    background: var(--layer-brand-050);
    border: 1px solid var(--layer-brand-150);
    color: var(--color-brand-600);
  }

  .building-upgrade__heading {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .building-upgrade__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 2vw, 1.55rem);
    font-weight: 700;
    letter-spacing: -0.015em;
    color: var(--color-fg-primary);
  }

  .building-upgrade__subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-fg-muted);
  }

  .building-upgrade__content {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 1.6vw, 1.4rem);
  }

  .building-upgrade__section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: clamp(0.95rem, 1.6vw, 1.4rem);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-surface-card) 94%, white 6%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .building-upgrade__section-heading {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 600;
    color: var(--color-fg-primary);
    letter-spacing: -0.01em;
  }

  .building-upgrade__section-heading h2 {
    margin: 0;
    font-size: 1rem;
  }

  .building-upgrade__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .building-upgrade__stat {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius-lg);
    background: color-mix(in srgb, var(--color-neutral-50) 80%, white 20%);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-fg-primary);
  }

  .building-upgrade__stat-value {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1rem;
  }

  .building-upgrade__stat-label {
    font-size: 0.8rem;
    color: var(--color-fg-muted);
  }

  .building-upgrade__grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .building-upgrade__card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.75rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-neutral-50) 80%, white 20%);
  }

  .building-upgrade__card h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-fg-primary);
  }

  .building-upgrade__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .building-upgrade__progress {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .building-upgrade__progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: var(--color-fg-secondary);
  }

  .building-upgrade__message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: var(--radius-xl);
    border: 1px dashed var(--color-border-subtle);
    background: color-mix(in srgb, var(--color-neutral-50) 75%, white 25%);
  }

  .building-upgrade__message--success {
    border-color: rgba(43, 180, 138, 0.35);
    background: color-mix(in srgb, rgba(43, 180, 138, 0.12) 40%, white 60%);
  }

  .building-upgrade__message--warning {
    border-color: rgba(209, 60, 106, 0.3);
    background: color-mix(in srgb, rgba(209, 60, 106, 0.1) 40%, white 60%);
  }

  .building-upgrade__message-icon {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(25, 25, 239, 0.12);
    color: var(--color-brand-600);
  }

  .building-upgrade__message-title {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .building-upgrade__message-text {
    display: block;
    font-size: 0.9rem;
    color: var(--color-fg-secondary);
  }

  .building-upgrade__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .building-upgrade__action {
    min-width: 160px;
  }


</style>

<script lang="ts">
  import { Button, ProgressBar } from '.';
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
  import { Building, Coins, Gem, TrendingUp, Star, CheckCircle } from 'lucide-svelte';

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
  <div class="modal-overlay-game">
    <div class="modal-game">
      <!-- Декоративные элементы -->
      <div class="particles-container">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>

      <div class="modal-header-game gradient-power text-white">
        <div class="decoration-orb bg-gpb-gold w-6 h-6 -top-2 -right-2"></div>
        <div class="decoration-shine"></div>

        <div class="game-card-icon neon-glow mb-4">
          <Building size={48} class="text-white neon-glow" />
        </div>

        <Badge variant="pro" size="sm" class="mb-2">
          Уровень {building.level}
        </Badge>

        <h1 class="modal-title-game">{config.name}</h1>
        <p class="opacity-90 text-center">{config.description}</p>
      </div>

      <div class="modal-content-game space-y-6">
        <!-- Текущее состояние -->
        <div class="game-card gradient-wealth text-white p-4">
          <h2 class="font-section-title flex items-center gap-2 mb-4">
            <Star size={20} class="neon-glow" />
            Текущее состояние
          </h2>

          <div class="grid grid-cols-2 gap-3">
            <div class="mini-stat">
              <div class="mini-stat-icon">
                <Coins size={16} class="text-gpb-gold neon-glow" />
              </div>
              <div class="mini-stat-value">{currentIncome.coins}</div>
              <div class="mini-stat-label">монет в час</div>
            </div>

            <div class="mini-stat">
              <div class="mini-stat-icon">
                <Gem size={16} class="text-gpb-raspberry neon-glow" />
              </div>
              <div class="mini-stat-value">{currentIncome.crystals}</div>
              <div class="mini-stat-label">кристаллов в час</div>
            </div>
          </div>
        </div>

        {#if !isMaxLevel}
          <!-- Прокачка -->
          <div class="game-card gradient-electric text-white p-4">
            <h2 class="font-section-title flex items-center gap-2 mb-4">
              <TrendingUp size={20} class="neon-glow" />
              Прокачка до уровня {building.level + 1}
            </h2>

            {#if isUpgrading}
              <!-- Прогресс прокачки -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="font-ui-primary">Прокачка в процессе...</span>
                  <span class="font-ui-secondary">{Math.round(upgradeProgress * 100)}%</span>
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
            {:else}
              <!-- Стоимость и улучшения -->
              <div class="space-y-4">
                <div>
                  <h3 class="font-card-title mb-3">Стоимость:</h3>
                  <div class="flex gap-2">
                    <Badge
                      variant={canAffordUpgrade || !upgradeCost?.coins ? 'new' : 'locked'}
                      size="sm"
                    >
                      <Coins size={12} />
                      {upgradeCost?.coins || 0}
                    </Badge>

                    <Badge
                      variant={canAffordUpgrade || !upgradeCost?.crystals ? 'hot' : 'locked'}
                      size="sm"
                    >
                      <Gem size={12} />
                      {upgradeCost?.crystals || 0}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 class="font-card-title mb-3">Улучшения:</h3>
                  <div class="space-y-2">
                    <Badge variant="new" size="sm" class="w-full justify-start">
                      <TrendingUp size={12} />
                      +{incomeIncrease.coins} монет в час
                    </Badge>

                    <Badge variant="new" size="sm" class="w-full justify-start">
                      <TrendingUp size={12} />
                      +{incomeIncrease.crystals} кристаллов в час
                    </Badge>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Максимальный уровень -->
          <div class="glass-effect p-4 rounded-xl border border-white/20 bg-gpb-gold/10">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-full bg-gpb-gold/20">
                <Star size={16} class="text-gpb-gold neon-glow" />
              </div>
              <div>
                <span class="font-badge block text-gpb-gold">Максимальный уровень достигнут!</span>
                <span class="font-ui-secondary text-sm opacity-80">
                  Это здание нельзя улучшить дальше
                </span>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="modal-footer-game">
        <Button
          variant="secondary"
          onclick={closeModal}
          class="btn-game-secondary flex-1"
        >
          Закрыть
        </Button>

        {#if !isMaxLevel}
          <Button
            variant="primary"
            onclick={handleUpgrade}
            disabled={!canUpgradeBuilding}
            class="btn-game-primary flex-1 hover-lift active-press {!canUpgradeBuilding ? 'opacity-60' : ''}"
          >
            {#if isUpgrading}
              <CheckCircle size={16} class="neon-glow" />
              Прокачивается...
            {:else}
              <Star size={16} class="neon-glow" />
              Прокачать
            {/if}
          </Button>
        {/if}
      </div>

      {#if !canUpgradeBuilding && !isMaxLevel}
        <div class="px-6 pb-4 text-center">
          <span class="font-ui-secondary text-sm text-gpb-raspberry">
            {getReasonDisabled()}
          </span>
        </div>
      {/if}
    </div>
  </div>
{/if}


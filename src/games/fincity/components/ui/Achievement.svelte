<script lang="ts">
  import { onMount } from 'svelte';
  import { achievements, achievementStats } from '../../stores/achievements';
  import { modal, closeModal } from '../../stores/ui';
  import { Button, Icon, ProgressBar, Modal, Card } from './';
  import { Badge } from '$lib';
  import type { Achievement, AchievementCategory } from '../../types/Achievement';
  import type { IconName } from './Icon.svelte';

  let selectedCategory: AchievementCategory | 'all' = $state('all');
  let filteredAchievements = $state<Achievement[]>([]);
  let recentlyUnlocked = $state<Achievement | null>(null);

  const isOpen = $derived($modal.isOpen && $modal.type === 'achievements');

  const categoryIcons: Record<AchievementCategory, string> = {
    general: 'star',
    buildings: 'building',
    resources: 'coin',
    quests: 'book',
    progression: 'crown',
    education: 'star'
  };

  const categoryNames: Record<AchievementCategory, string> = {
    general: 'Общие',
    buildings: 'Здания',
    resources: 'Ресурсы',
    quests: 'Квесты',
    progression: 'Прогресс',
    education: 'Образование'
  };

  const rarityGradients: Record<string, 'electric' | 'power' | 'wealth' | 'mystery' | null> = {
    common: 'electric',
    rare: 'power',
    epic: 'wealth',
    legendary: 'mystery'
  };

  const rarityVariants: Record<string, 'new' | 'hot' | 'locked' | 'pro' | 'online' | 'offline'> = {
    common: 'locked',
    rare: 'new',
    epic: 'pro',
    legendary: 'hot'
  };

  onMount(() => {
    updateFilteredAchievements();

    const unsubscribe = achievements.subscribe(achievementList => {
      const newlyUnlocked = achievementList.find(achievement =>
        achievement.status === 'unlocked' &&
        achievement.unlockDate &&
        achievement.unlockDate > Date.now() - 2000
      );

      if (newlyUnlocked && newlyUnlocked.id !== recentlyUnlocked?.id) {
        showUnlockNotification(newlyUnlocked);
      }

      updateFilteredAchievements();
    });

    return unsubscribe;
  });

  function updateFilteredAchievements() {
    if (selectedCategory === 'all') {
      filteredAchievements = $achievements;
    } else {
      filteredAchievements = $achievements.filter(achievement =>
        achievement.category === selectedCategory
      );
    }
  }

  function showUnlockNotification(achievement: Achievement) {
    recentlyUnlocked = achievement;
    setTimeout(() => {
      recentlyUnlocked = null;
    }, 4000);
  }

  function getProgressPercentage(achievement: Achievement): number {
    if (!achievement.progress) return 0;
    return Math.round((achievement.progress / achievement.maxProgress) * 100);
  }

  function getRarityName(rarity: string): string {
    const names: Record<string, string> = {
      common: 'Обычное',
      rare: 'Редкое',
      epic: 'Эпическое',
      legendary: 'Легендарное'
    };
    return names[rarity] || rarity;
  }

  function handleCategoryChange(category: AchievementCategory | 'all') {
    selectedCategory = category;
    updateFilteredAchievements();
  }
</script>

<Modal
  open={isOpen}
  onclose={closeModal}
  title="Достижения"
  size="lg"
>
  {#snippet header()}
    <div class="modal-title-section flex items-center gap-3">
      <div class="p-2 rounded-xl gradient-mystery neon-glow">
        <Icon name="crown" size="lg" />
      </div>
      <div>
        <h2 class="modal-title-game">Достижения</h2>
        <p class="text-sm opacity-90">
          {$achievementStats.totalUnlocked} из {$achievementStats.totalAvailable}
          ({$achievementStats.completionPercentage}%)
        </p>
      </div>
    </div>
  {/snippet}

  <div class="space-y-6">
    <div class="achievement-tabs">
      <button
        class="achievement-tab {selectedCategory === 'all' ? 'active' : ''}"
        onclick={() => handleCategoryChange('all')}
        type="button"
      >
        <Icon name="star" size="sm" />
        <span>Все</span>
        <Badge variant="new" size="sm" class="ml-2">{$achievementStats.totalAvailable}</Badge>
      </button>
      {#each Object.entries(categoryNames) as [category, name]}
        <button
          class="achievement-tab {selectedCategory === category ? 'active' : ''}"
          onclick={() => handleCategoryChange(category as AchievementCategory)}
          type="button"
        >
          <Icon name={(categoryIcons[category as AchievementCategory] as IconName) || 'star'} size="sm" />
          <span>{name}</span>
        </button>
      {/each}
    </div>

    {#if filteredAchievements.length === 0}
      <Card class="text-center py-12">
        <div class="flex flex-col items-center gap-4">
          <div class="p-4 rounded-full bg-gpb-gray-100">
            <Icon name="crown" size="xl" class="text-gpb-gray-400" />
          </div>
          <div>
            <h3 class="font-card-title text-gpb-gray-700 mb-2">Достижений нет</h3>
            <p class="font-ui-secondary text-gpb-gray-500">
              В этой категории достижений пока нет.
            </p>
          </div>
        </div>
      </Card>
    {:else}
      <div class="grid grid-cols-1 gap-3">
        {#each filteredAchievements as achievement, index (achievement.id)}
          {@const isUnlocked = achievement.status === 'unlocked'}
          {@const isLocked = achievement.status === 'locked'}
          {@const progress = getProgressPercentage(achievement)}

          <Card
            gradient={isUnlocked ? rarityGradients[achievement.rarity] : null}
            decorative={isUnlocked}
            class="stagger-item {isUnlocked ? 'text-white' : 'bg-white border-2'} {isLocked ? 'opacity-50 border-gpb-gray-200' : isUnlocked ? '' : 'border-gpb-violet'}"
            style="animation-delay: {index * 0.1}s"
          >
            <div class="achievement-card-layout">
              <div class="achievement-card-header">
                <div class="p-2 rounded-xl flex-shrink-0 {isUnlocked ? 'bg-black/20' : isLocked ? 'bg-gpb-gray-200' : 'bg-gpb-violet/10'}">
                  <Icon
                    name={(achievement.icon as IconName) || 'crown'}
                    size="md"
                    class={isUnlocked ? 'text-gpb-gold' : isLocked ? 'text-gpb-gray-500' : 'text-gpb-violet'}
                  />
                </div>

                <div class="achievement-card-title-section">
                  <h3 class="font-card-title text-sm">{achievement.title}</h3>
                  <Badge variant={rarityVariants[achievement.rarity]} size="sm">
                    {getRarityName(achievement.rarity)}
                  </Badge>
                </div>
              </div>

              <div class="achievement-card-body">
                <p class="font-ui-secondary text-xs {isUnlocked ? 'opacity-90' : 'text-gpb-gray-600'}">
                  {achievement.description}
                </p>

                {#if achievement.progress && !isUnlocked}
                  <div class="achievement-card-progress">
                    <span class="font-ui-primary {isUnlocked ? 'opacity-90' : 'text-gpb-gray-700'} text-xs font-medium">
                      Прогресс: {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                {/if}
              </div>

              <div class="achievement-card-footer">
                <div class="achievement-card-rewards">
                  {#if achievement.rewards?.coins}
                    <div class="achievement-reward-item">
                      <Icon name="coin" size="sm" class="text-gpb-gold" />
                      <span class="font-ui-primary font-semibold text-sm">{Math.floor(achievement.rewards.coins)}</span>
                    </div>
                  {/if}
                  {#if achievement.rewards?.crystals}
                    <div class="achievement-reward-item">
                      <Icon name="crystal" size="sm" class="text-gpb-violet" />
                      <span class="font-ui-primary font-semibold text-sm">{Math.floor(achievement.rewards.crystals)}</span>
                    </div>
                  {/if}
                </div>

                <div class="achievement-card-status">
                  {#if isUnlocked}
                    <div class="achievement-status-badge achievement-status-unlocked">
                      <Icon name="check" color="white" size="sm" />
                      <span>Получено</span>
                    </div>
                  {:else if isLocked}
                    <div class="achievement-status-badge achievement-status-locked">
                      <Icon name="shield" color="white" size="sm" />
                      <span>Заблокировано</span>
                    </div>
                  {:else}
                    <div class="achievement-status-badge achievement-status-progress">
                      <Icon name="crown" color="white" size="sm" />
                      <span>В процессе</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

          </Card>
        {/each}
      </div>
    {/if}
  </div>
</Modal>

{#if recentlyUnlocked}
  <div class="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out animate-bounce-in">
    <Card gradient="wealth" decorative={true} particles={true} class="text-white max-w-sm shadow-2xl">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-xl bg-white/20 neon-glow">
          <Icon name={(recentlyUnlocked.icon as IconName) || 'crown'} size="lg" class="text-current" />
        </div>
        <div class="flex-1">
          <div class="font-card-title text-gpb-gold mb-1">🎉 Достижение разблокировано!</div>
          <h4 class="font-section-title mb-1">{recentlyUnlocked.title}</h4>
          <p class="font-ui-secondary opacity-90 text-sm">{recentlyUnlocked.description}</p>
        </div>
      </div>
    </Card>
  </div>
{/if}

<style>
  .achievement-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: var(--radius-lg);
    background-color: var(--color-neutral-50);
    border: 1px solid var(--color-border-subtle);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .achievement-tabs::-webkit-scrollbar {
    display: none;
  }

  .achievement-tab {
    flex: 1;
    min-width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    background: transparent;
    color: var(--color-fg-muted);
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 0.8125rem;
    letter-spacing: 0.01em;
    transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease;
    cursor: pointer;
    white-space: nowrap;
  }

  .achievement-tab:hover:not(.active) {
    background: var(--color-surface-card);
    color: var(--color-fg-secondary);
  }

  .achievement-tab:focus-visible {
    border-color: var(--layer-brand-150);
    box-shadow: var(--shadow-focus);
    outline: none;
  }

  .achievement-tab.active {
    background: var(--color-brand-50);
    border-color: var(--layer-brand-150);
    color: var(--color-brand-600);
  }

  .achievement-card-layout {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    width: 100%;
  }

  .achievement-card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .achievement-card-title-section {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    flex: 1;
    min-width: 0;
  }

  .achievement-card-title-section h3 {
    word-break: break-word;
    line-height: 1.4;
  }

  .achievement-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-left: 2.75rem;
  }

  @media (max-width: 640px) {
    .achievement-card-body {
      padding-left: 0;
    }
  }

  .achievement-card-body p {
    line-height: 1.5;
  }

  .achievement-card-progress {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-lg);
    background: var(--color-neutral-50);
    width: fit-content;
  }

  .achievement-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-subtle);
  }

  @media (max-width: 640px) {
    .achievement-card-footer {
      flex-direction: column;
      align-items: stretch;
      gap: 0.875rem;
    }
  }

  .achievement-card-rewards {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .achievement-reward-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-lg);
    background: var(--color-neutral-50);
  }

  .achievement-card-status {
    flex: 0 0 auto;
    min-width: 120px;
  }

  @media (max-width: 640px) {
    .achievement-card-status {
      min-width: 100%;
    }
  }

  .achievement-status-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-radius: var(--radius-lg);
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .achievement-status-unlocked {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  .achievement-status-locked {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    color: white;
  }

  .achievement-status-progress {
    background: linear-gradient(135deg, var(--color-brand-500) 0%, var(--color-brand-600) 100%);
    color: white;
  }
</style>

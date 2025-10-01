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
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl flex-shrink-0 {isUnlocked ? 'bg-black/20' : isLocked ? 'bg-gpb-gray-200' : 'bg-gpb-violet/10'}">
                <Icon
                  name={(achievement.icon as IconName) || 'crown'}
                  size="md"
                  class={isUnlocked ? 'text-gpb-gold' : isLocked ? 'text-gpb-gray-500' : 'text-gpb-violet'}
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-card-title text-sm truncate">{achievement.title}</h3>
                  <Badge variant={rarityVariants[achievement.rarity]} size="sm" class="flex-shrink-0">
                    {getRarityName(achievement.rarity)}
                  </Badge>
                </div>

                <p class="font-ui-secondary text-xs line-clamp-1 {isUnlocked ? 'opacity-90' : 'text-gpb-gray-600'}">
                  {achievement.description}
                </p>
              </div>

              <div class="flex items-center gap-3 flex-shrink-0">
                {#if achievement.progress && !isUnlocked}
                  <div class="flex items-center gap-1 px-2 py-1 rounded-lg {isUnlocked ? 'glass-effect' : 'bg-gpb-gray-50'}">
                    <span class="font-ui-primary {isUnlocked ? 'opacity-90' : 'text-gpb-gray-700'} text-xs whitespace-nowrap">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                {/if}

                {#if achievement.rewards?.coins || achievement.rewards?.crystals}
                  <div class="flex items-center gap-2 text-xs">
                    {#if achievement.rewards.coins}
                      <div class="flex items-center gap-1">
                        <Icon name="coin" size="sm" class="text-gpb-gold" />
                        <span class="font-ui-primary font-semibold">{Math.floor(achievement.rewards.coins)}</span>
                      </div>
                    {/if}
                    {#if achievement.rewards.crystals}
                      <div class="flex items-center gap-1">
                        <Icon name="crystal" size="sm" class="text-gpb-violet" />
                        <span class="font-ui-primary font-semibold">{Math.floor(achievement.rewards.crystals)}</span>
                      </div>
                    {/if}
                  </div>
                {/if}

                <div class="flex-shrink-0">
                  {#if isUnlocked}
                    <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <Icon name="check" color="white" size="sm" />
                    </div>
                  {:else if isLocked}
                    <div class="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                      <Icon name="shield" color="white" size="sm" />
                    </div>
                  {:else}
                    <div class="w-8 h-8 rounded-full bg-gpb-raspberry flex items-center justify-center pulse-border">
                      <Icon name="crown" color="white" size="sm" />
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
</style>

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
    <div class="tab-container">
      <button
        class="tab-item {selectedCategory === 'all' ? 'tab-item-active' : ''}"
        onclick={() => handleCategoryChange('all')}
        type="button"
      >
        <Icon name="star" size="sm" />
        <span>Все</span>
        <Badge variant="new" size="sm" class="ml-2">{$achievementStats.totalAvailable}</Badge>
      </button>
      {#each Object.entries(categoryNames) as [category, name]}
        <button
          class="tab-item {selectedCategory === category ? 'tab-item-active' : ''}"
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each filteredAchievements as achievement, index (achievement.id)}
          {@const isUnlocked = achievement.status === 'unlocked'}
          {@const isLocked = achievement.status === 'locked'}
          {@const progress = getProgressPercentage(achievement)}

          <Card
            gradient={isUnlocked ? rarityGradients[achievement.rarity] : null}
            decorative={isUnlocked}
            class="stagger-item {isUnlocked ? 'text-white' : ''} {isLocked ? 'opacity-60' : ''}"
            style="animation-delay: {index * 0.1}s"
          >
            <div class="flex items-start gap-4 mb-4">
              <div class="p-3 rounded-xl {isUnlocked ? 'bg-white/20 neon-glow' : 'bg-gpb-gray-100'}">
                <Icon
                  name={(achievement.icon as IconName) || 'crown'}
                  size="lg"
                  class={isUnlocked ? 'text-current' : 'text-gpb-gray-400'}
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-card-title">{achievement.title}</h3>
                  <Badge variant={rarityVariants[achievement.rarity]} size="sm">
                    {getRarityName(achievement.rarity)}
                  </Badge>
                </div>

                <p class="font-ui-secondary mb-3 line-clamp-2 {isUnlocked ? 'opacity-90' : 'text-gpb-gray-600'}">
                  {achievement.description}
                </p>
              </div>

              <div class="flex-shrink-0">
                {#if isUnlocked}
                  <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Icon name="check" color="white" size="sm" />
                  </div>
                {:else if isLocked}
                  <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <Icon name="shield" color="white" size="sm" />
                  </div>
                {:else}
                  <div class="w-10 h-10 rounded-full bg-gpb-raspberry flex items-center justify-center pulse-border">
                    <Icon name="crown" color="white" size="sm" />
                  </div>
                {/if}
              </div>
            </div>

            {#if achievement.progress && !isUnlocked}
              <div class="mb-4">
                <div class="flex items-center gap-2 p-2 rounded-lg {isUnlocked ? 'glass-effect' : 'bg-gpb-gray-50'} mb-2">
                  <Icon name="building" size="sm" class={isUnlocked ? 'text-current opacity-80' : 'text-gpb-gray-500'} />
                  <span class="font-ui-primary {isUnlocked ? 'opacity-90' : 'text-gpb-gray-700'} text-sm">
                    Прогресс: {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <ProgressBar
                  value={progress}
                  color={progress === 100 ? 'emerald' : 'violet'}
                  showPercentage={true}
                  animated={true}
                />
              </div>
            {/if}

            {#if isUnlocked && achievement.unlockDate}
              <div class="flex items-center gap-2 p-2 rounded-lg glass-effect mb-4">
                <Icon name="check" size="sm" class="text-green-400" />
                <span class="font-ui-primary opacity-90 text-sm">
                  Разблокировано {new Date(achievement.unlockDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
            {/if}

            {#if achievement.rewards}
              <div class="flex items-center justify-between pt-4 border-t {isUnlocked ? 'border-white/20' : 'border-gpb-gray-200'}">
                <div class="flex items-center gap-2">
                  <Icon name="star" size="sm" class="text-gpb-gold neon-glow" />
                  <span class="font-ui-primary font-semibold text-sm">
                    Награда:
                  </span>
                </div>
                <div class="flex items-center gap-3 text-sm">
                  {#if achievement.rewards.coins}
                    <div class="flex items-center gap-1">
                      <Icon name="coin" size="sm" class="text-gpb-gold" />
                      <span class="font-ui-primary font-semibold">{achievement.rewards.coins}</span>
                    </div>
                  {/if}
                  {#if achievement.rewards.crystals}
                    <div class="flex items-center gap-1">
                      <Icon name="crystal" size="sm" class="text-gpb-violet" />
                      <span class="font-ui-primary font-semibold">{achievement.rewards.crystals}</span>
                    </div>
                  {/if}
                  {#if achievement.rewards.experience}
                    <div class="flex items-center gap-1">
                      <Icon name="star" size="sm" class="text-gpb-gold" />
                      <span class="font-ui-primary font-semibold">{achievement.rewards.experience} опыта</span>
                    </div>
                  {/if}
                  {#if achievement.rewards.title}
                    <div class="flex items-center gap-1">
                      <Icon name="crown" size="sm" class="text-gpb-violet" />
                      <span class="font-ui-primary font-semibold text-xs">{achievement.rewards.title}</span>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
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


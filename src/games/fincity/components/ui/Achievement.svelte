<script lang="ts">
  import { onMount } from 'svelte';
  import { achievements, achievementStats } from '../../stores/achievements';
  import { modal, closeModal } from '../../stores/ui';
  import { Button, Icon, ProgressBar, Modal } from './';
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

  const rarityColors: Record<string, string> = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50'
  };

  const rarityBadges: Record<string, string> = {
    common: 'bg-gray-100 text-gray-700',
    rare: 'bg-blue-100 text-blue-700',
    epic: 'bg-purple-100 text-purple-700',
    legendary: 'bg-yellow-100 text-yellow-700'
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
  class="achievement-modal"
>
  {#snippet header()}
    <div class="title-section">
      <Icon name="star" size="lg" color="var(--color-crystal-purple)" />
      <div class="title-details">
        <h2 class="modal-title">Достижения</h2>
        <p class="achievement-subtitle text-sm text-gray-600">
          {$achievementStats.totalUnlocked} из {$achievementStats.totalAvailable}
          ({$achievementStats.completionPercentage}%)
        </p>
      </div>
    </div>
  {/snippet}

  <div class="achievement-tabs">
    <button
      class="tab-button {selectedCategory === 'all' ? 'active' : ''}"
      onclick={() => handleCategoryChange('all')}
      type="button"
    >
      <Icon name="star" size="sm" />
      <span>Все</span>
    </button>
    {#each Object.entries(categoryNames) as [category, name]}
      <button
        class="tab-button {selectedCategory === category ? 'active' : ''}"
        onclick={() => handleCategoryChange(category as AchievementCategory)}
        type="button"
      >
        <Icon name={(categoryIcons[category as AchievementCategory] as IconName) || 'achievement'} size="sm" />
        <span>{name}</span>
      </button>
    {/each}
  </div>

  <div class="achievements-content">
    <div class="achievements-grid">
      {#each filteredAchievements as achievement (achievement.id)}
        <div
          class="achievement-card border-2 rounded-lg p-4 transition-all duration-200 {rarityColors[achievement.rarity]} {achievement.status === 'unlocked' ? 'opacity-100' : 'opacity-60'}"
        >
          <div class="flex items-start gap-3">
            <div class="achievement-icon flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center {achievement.status === 'unlocked' ? 'ring-2 ring-purple-500' : ''}">
              <Icon
                name={(achievement.icon as IconName) || 'achievement'}
                size="lg"
                class={achievement.status === 'unlocked' ? 'text-purple-500' : 'text-gray-400'}
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 truncate">{achievement.title}</h3>
                <span class="achievement-rarity text-xs px-2 py-0.5 rounded-full {rarityBadges[achievement.rarity]}">
                  {getRarityName(achievement.rarity)}
                </span>
              </div>

              <p class="text-sm text-gray-600 mb-2">{achievement.description}</p>

              {#if achievement.status === 'unlocked'}
                <div class="flex items-center gap-2 text-sm text-green-600">
                  <Icon name="check" size="sm" />
                  Разблокировано
                  {#if achievement.unlockDate}
                    <span class="text-xs text-gray-500">
                      {new Date(achievement.unlockDate).toLocaleDateString('ru-RU')}
                    </span>
                  {/if}
                </div>
              {:else if achievement.progress}
                <div class="space-y-1">
                  <div class="flex justify-between text-xs text-gray-600">
                    <span>Прогресс</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <ProgressBar
                    value={getProgressPercentage(achievement)}
                    size="sm"
                    class={'achievement-progress'}
                  />
                </div>
              {:else}
                <div class="text-sm text-gray-500">Требуется разблокировка</div>
              {/if}

              {#if achievement.rewards}
                <div class="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200">
                  <span class="text-xs text-gray-500">Награда:</span>
                  <div class="flex items-center gap-2 text-xs">
                    {#if achievement.rewards.coins}
                      <div class="flex items-center gap-1">
                        <Icon name="coin" size="xs" />
                        {achievement.rewards.coins}
                      </div>
                    {/if}
                    {#if achievement.rewards.crystals}
                      <div class="flex items-center gap-1">
                        <Icon name="crystal" size="xs" />
                        {achievement.rewards.crystals}
                      </div>
                    {/if}
                    {#if achievement.rewards.experience}
                      <div class="flex items-center gap-1">
                        <Icon name="star" size="xs" />
                        {achievement.rewards.experience} опыта
                      </div>
                    {/if}
                    {#if achievement.rewards.title}
                      <div class="flex items-center gap-1">
                        <Icon name="crown" size="xs" />
                        {achievement.rewards.title}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>

    {#if filteredAchievements.length === 0}
      <div class="text-center py-8 text-gray-500">
        <Icon name="star" size="xl" class="mx-auto mb-2 opacity-50" />
        <p>Достижений в этой категории пока нет</p>
      </div>
    {/if}
  </div>
</Modal>

{#if recentlyUnlocked}
  <div class="achievement-unlock-notification">
    <div class="flex items-center gap-3">
      <div class="achievement-unlock-icon">
        <Icon name={(recentlyUnlocked.icon as IconName) || 'achievement'} size="lg" class="text-white" />
      </div>
      <div class="flex-1">
        <div class="text-sm font-medium text-purple-600 mb-1">Достижение разблокировано!</div>
        <div class="font-semibold text-gray-900">{recentlyUnlocked.title}</div>
        <div class="text-xs text-gray-600">{recentlyUnlocked.description}</div>
      </div>
    </div>
  </div>
{/if}

<style>
  @reference "../../app.css";

  .title-section {
    @apply flex items-center;
    gap: 0.75rem;
  }

  .title-details {
    @apply flex flex-col;
  }

  .achievement-tabs {
    @apply flex p-4 overflow-x-auto;
    gap: 0.5rem;
  }

  .achievement-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab-button {
    @apply px-4 py-2 text-sm font-medium rounded-lg transition-colors;
    @apply border border-gray-200 bg-white text-gray-700;
    @apply flex items-center gap-2;
    min-width: max-content;
  }

  .tab-button.active {
    @apply bg-purple-600 text-white border-purple-600;
  }

  .tab-button:hover:not(.active) {
    @apply bg-gray-50;
  }

  .tab-button span {
    @apply whitespace-nowrap;
  }

  .achievements-content {
    @apply p-4;
  }

  .achievements-grid {
    @apply space-y-4;
  }

  .achievement-card {
    transition: border-color 0.2s ease;
  }

  .achievement-card:hover {
    border-color: #7c3aed;
  }

  .achievement-progress {
    height: 4px;
  }

  .achievement-rarity {
    font-weight: 500;
  }

  .achievement-unlock-notification {
    @apply fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border-2 border-purple-500 p-4 max-w-sm;
  }

  .achievement-unlock-icon {
    @apply w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center;
    border: 2px solid #7c3aed;
  }
</style>

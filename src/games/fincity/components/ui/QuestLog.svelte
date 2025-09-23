<script lang="ts">
  import { Icon, Button, Card, ProgressBar } from '.';
  import { modal, closeModal } from '../../stores/ui';
  import { activeQuests, completedQuests, mainQuests, sideQuests, startQuest, completeQuest } from '../../stores/quests';
  import { level } from '../../stores/playerData';
  import { QuestStatus } from '../../types/Quest';
  import type { Quest } from '../../types/Quest';
  import type { IconName } from '../../types/Icon';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const isOpen = $derived($modal.isOpen && $modal.type === 'quest_log');

  let selectedTab = $state<'active' | 'completed' | 'main' | 'side'>('active');

  const questsByTab = $derived(() => {
    switch (selectedTab) {
      case 'active':
        return $activeQuests;
      case 'completed':
        return $completedQuests;
      case 'main':
        return $mainQuests;
      case 'side':
        return $sideQuests;
      default:
        return [];
    }
  });

  function getQuestTypeIcon(type: string): IconName {
    switch (type) {
      case 'TUTORIAL':
        return 'star';
      case 'BUILD':
        return 'hammer';
      case 'COLLECT':
        return 'coin';
      case 'EXPLORE':
        return 'quest';
      default:
        return 'book';
    }
  }

  function getQuestTypeColor(type: string): string {
    switch (type) {
      case 'TUTORIAL':
        return 'var(--color-coin-gold)';
      case 'BUILD':
        return 'var(--color-gpb-blue)';
      case 'COLLECT':
        return 'var(--color-success-green)';
      case 'EXPLORE':
        return 'var(--color-crystal-purple)';
      default:
        return 'var(--color-gray-500)';
    }
  }

  function getQuestProgress(quest: Quest): number {
    if (quest.status === QuestStatus.COMPLETED) return 100;
    if (quest.status === QuestStatus.LOCKED || quest.status === QuestStatus.AVAILABLE) return 0;

    const requirement = quest.requirements[0];
    if (!requirement) return 0;

    switch (requirement.type) {
      case 'level':
        return Math.min((Number($level) / Number(requirement.target)) * 100, 100);
      case 'build':
      case 'collect':
      case 'building_count':
        return Math.min((requirement.currentAmount || 0) / (requirement.amount || 1) * 100, 100);
      default:
        return 0;
    }
  }

  function getRequirementText(quest: Quest): string {
    const req = quest.requirements[0];
    if (!req) return '';

    switch (req.type) {
      case 'build':
        return `Построить: ${req.target}`;
      case 'collect':
        return `Собрать: ${req.amount} ${req.target}`;
      case 'level':
        return `Достичь ${req.target} уровня`;
      case 'building_count':
        return `Построить ${req.amount} зданий`;
      default:
        return '';
    }
  }

  function handleStartQuest(quest: Quest) {
    if (quest.status === QuestStatus.AVAILABLE) {
      startQuest(quest.id);
    }
  }

  function formatRewards(rewards: { coins?: number; crystals?: number; experience?: number }): string {
    const parts = [];
    if (rewards.coins) parts.push(`${rewards.coins} монет`);
    if (rewards.crystals) parts.push(`${rewards.crystals} кристаллов`);
    if (rewards.experience) parts.push(`${rewards.experience} опыта`);
    return parts.join(', ');
  }
</script>

{#if isOpen}
  <div 
    class="modal-overlay quest-log-overlay {className}" 
    onclick={closeModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); } }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="modal-shell quest-log" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); } }} role="dialog" aria-label="Журнал квестов" tabindex="0">
      <header class="modal-header quest-header">
        <div class="modal-header-content header-content">
          <div class="title-section">
            <Icon name="quest" color="var(--color-crystal-purple)" size="lg" />
            <h2 class="modal-title quest-title">Журнал квестов</h2>
          </div>

          <Button variant="ghost" size="sm" onclick={closeModal} class="modal-close-button close-btn">
            <Icon name="close" />
          </Button>
        </div>

        <div class="modal-tabs quest-tabs">
          <button
            class="modal-tab-button tab-button {selectedTab === 'active' ? 'active' : ''}"
            onclick={() => selectedTab = 'active'}
          >
            <Icon name="quest" size="sm" />
            <span>Активные</span>
            <div class="modal-tab-badge tab-badge">{$activeQuests.length}</div>
          </button>

          <button
            class="modal-tab-button tab-button {selectedTab === 'main' ? 'active' : ''}"
            onclick={() => selectedTab = 'main'}
          >
            <Icon name="star" size="sm" />
            <span>Основные</span>
          </button>

          <button
            class="modal-tab-button tab-button {selectedTab === 'side' ? 'active' : ''}"
            onclick={() => selectedTab = 'side'}
          >
            <Icon name="building" size="sm" />
            <span>Дополнительные</span>
          </button>

          <button
            class="modal-tab-button tab-button {selectedTab === 'completed' ? 'active' : ''}"
            onclick={() => selectedTab = 'completed'}
          >
            <Icon name="check" size="sm" />
            <span>Завершенные</span>
            <div class="modal-tab-badge tab-badge">{$completedQuests.length}</div>
          </button>
        </div>
      </header>

      <div class="quest-content">
        {#if questsByTab.length === 0}
          <div class="no-quests">
            <Icon name="quest" size="lg" color="var(--color-gray-400)" />
            <h3>Квестов нет</h3>
            <p class="text-gray-500">
              {#if selectedTab === 'active'}
                Все активные квесты завершены!
              {:else if selectedTab === 'completed'}
                Пока не завершен ни один квест.
              {:else}
                В этой категории квестов пока нет.
              {/if}
            </p>
          </div>
        {:else}
          <div class="quest-list">
            {#each questsByTab() as questTyped (questTyped.id)}
              {@const progress = getQuestProgress(questTyped)}
              {@const isCompleted = questTyped.status === QuestStatus.COMPLETED}
              {@const isLocked = questTyped.status === QuestStatus.LOCKED}
              {@const canStart = questTyped.status === QuestStatus.AVAILABLE}

              <Card class="quest-card {isCompleted ? 'completed' : isLocked ? 'locked' : 'available'}">
                <div class="quest-card-header">
                  <div class="quest-icon">
                    <Icon
                      name={getQuestTypeIcon(questTyped.type)}
                      color={getQuestTypeColor(questTyped.type)}
                      size="lg"
                    />
                  </div>

                  <div class="quest-info">
                    <div class="quest-meta">
                      <h3 class="quest-title-card">{questTyped.title}</h3>
                      <div class="quest-badges">
                        {#if questTyped.isMainQuest}
                          <span class="quest-badge main">Основной</span>
                        {/if}
                        <span class="quest-badge type">{questTyped.type}</span>
                      </div>
                    </div>

                    <p class="quest-description">{questTyped.description}</p>
                  </div>

                  <div class="quest-status">
                    {#if isCompleted}
                      <div class="status-indicator completed">
                        <Icon name="check" color="white" size="sm" />
                      </div>
                    {:else if isLocked}
                      <div class="status-indicator locked">
                        <Icon name="shield" color="var(--color-gray-400)" size="sm" />
                      </div>
                    {:else}
                      <div class="status-indicator active">
                        <Icon name="quest" color="white" size="sm" />
                      </div>
                    {/if}
                  </div>
                </div>

                <div class="quest-requirements">
                  <div class="requirement-text">
                    <Icon name="building" size="sm" color="var(--color-gray-500)" />
                    <span>{getRequirementText(questTyped)}</span>
                  </div>

                  {#if !isCompleted && !isLocked}
                    <ProgressBar
                      value={progress}
                      color={progress === 100 ? 'mint' : 'violet'}
                      showPercentage={true}
                      class="quest-progress"
                    />
                  {/if}
                </div>

                <div class="quest-rewards">
                  <div class="rewards-section">
                    <Icon name="star" size="sm" color="var(--color-coin-gold)" />
                    <span class="rewards-text">{formatRewards(questTyped.rewards)}</span>
                  </div>

                  {#if canStart}
                    <Button
                      variant="primary"
                      size="sm"
                      onclick={() => handleStartQuest(questTyped)}
                    >
                      Начать
                    </Button>
                  {:else if questTyped.status === QuestStatus.IN_PROGRESS && progress === 100}
                    <Button
                      variant="primary"
                      size="sm"
                      onclick={() => completeQuest(questTyped.id)}
                    >
                      Завершить
                    </Button>
                  {/if}
                </div>
              </Card>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}


<style>
  /* svelte-ignore css-unused-selector */
  @reference "../../app.css";
  .quest-header { @apply flex-shrink-0; }

  .title-section {
    @apply flex items-center gap-3;
  }

  .quest-tabs { @apply overflow-x-auto; }

  .quest-content {
    @apply flex-1 overflow-y-auto p-md;
  }

  .no-quests {
    @apply flex flex-col items-center justify-center py-16;
    @apply text-center;
  }

  .no-quests h3 {
    @apply text-lg font-semibold text-gray-900;
  }

  .no-quests p {
    @apply mt-4;
  }

  .quest-list {
    @apply space-y-4;
  }

  :global(.quest-card) {
    @apply transition-colors duration-200;
  }

  :global(.quest-card.completed) {
    @apply bg-melissa/5 border-melissa/30;
  }

  :global(.quest-card.locked) { @apply opacity-60 bg-gray-50; }

  :global(.quest-card.available) {
    @apply hover:border-crystal-purple-30;
  }

  .quest-card-header {
    @apply flex items-start gap-sm mb-sm;
  }

  .quest-icon {
    @apply flex-shrink-0;
  }

  .quest-info {
    @apply flex-1 min-w-0;
  }

  .quest-meta {
    @apply flex items-start justify-between mb-2;
  }

  .quest-title-card { @apply font-semibold text-gray-900 truncate mr-4; }

  .quest-badges {
    @apply flex gap-2 flex-shrink-0;
  }

  .quest-badge {
    @apply px-2 py-1 text-xs font-medium rounded;
  }

  .quest-badge.main {
    @apply bg-coin-gold-20 text-coin-gold;
  }

  .quest-badge.type { @apply bg-gray-100 text-gray-600; }

  .quest-description { @apply text-sm text-gray-600 line-clamp-2; }

  .quest-status {
    @apply flex-shrink-0;
  }

  .status-indicator {
    @apply w-8 h-8 rounded-full flex items-center justify-center;
  }

  .status-indicator.completed {
    @apply bg-success-green;
  }

  .status-indicator.locked { @apply bg-gray-300; }

  .status-indicator.active {
    @apply bg-crystal-purple;
  }

  :global(.quest-requirements) {
    @apply space-y-2 mb-sm;
  }

  :global(.requirement-text) { @apply flex items-center gap-sm text-sm text-gray-600; }

  :global(.quest-progress) {
    @apply w-full;
  }

  .quest-rewards {
    @apply flex items-center justify-between;
  }

  :global(.rewards-section) {
    @apply flex items-center gap-sm;
  }

  :global(.rewards-text) { @apply text-sm font-medium text-gray-700; }

  @media (max-width: 500px) {
    .quest-log {
      @apply max-h-screen;
    }

    .header-content {
      @apply p-sm;
    }

    .quest-content {
      @apply p-sm;
    }

    .quest-tabs {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    
    .quest-tabs::-webkit-scrollbar {
      display: none;
    }

    .tab-button {
      @apply px-3 py-3 text-xs;
      min-width: max-content;
    }

    .tab-button span {
      @apply truncate;
    }

    .quest-card-header {
      @apply gap-sm;
    }

    .quest-meta {
      @apply flex-col items-start space-y-2;
    }

    .quest-badges {
      @apply self-start;
    }
  }

  @media (max-width: 400px) {
    .tab-button {
      @apply px-2 py-3;
    }

    .tab-button span {
      @apply hidden;
    }
  }
</style>
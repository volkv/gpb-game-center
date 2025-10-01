<script lang="ts">
  import { Icon, Button, Card, ProgressBar, Modal } from '.';
  import { Badge } from '$lib';
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

  const questsByTab = $derived(
    selectedTab === 'active' ? $activeQuests :
    selectedTab === 'completed' ? $completedQuests :
    selectedTab === 'main' ? $mainQuests :
    selectedTab === 'side' ? $sideQuests :
    []
  );

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
    if (rewards.coins) parts.push(`${Math.floor(rewards.coins)} монет`);
    if (rewards.crystals) parts.push(`${Math.floor(rewards.crystals)} кристаллов`);
    if (rewards.experience) parts.push(`${Math.floor(rewards.experience)} опыта`);
    return parts.join(', ');
  }
</script>

<Modal
  open={isOpen}
  title="Журнал квестов"
  onclose={closeModal}
  size="lg"
  class={className}
>
  {#snippet header()}
    <div class="modal-title-section flex items-center gap-3">
      <div class="p-2 rounded-xl gradient-mystery neon-glow">
        <Icon name="quest" size="lg" />
      </div>
      <div>
        <h2 class="modal-title-game">Журнал квестов</h2>
        <p class="text-sm opacity-90">Активные задания и достижения</p>
      </div>
    </div>

  {/snippet}

  <div class="space-y-6">
    <div class="quest-tabs">
      <button
        class="quest-tab {selectedTab === 'active' ? 'active' : ''}"
        onclick={() => selectedTab = 'active'}
        type="button"
      >
        <Icon name="quest" size="sm" />
        <span>Активные</span>
        <Badge variant="new" size="sm" class="ml-2">{$activeQuests.length}</Badge>
      </button>

      <button
        class="quest-tab {selectedTab === 'main' ? 'active' : ''}"
        onclick={() => selectedTab = 'main'}
        type="button"
      >
        <Icon name="star" size="sm" />
        <span>Основные</span>
      </button>

      <button
        class="quest-tab {selectedTab === 'side' ? 'active' : ''}"
        onclick={() => selectedTab = 'side'}
        type="button"
      >
        <Icon name="building" size="sm" />
        <span>Дополнительные</span>
      </button>

      <button
        class="quest-tab {selectedTab === 'completed' ? 'active' : ''}"
        onclick={() => selectedTab = 'completed'}
        type="button"
      >
        <Icon name="check" size="sm" />
        <span>Завершенные</span>
        <Badge variant="pro" size="sm" class="ml-2">{$completedQuests.length}</Badge>
      </button>
    </div>

    {#if questsByTab.length === 0}
      <Card class="text-center py-12">
        <div class="flex flex-col items-center gap-4">
          <div class="p-4 rounded-full bg-gpb-gray-100">
            <Icon name="quest" size="xl" class="text-gpb-gray-400" />
          </div>
          <div>
            <h3 class="font-card-title text-gpb-gray-700 mb-2">Квестов нет</h3>
            <p class="font-ui-secondary text-gpb-gray-500">
              {#if selectedTab === 'active'}
                Все активные квесты завершены!
              {:else if selectedTab === 'completed'}
                Пока не завершен ни один квест.
              {:else}
                В этой категории квестов пока нет.
              {/if}
            </p>
          </div>
        </div>
      </Card>
    {:else}
      <div class="space-y-3">
        {#each questsByTab as questTyped, index (questTyped.id)}
          {@const progress = getQuestProgress(questTyped)}
          {@const isCompleted = questTyped.status === QuestStatus.COMPLETED}
          {@const isLocked = questTyped.status === QuestStatus.LOCKED}
          {@const canStart = questTyped.status === QuestStatus.AVAILABLE}
          {@const isActive = questTyped.status === QuestStatus.IN_PROGRESS}

          <Card
            gradient={isCompleted ? 'wealth' : null}
            decorative={isCompleted}
            class="stagger-item {isCompleted ? 'text-white' : 'bg-white border-2'} {isLocked ? 'opacity-50 border-gpb-gray-200' : isCompleted ? '' : isActive ? 'border-gpb-blue' : 'border-gpb-violet'}"
            style="animation-delay: {index * 0.1}s"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl flex-shrink-0 {isCompleted ? 'bg-black/20' : isLocked ? 'bg-gpb-gray-200' : isActive ? 'bg-gpb-blue/10' : 'bg-gpb-violet/10'}">
                <Icon
                  name={getQuestTypeIcon(questTyped.type)}
                  size="md"
                  class={isCompleted ? 'text-gpb-gold' : isLocked ? 'text-gpb-gray-500' : isActive ? 'text-gpb-blue' : 'text-gpb-violet'}
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-card-title text-sm truncate">{questTyped.title}</h3>
                  {#if questTyped.isMainQuest}
                    <Badge variant="hot" size="sm" class="flex-shrink-0">Основной</Badge>
                  {/if}
                </div>

                <p class="font-ui-secondary text-xs line-clamp-1 {isCompleted ? 'opacity-90' : 'text-gpb-gray-600'}">
                  {getRequirementText(questTyped)}
                </p>
              </div>

              <div class="flex items-center gap-3 flex-shrink-0">
                {#if !isCompleted && !isLocked}
                  <div class="flex items-center gap-1 px-2 py-1 rounded-lg {isCompleted ? 'glass-effect' : 'bg-gpb-gray-50'}">
                    <span class="font-ui-primary {isCompleted ? 'opacity-90' : 'text-gpb-gray-700'} text-xs whitespace-nowrap">
                      {Math.round(progress)}%
                    </span>
                  </div>
                {/if}

                {#if questTyped.rewards.coins || questTyped.rewards.crystals}
                  <div class="flex items-center gap-2 text-xs">
                    {#if questTyped.rewards.coins}
                      <div class="flex items-center gap-1">
                        <Icon name="coin" size="sm" class="text-gpb-gold" />
                        <span class="font-ui-primary font-semibold">{Math.floor(questTyped.rewards.coins)}</span>
                      </div>
                    {/if}
                    {#if questTyped.rewards.crystals}
                      <div class="flex items-center gap-1">
                        <Icon name="crystal" size="sm" class="text-gpb-violet" />
                        <span class="font-ui-primary font-semibold">{Math.floor(questTyped.rewards.crystals)}</span>
                      </div>
                    {/if}
                  </div>
                {/if}

                {#if canStart}
                  <Button
                    variant="secondary"
                    size="sm"
                    onclick={() => handleStartQuest(questTyped)}
                    class="hover-lift flex-shrink-0"
                  >
                    Начать
                  </Button>
                {:else if isActive && progress === 100}
                  <Button
                    variant="primary"
                    size="sm"
                    onclick={() => completeQuest(questTyped.id)}
                    class="hover-lift animate-pulse-glow flex-shrink-0"
                  >
                    Завершить
                  </Button>
                {:else}
                  <div class="flex-shrink-0">
                    {#if isCompleted}
                      <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Icon name="check" color="white" size="sm" />
                      </div>
                    {:else if isLocked}
                      <div class="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                        <Icon name="shield" color="white" size="sm" />
                      </div>
                    {:else}
                      <div class="w-8 h-8 rounded-full bg-gpb-blue flex items-center justify-center pulse-border">
                        <Icon name="quest" color="white" size="sm" />
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</Modal>

<style>
  .quest-tabs {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: var(--radius-lg);
    background-color: var(--color-neutral-50);
    border: 1px solid var(--color-border-subtle);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .quest-tabs::-webkit-scrollbar {
    display: none;
  }

  .quest-tab {
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

  .quest-tab:hover:not(.active) {
    background: var(--color-surface-card);
    color: var(--color-fg-secondary);
  }

  .quest-tab:focus-visible {
    border-color: var(--layer-brand-150);
    box-shadow: var(--shadow-focus);
    outline: none;
  }

  .quest-tab.active {
    background: var(--color-brand-50);
    border-color: var(--layer-brand-150);
    color: var(--color-brand-600);
  }
</style>

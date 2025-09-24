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
    <div class="tab-container">
      <button
        class="tab-item {selectedTab === 'active' ? 'tab-item-active' : ''}"
        onclick={() => selectedTab = 'active'}
      >
        <Icon name="quest" size="sm" />
        <span>Активные</span>
        <Badge variant="new" size="sm" class="ml-2">{$activeQuests.length}</Badge>
      </button>

      <button
        class="tab-item {selectedTab === 'main' ? 'tab-item-active' : ''}"
        onclick={() => selectedTab = 'main'}
      >
        <Icon name="star" size="sm" />
        <span>Основные</span>
      </button>

      <button
        class="tab-item {selectedTab === 'side' ? 'tab-item-active' : ''}"
        onclick={() => selectedTab = 'side'}
      >
        <Icon name="building" size="sm" />
        <span>Дополнительные</span>
      </button>

      <button
        class="tab-item {selectedTab === 'completed' ? 'tab-item-active' : ''}"
        onclick={() => selectedTab = 'completed'}
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
      <div class="space-y-4">
        {#each questsByTab() as questTyped, index (questTyped.id)}
          {@const progress = getQuestProgress(questTyped)}
          {@const isCompleted = questTyped.status === QuestStatus.COMPLETED}
          {@const isLocked = questTyped.status === QuestStatus.LOCKED}
          {@const canStart = questTyped.status === QuestStatus.AVAILABLE}

          <Card
            gradient={isCompleted ? 'wealth' : isLocked ? null : 'electric'}
            decorative={!isLocked}
            class="stagger-item text-white {isCompleted ? '' : isLocked ? 'opacity-60' : ''}"
            style="animation-delay: {index * 0.1}s"
          >
            <div class="flex items-start gap-4 mb-4">
              <div class="p-3 rounded-xl bg-white/20 neon-glow">
                <Icon
                  name={getQuestTypeIcon(questTyped.type)}
                  size="lg"
                  class="text-current"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-card-title">{questTyped.title}</h3>
                  <div class="flex gap-2">
                    {#if questTyped.isMainQuest}
                      <Badge variant="hot" size="sm">Основной</Badge>
                    {/if}
                    <Badge variant="new" size="sm">{questTyped.type}</Badge>
                  </div>
                </div>

                <p class="font-ui-secondary opacity-90 mb-3 line-clamp-2">{questTyped.description}</p>
              </div>

              <div class="flex-shrink-0">
                {#if isCompleted}
                  <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Icon name="check" color="white" size="sm" />
                  </div>
                {:else if isLocked}
                  <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <Icon name="shield" color="white" size="sm" />
                  </div>
                {:else}
                  <div class="w-10 h-10 rounded-full bg-gpb-raspberry flex items-center justify-center pulse-border">
                    <Icon name="quest" color="white" size="sm" />
                  </div>
                {/if}
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2 p-2 rounded-lg glass-effect">
                <Icon name="building" size="sm" class="text-current opacity-80" />
                <span class="font-ui-primary opacity-90">{getRequirementText(questTyped)}</span>
              </div>

              {#if !isCompleted && !isLocked}
                <ProgressBar
                  value={progress}
                  color={progress === 100 ? 'emerald' : 'violet'}
                  showPercentage={true}
                  animated={true}
                />
              {/if}
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-white/20">
              <div class="flex items-center gap-2">
                <Icon name="star" size="sm" class="text-gpb-gold neon-glow" />
                <span class="font-ui-primary font-semibold">{formatRewards(questTyped.rewards)}</span>
              </div>

              {#if canStart}
                <Button
                  variant="secondary"
                  size="sm"
                  onclick={() => handleStartQuest(questTyped)}
                  class="hover-lift"
                >
                  Начать
                </Button>
              {:else if questTyped.status === QuestStatus.IN_PROGRESS && progress === 100}
                <Button
                  variant="primary"
                  size="sm"
                  onclick={() => completeQuest(questTyped.id)}
                  class="hover-lift animate-pulse-glow"
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
</Modal>


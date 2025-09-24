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
    class="fincity-quest-log-overlay {className}"
    onclick={closeModal}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); } }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div class="fincity-quest-log" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); } }} role="dialog" aria-label="Журнал квестов" tabindex="0">
      <header class="fincity-quest-header">
        <div class="fincity-header-content">
          <div class="fincity-title-section">
            <Icon name="quest" color="var(--color-crystal-purple)" size="lg" />
            <h2 class="fincity-quest-title">Журнал квестов</h2>
          </div>

          <Button variant="ghost" size="sm" onclick={closeModal} class="modal-close-button close-btn">
            <Icon name="close" />
          </Button>
        </div>

        <div class="fincity-quest-tabs">
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

      <div class="fincity-quest-content">
        {#if questsByTab.length === 0}
          <div class="fincity-no-quests">
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
          <div class="fincity-quest-list">
            {#each questsByTab() as questTyped (questTyped.id)}
              {@const progress = getQuestProgress(questTyped)}
              {@const isCompleted = questTyped.status === QuestStatus.COMPLETED}
              {@const isLocked = questTyped.status === QuestStatus.LOCKED}
              {@const canStart = questTyped.status === QuestStatus.AVAILABLE}

              <Card class="fincity-quest-card {isCompleted ? 'completed' : isLocked ? 'locked' : 'available'}">
                <div class="fincity-quest-card-header">
                  <div class="fincity-quest-icon">
                    <Icon
                      name={getQuestTypeIcon(questTyped.type)}
                      color={getQuestTypeColor(questTyped.type)}
                      size="lg"
                    />
                  </div>

                  <div class="fincity-quest-info">
                    <div class="fincity-quest-meta">
                      <h3 class="fincity-quest-title-card">{questTyped.title}</h3>
                      <div class="fincity-quest-badges">
                        {#if questTyped.isMainQuest}
                          <span class="fincity-quest-badge main">Основной</span>
                        {/if}
                        <span class="fincity-quest-badge type">{questTyped.type}</span>
                      </div>
                    </div>

                    <p class="fincity-quest-description">{questTyped.description}</p>
                  </div>

                  <div class="fincity-quest-status">
                    {#if isCompleted}
                      <div class="fincity-status-indicator completed">
                        <Icon name="check" color="white" size="sm" />
                      </div>
                    {:else if isLocked}
                      <div class="fincity-status-indicator locked">
                        <Icon name="shield" color="var(--color-gray-400)" size="sm" />
                      </div>
                    {:else}
                      <div class="fincity-status-indicator active">
                        <Icon name="quest" color="white" size="sm" />
                      </div>
                    {/if}
                  </div>
                </div>

                <div class="fincity-quest-requirements">
                  <div class="fincity-requirement-text">
                    <Icon name="building" size="sm" color="var(--color-gray-500)" />
                    <span>{getRequirementText(questTyped)}</span>
                  </div>

                  {#if !isCompleted && !isLocked}
                    <ProgressBar
                      value={progress}
                      color={progress === 100 ? 'mint' : 'violet'}
                      showPercentage={true}
                      class="fincity-quest-progress"
                    />
                  {/if}
                </div>

                <div class="fincity-quest-rewards">
                  <div class="fincity-rewards-section">
                    <Icon name="star" size="sm" color="var(--color-coin-gold)" />
                    <span class="fincity-rewards-text">{formatRewards(questTyped.rewards)}</span>
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


<script lang="ts">
  import { Icon, Button } from '.';
  import { openModal } from '../../stores/ui';
  import { resources } from '../../stores/playerData';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  function openBuildMenu() {
    openModal('build_menu');
  }

  function openQuestLog() {
    openModal('quest_log');
  }

  function openAchievements() {
    openModal('achievements');
  }

  const canBuild = $derived($resources.coins >= 100);
</script>

<div class="action-buttons {className}">
  <div class="buttons-container">
    <Button
      variant="primary"
      size="lg"
      onclick={openBuildMenu}
      disabled={!canBuild}
      class="build-button nav-button"
    >
      <Icon name="hammer" color="white" />
      <span class="button-text">Строить</span>
    </Button>

    <Button
      variant="secondary"
      size="lg"
      onclick={openQuestLog}
      class="quest-button nav-button"
    >
      <Icon name="quest" />
      <span class="button-text">Квесты</span>
    </Button>

    <Button
      variant="secondary"
      size="lg"
      onclick={openAchievements}
      class="achievements-button nav-button"
    >
      <Icon name="star" />
      <span class="button-text">Достижения</span>
    </Button>
  </div>

  {#if !canBuild}
    <div class="build-hint">
      <Icon name="coin" size="sm" color="var(--color-coin-gold)" />
      <span>Нужно минимум 100 монет для строительства</span>
    </div>
  {/if}
</div>

<style>
  @reference "../../../../app.css";
  .action-buttons {
    @apply fixed z-30;
    @apply flex flex-col items-center;
    left: 50%;
    transform: translateX(-50%);
    bottom: 1.5rem;
    max-width: var(--grid-container-max-width);
    width: 100%;
    gap: var(--spacing-sm);
  }

  .buttons-container {
    @apply flex gap-md;
    @apply bg-white/95 backdrop-blur-md rounded-full px-md py-md;
    @apply border border-gray-200/50 shadow-lg;
  }

  :global(.build-button) {
    @apply shadow-lg hover:shadow-xl;
    @apply transform transition-all duration-300;
    @apply hover:-translate-y-1 active:translate-y-0;
  }

  :global(.quest-button),
  :global(.achievements-button) {
    @apply shadow-md hover:shadow-lg;
    @apply transform transition-all duration-300;
    @apply hover:-translate-y-1 active:translate-y-0;
  }

  .button-text {
    @apply font-semibold text-xs mt-1;
  }

  .build-hint {
    @apply flex items-center gap-2 px-4 py-2;
    @apply bg-warning-orange-10 border border-warning-orange-20 rounded-full;
    @apply text-sm text-warning-orange;
    @apply backdrop-blur-sm;
  }

  :global(.build-button),
  :global(.quest-button),
  :global(.achievements-button) {
    @apply touch-target p-0;
  }

  :global(.nav-button) {
    @apply flex-col items-center justify-center;
    @apply px-3 py-2 min-w-[64px];
  }

  .build-hint {
    @apply px-md py-sm text-xs;
  }

  @media (max-width: 400px) {
    .action-buttons {
      @apply bottom-3;
    }

    .buttons-container {
      @apply px-sm py-sm gap-sm;
    }

    :global(.build-button),
    :global(.quest-button),
    :global(.achievements-button) {
      @apply touch-target-sm;
    }

    :global(.nav-button) {
      @apply px-2 py-2 min-w-[56px];
    }

    .button-text {
      @apply text-xs;
    }

    .build-hint {
      @apply px-sm py-sm text-xs;
    }
  }
</style>

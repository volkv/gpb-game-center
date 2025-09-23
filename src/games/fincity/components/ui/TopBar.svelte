<script lang="ts">
  import { Icon, Button } from '.';
  import { resources, userName, level, experienceToNextLevel } from '../../stores/playerData';
  import { openModal } from '../../stores/ui';
  import { showIconTest } from '../../stores/gameState';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  function openSettings() {
    openModal('settings');
  }
</script>

<header class="top-bar {className}">
  <div class="top-bar-content">
    <div class="header-row">
      <div class="user-greeting-section">
        <h1 class="user-greeting">Привет, {$userName}!</h1>
        <div class="level-info">
          <Icon name="star" size="sm" color="var(--color-experience-green)" />
          <span class="level-text">Уровень {$level}</span>
        </div>
      </div>

      <div class="settings-section">
        <Button variant="ghost" size="sm" onclick={showIconTest} class="test-btn">
          <Icon name="search" />
        </Button>
        <Button variant="ghost" size="sm" onclick={openSettings} class="settings-btn">
          <Icon name="settings" />
        </Button>
      </div>
    </div>

    <div class="resources-row">
      <div class="resource-item">
        <Icon name="coin" color="var(--color-coin-gold)" />
        <span class="resource-value">{$resources.coins.toLocaleString()}</span>
      </div>

      <div class="resource-item">
        <Icon name="crystal" color="var(--color-crystal-purple)" />
        <span class="resource-value">{$resources.crystals.toLocaleString()}</span>
      </div>

      <div class="resource-item">
        <Icon name="energy" color="var(--color-energy-blue)" />
        <span class="resource-value">{$resources.energy}/{$resources.maxEnergy}</span>
      </div>

      <div class="resource-item">
        <Icon name="experience" color="var(--color-experience-green)" />
        <span class="resource-value">{$resources.experience}/{$experienceToNextLevel}</span>
      </div>
    </div>
  </div>
</header>

<style>
  @reference "../../../../app.css";
  .top-bar {
    @apply bg-white border-b border-gray-200;
    @apply sticky top-0 z-40;
  }

  .top-bar-content {
    @apply flex flex-col gap-md px-md py-md;
    @apply max-w-container mx-auto;
  }

  .header-row {
    @apply flex items-center justify-between;
  }

  .user-greeting-section {
    @apply flex flex-col gap-1 min-w-0 flex-1;
  }

  .user-greeting {
    @apply text-lg text-gray-900;
    @apply truncate;
    @apply md:text-heading-xl;
  }

  .level-info {
    @apply flex items-center gap-1;
    @apply text-body-sm text-gray-600;
  }

  .level-text {
    @apply font-body-medium;
  }

  .resources-row {
    @apply grid grid-cols-4 gap-xs;
  }

  .resource-item {
    @apply flex items-center gap-xs;
    @apply bg-gray-50 rounded-[var(--radius)] px-sm py-xs;
    @apply touch-target-sm;
  }

  .resource-value {
    @apply text-xs font-body-semibold text-gray-900;
    @apply tabular-nums;
    @apply md:text-body-sm;
  }

  .settings-section {
    @apply flex-shrink-0 flex gap-2;
  }

  :global(.test-btn),
  :global(.settings-btn) {
    @apply p-2 rounded-full min-w-10 min-h-10;
    @apply hover:bg-gray-100 transition-colors;
    @apply flex items-center justify-center;
  }

  @media (max-width: 400px) {
    .top-bar-content {
      @apply px-sm py-xs;
      @apply gap-xs;
    }

    .settings-section {
      @apply gap-1;
    }

    :global(.test-btn),
    :global(.settings-btn) {
      @apply min-w-9 min-h-9 p-1.5;
    }

    .resources-row {
      @apply gap-xs;
    }

    .resource-item {
      @apply px-xs py-xs;
      @apply flex-col;
    }

    .resource-value {
      @apply text-xs;
    }

    .user-greeting {
      @apply text-sm;
    }

    .level-info {
      @apply text-xs;
    }
  }

  @media (max-width: 320px) {
    .top-bar-content {
      @apply px-xs py-xs;
      @apply gap-xs;
    }

    .user-greeting {
      @apply text-xs truncate;
    }

    .resources-row {
      @apply grid-cols-2;
    }

    .resource-item {
      @apply min-w-0;
    }

    .resource-value {
      @apply text-xs truncate;
    }
  }
</style>

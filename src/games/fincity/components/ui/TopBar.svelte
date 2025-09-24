<script lang="ts">
  import { onMount } from 'svelte';
  import { Icon, Button } from '.';
  import { resources, userName, level, experienceToNextLevel, setUserName } from '../../stores/playerData';
  import { openModal } from '../../stores/ui';
  import { showIconTest } from '../../stores/gameState';
  import { telegramUserName } from '$lib/stores/telegramStore';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  onMount(() => {
    // Sync telegram user name with player data
    const unsubscribe = telegramUserName.subscribe((telegramName) => {
      if (telegramName && telegramName !== 'Клиент' && $userName === 'Клиент') {
        console.log('🎮 [FINCITY] Syncing telegram name to player data:', telegramName);
        setUserName(telegramName);
      }
    });

    return () => {
      unsubscribe();
    };
  });

  function openSettings() {
    openModal('settings');
  }
</script>

<header class="fincity-top-bar {className}">
  <div class="fincity-top-bar-content">
    <div class="fincity-header-row">
      <div class="fincity-user-greeting-section">
        <h1 class="fincity-user-greeting">Привет, {$userName}!</h1>
        <div class="fincity-level-info">
          <Icon name="star" size="sm" color="var(--color-experience-green)" />
          <span class="fincity-level-text">Уровень {$level}</span>
        </div>
      </div>

      <div class="fincity-settings-section">
        <Button variant="ghost" size="sm" onclick={showIconTest} class="test-btn">
          <Icon name="search" />
        </Button>
        <Button variant="ghost" size="sm" onclick={openSettings} class="settings-btn">
          <Icon name="settings" />
        </Button>
      </div>
    </div>

    <div class="fincity-resources-row">
      <div class="fincity-resource-item">
        <Icon name="coin" color="var(--color-coin-gold)" />
        <span class="fincity-resource-value">{$resources.coins.toLocaleString()}</span>
      </div>

      <div class="fincity-resource-item">
        <Icon name="crystal" color="var(--color-crystal-purple)" />
        <span class="fincity-resource-value">{$resources.crystals.toLocaleString()}</span>
      </div>

      <div class="fincity-resource-item">
        <Icon name="energy" color="var(--color-energy-blue)" />
        <span class="fincity-resource-value">{$resources.energy}/{$resources.maxEnergy}</span>
      </div>

      <div class="fincity-resource-item">
        <Icon name="experience" color="var(--color-experience-green)" />
        <span class="fincity-resource-value">{$resources.experience}/{$experienceToNextLevel}</span>
      </div>
    </div>
  </div>
</header>


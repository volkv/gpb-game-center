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

<div class="fincity-action-buttons {className}">
  <div class="fincity-buttons-container">
    <Button
      variant="primary"
      size="lg"
      onclick={openBuildMenu}
      disabled={!canBuild}
      class="fincity-build-button fincity-nav-button"
    >
      <Icon name="hammer" color="white" />
      <span class="fincity-button-text">Строить</span>
    </Button>

    <Button
      variant="secondary"
      size="lg"
      onclick={openQuestLog}
      class="fincity-quest-button fincity-nav-button"
    >
      <Icon name="quest" />
      <span class="fincity-button-text">Квесты</span>
    </Button>

    <Button
      variant="secondary"
      size="lg"
      onclick={openAchievements}
      class="fincity-achievements-button fincity-nav-button"
    >
      <Icon name="star" />
      <span class="fincity-button-text">Достижения</span>
    </Button>
  </div>

  {#if !canBuild}
    <div class="fincity-build-hint">
      <Icon name="coin" size="sm" color="var(--color-coin-gold)" />
      <span>Нужно минимум 100 монет для строительства</span>
    </div>
  {/if}
</div>


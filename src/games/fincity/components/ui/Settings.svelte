<script lang="ts">
  import { Icon, Button, Card, Modal } from '.';
  import { modal, closeModal } from '../../stores/ui';
  import { settings, updateSettings, gameState } from '../../stores/gameState';
  import { forceSave, clearAllData, resetAllStores } from '../../lib/autoSave';
  import { showToast } from '../../stores/ui';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const isOpen = $derived($modal.type === 'settings' && $modal.isOpen);

  let tempSettings = $state({...$settings});

  $effect(() => {
    if (isOpen) {
      tempSettings = {...$settings};
    }
  });

  function applySettings() {
    updateSettings(tempSettings);
    showToast('success', 'Настройки сохранены', 'Изменения успешно применены');
    closeModal();
  }

  function resetSettings() {
    tempSettings = {
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: true,
      language: 'ru'
    };
  }

  function exportData() {
    try {
      const gameData = {
        gameState: $gameState,
        timestamp: Date.now(),
      };

      const dataStr = JSON.stringify(gameData, null, 2);
      const dataBlob = new globalThis.Blob([dataStr], { type: 'application/json' });
      const url = globalThis.URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `fincity-save-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      globalThis.URL.revokeObjectURL(url);
      showToast('success', 'Данные экспортированы', 'Файл сохранения загружен');
    } catch {
      showToast('error', 'Ошибка экспорта', 'Не удалось экспортировать данные');
    }
  }

  function confirmClearData() {
    if (globalThis.confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
      const storesReset = resetAllStores();
      const dataCleared = clearAllData();

      if (storesReset && dataCleared) {
        showToast('warning', 'Данные сброшены', 'Вся информация о игре удалена');
        closeModal();
        globalThis.location.reload();
      } else {
        showToast('error', 'Ошибка сброса', 'Не удалось полностью сбросить данные');
      }
    }
  }

  function saveGame() {
    const success = forceSave();
    if (success) {
      showToast('success', 'Игра сохранена', 'Прогресс успешно сохранен');
    } else {
      showToast('error', 'Ошибка сохранения', 'Не удалось сохранить игру');
    }
  }
</script>

<Modal
  open={isOpen}
  title="Настройки игры"
  onclose={closeModal}
  size="lg"
  class={className}
>
  {#snippet header()}
    <div class="modal-title-section flex items-center gap-3">
      <div class="p-2 rounded-xl bg-white/20 neon-glow">
        <Icon name="settings" size="lg" />
      </div>
      <div>
        <h2 class="modal-title-game">Настройки</h2>
        <p class="text-sm opacity-90">Управление игровыми параметрами</p>
      </div>
    </div>
  {/snippet}

  <div class="space-y-6">
    <Card gradient="electric" decorative={true} class="text-white">
      {#snippet header()}
        <h3 class="font-section-title flex items-center gap-3">
          <Icon name="heart" size="md" class="neon-glow" />
          Общие настройки
        </h3>
      {/snippet}

      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <div class="flex-1">
            <label for="sound-enabled" class="font-card-title">Звуковые эффекты</label>
            <p class="font-ui-secondary opacity-80">Воспроизведение звуков в игре</p>
          </div>
          <div>
            <input
              id="sound-enabled"
              type="checkbox"
              bind:checked={tempSettings.soundEnabled}
              class="checkbox-game w-5 h-5"
            />
          </div>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <div class="flex-1">
            <label for="music-enabled" class="font-card-title">Фоновая музыка</label>
            <p class="font-ui-secondary opacity-80">Воспроизведение музыки во время игры</p>
          </div>
          <div>
            <input
              id="music-enabled"
              type="checkbox"
              bind:checked={tempSettings.musicEnabled}
              class="checkbox-game w-5 h-5"
            />
          </div>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <div class="flex-1">
            <label for="notifications-enabled" class="font-card-title">Push-уведомления</label>
            <p class="font-ui-secondary opacity-80">Уведомления о событиях в игре</p>
          </div>
          <div>
            <input
              id="notifications-enabled"
              type="checkbox"
              bind:checked={tempSettings.notificationsEnabled}
              class="checkbox-game w-5 h-5"
            />
          </div>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <div class="flex-1">
            <label for="language-select" class="font-card-title">Язык интерфейса</label>
            <p class="font-ui-secondary opacity-80">Выберите предпочитаемый язык</p>
          </div>
          <div>
            <select id="language-select" bind:value={tempSettings.language} class="input-game min-w-32">
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </Card>

    <Card gradient="power" decorative={true} class="text-white">
      {#snippet header()}
        <h3 class="font-section-title flex items-center gap-3">
          <Icon name="shield" size="md" class="neon-glow" />
          Управление данными
        </h3>
      {/snippet}

      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <div class="flex-1">
            <h4 class="font-card-title">Сохранить игру</h4>
            <p class="font-ui-secondary opacity-80">Принудительно сохранить текущий прогресс</p>
          </div>
          <Button variant="secondary" size="sm" onclick={saveGame} class="shrink-0">
            <Icon name="shield" />
            Сохранить
          </Button>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <div class="flex-1">
            <h4 class="font-card-title">Экспорт данных</h4>
            <p class="font-ui-secondary opacity-80">Скачать файл с сохранением игры</p>
          </div>
          <Button variant="secondary" size="sm" onclick={exportData} class="shrink-0">
            <Icon name="quest" />
            Экспорт
          </Button>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl glass-effect bg-red-500/20 border border-red-400/30">
          <div class="flex-1">
            <h4 class="font-card-title text-red-300">Сброс данных</h4>
            <p class="font-ui-secondary opacity-80">Сбросить все данные игры и перезагрузить страницу</p>
          </div>
          <Button variant="danger" size="sm" onclick={confirmClearData} class="shrink-0">
            <Icon name="close" />
            Сбросить
          </Button>
        </div>
      </div>
    </Card>

    <Card gradient="wealth" decorative={true} class="text-white">
      {#snippet header()}
        <h3 class="font-section-title flex items-center gap-3">
          <Icon name="building" size="md" class="neon-glow" />
          О приложении
        </h3>
      {/snippet}

      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <span class="font-ui-primary opacity-80">Последнее обновление:</span>
          <span class="font-ui-primary font-semibold">{new Date($gameState.lastUpdate).toLocaleString('ru-RU')}</span>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl glass-effect">
          <span class="font-ui-primary opacity-80">Платформа:</span>
          <span class="font-ui-primary font-semibold">WebView</span>
        </div>
      </div>
    </Card>
  </div>

  {#snippet footer()}
    <div class="flex items-center gap-3 justify-end">
      <Button variant="secondary" onclick={resetSettings}>
        Сбросить
      </Button>

      <Button variant="ghost" onclick={closeModal}>
        Отмена
      </Button>

      <Button variant="primary" onclick={applySettings}>
        Применить
      </Button>
    </div>
  {/snippet}
</Modal>


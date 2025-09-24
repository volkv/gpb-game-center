<script lang="ts">
  import { Icon, Button } from '.';
  import { setScreen } from '../../stores/gameState';
  import { GameScreen } from '../../types/GameState';

  const iconNames = [
    'award', 'battery', 'book', 'building', 'businessman', 'castle', 'chat', 'checkmark', 'church', 'city',
    'construction-site', 'crane', 'credit-card', 'crown', 'currency-icon', 'excavator', 'factory', 'flower',
    'flower-in-pot', 'gem', 'gift', 'growing-coins-chart', 'hammer', 'hand-with-growing-coin', 'handshake',
    'happiness-smile', 'heart', 'house-with-percent', 'houses', 'leaderboard', 'mall', 'man', 'medal',
    'menu', 'money', 'play-button', 'plus-icon', 'policeman', 'scroll', 'scroll-text', 'search', 'settings',
    'shield', 'shopping-cart', 'skyscrapper', 'sms-icon', 'star', 'target', 'thumb-up', 'trending-up',
    'trophy', 'umbrella', 'x', 'zap'
  ] as const;

  function backToGame() {
    setScreen(GameScreen.MAIN);
  }
</script>

<div class="p-8 bg-gray-100 min-h-screen">
  <div class="mb-8 flex justify-between items-center">
    <h1 class="text-3xl font-bold">Icon Test ({iconNames.length} icons)</h1>
    <Button variant="primary" onclick={backToGame}>
      <Icon name="houses" class="mr-2" />
      Назад к игре
    </Button>
  </div>
  <div class="grid grid-cols-8 gapadding: 1rem">
    {#each iconNames as iconName}
      <div class="flex flex-col items-center p-3 background: white rounded-lg shadow hover:shadow-md transition-shadow">
        <Icon name={iconName} size="lg" />
        <span class="text-xs mt-2 text-gray-600 text-center leading-tight">{iconName}</span>
      </div>
    {/each}
  </div>

  <div class="mt-12">
    <h2 class="text-2xl font-bold mb-6">Size Examples</h2>
    <div class="grid grid-cols-7 gap-6 items-center">
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="xs" />
        </div>
        <span class="text-sm text-gray-600">xs</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="sm" />
        </div>
        <span class="text-sm text-gray-600">sm</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="md" />
        </div>
        <span class="text-sm text-gray-600">md</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="lg" />
        </div>
        <span class="text-sm text-gray-600">lg</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="xl" />
        </div>
        <span class="text-sm text-gray-600">xl</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="2xl" />
        </div>
        <span class="text-sm text-gray-600">2xl</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="3xl" />
        </div>
        <span class="text-sm text-gray-600">3xl</span>
      </div>
    </div>
  </div>

  <div class="mt-12">
    <h2 class="text-2xl font-bold mb-6">Color Examples</h2>
    <div class="grid grid-cols-8 gap-6 items-center">
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="heart" size="xl" color="#ef4444" />
        </div>
        <span class="text-sm text-gray-600">Red</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="gem" size="xl" color="#3b82f6" />
        </div>
        <span class="text-sm text-gray-600">Blue</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="trophy" size="xl" color="#f59e0b" />
        </div>
        <span class="text-sm text-gray-600">Orange</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="shield" size="xl" color="#10b981" />
        </div>
        <span class="text-sm text-gray-600">Green</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="crown" size="xl" color="#8b5cf6" />
        </div>
        <span class="text-sm text-gray-600">Purple</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="currency-icon" size="xl" color="#f97316" />
        </div>
        <span class="text-sm text-gray-600">Coin</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="battery" size="xl" color="#06b6d4" />
        </div>
        <span class="text-sm text-gray-600">Cyan</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="star" size="xl" />
        </div>
        <span class="text-sm text-gray-600">Default</span>
      </div>
    </div>
  </div>

  <div class="mt-12">
    <h2 class="text-2xl font-bold mb-6">Test Mixed Icons</h2>
    <div class="grid grid-cols-8 gap-6 items-center">
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="gem" size="xl" color="#3b82f6" />
        </div>
        <span class="text-sm text-gray-600">Gem (stroke)</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="heart" size="xl" color="#ef4444" />
        </div>
        <span class="text-sm text-gray-600">Heart (fill)</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="building" size="xl" color="#10b981" />
        </div>
        <span class="text-sm text-gray-600">Building (fill)</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="currency-icon" size="xl" color="#f59e0b" />
        </div>
        <span class="text-sm text-gray-600">Currency (fill)</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="shield" size="xl" color="#8b5cf6" />
        </div>
        <span class="text-sm text-gray-600">Shield (fill)</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="trophy" size="xl" color="#06b6d4" />
        </div>
        <span class="text-sm text-gray-600">Trophy (stroke)</span>
      </div>
    </div>
  </div>

  <div class="mt-12">
    <h2 class="text-2xl font-bold mb-6">Fill-based Icons Test</h2>
    <div class="grid grid-cols-8 gap-6 items-center">
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="heart" size="xl" color="#ef4444" />
        </div>
        <span class="text-sm text-gray-600">Red Heart</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="currency-icon" size="xl" color="#22c55e" />
        </div>
        <span class="text-sm text-gray-600">Green Coin</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="building" size="xl" color="#f59e0b" />
        </div>
        <span class="text-sm text-gray-600">Orange Building</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="shield" size="xl" color="#3b82f6" />
        </div>
        <span class="text-sm text-gray-600">Blue Shield</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="crown" size="xl" color="#8b5cf6" />
        </div>
        <span class="text-sm text-gray-600">Purple Crown</span>
      </div>
      <div class="text-center">
        <div class="flex justify-center mb-2">
          <Icon name="target" size="xl" color="#ec4899" />
        </div>
        <span class="text-sm text-gray-600">Pink Target</span>
      </div>
    </div>
  </div>
</div>

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import {
  getTelegramUser,
  getTelegramUserName,
  getTelegramUserInfo,
  initializeTelegramApp,
  isTelegramEnvironment
} from '$lib/telegram/integration';
import type { TelegramWebAppUser } from '$lib/types/Telegram';

export interface TelegramState {
  isInTelegram: boolean;
  user: TelegramWebAppUser | null;
  userName: string;
  platform: string | null;
  version: string | null;
  colorScheme: 'light' | 'dark' | null;
  isInitialized: boolean;
  sessionCount: number;
  totalGamesPlayed: number;
  lastActiveDate: string | null;
}

export interface ActivityStats {
  sessionCount: number;
  totalGamesPlayed: number;
  lastActiveDate: string | null;
}

function createTelegramStore() {
  const initialState: TelegramState = {
    isInTelegram: false,
    user: null,
    userName: 'Клиент',
    platform: null,
    version: null,
    colorScheme: null,
    isInitialized: false,
    sessionCount: 0,
    totalGamesPlayed: 0,
    lastActiveDate: null
  };

  const { subscribe, set, update } = writable<TelegramState>(initialState);

  return {
    subscribe,

    initialize: () => {
      if (!browser) {
        return;
      }

      try {
        const isInitialized = initializeTelegramApp();
        const userInfo = getTelegramUserInfo();

        const savedStats = loadActivityStats();
        const currentDate = new Date().toISOString().split('T')[0];

        let sessionCount = savedStats.sessionCount;
        if (savedStats.lastActiveDate !== currentDate) {
          sessionCount = 1;
        } else {
          sessionCount++;
        }

        update(() => ({
          isInTelegram: userInfo.isInTelegram,
          user: userInfo.user,
          userName: userInfo.userName,
          platform: userInfo.platform,
          version: userInfo.version,
          colorScheme: userInfo.colorScheme,
          isInitialized,
          sessionCount,
          totalGamesPlayed: savedStats.totalGamesPlayed,
          lastActiveDate: currentDate
        }));

        saveActivityStats({
          sessionCount,
          totalGamesPlayed: savedStats.totalGamesPlayed,
          lastActiveDate: currentDate
        });
      } catch (error) {
        update(state => ({
          ...state,
          isInitialized: false,
          userName: 'Клиент'
        }));
      }
    },

    incrementGameCount: () => {
      update(state => {
        const newState = {
          ...state,
          totalGamesPlayed: state.totalGamesPlayed + 1
        };

        saveActivityStats({
          sessionCount: newState.sessionCount,
          totalGamesPlayed: newState.totalGamesPlayed,
          lastActiveDate: newState.lastActiveDate
        });

        return newState;
      });
    },

    refreshUserInfo: () => {
      if (!browser) return;

      try {
        const userInfo = getTelegramUserInfo();
        update(state => ({
          ...state,
          isInTelegram: userInfo.isInTelegram,
          user: userInfo.user,
          userName: userInfo.userName,
          platform: userInfo.platform,
          version: userInfo.version,
          colorScheme: userInfo.colorScheme
        }));
      } catch {
        // Игнорируем ошибки при обновлении информации пользователя
      }
    },

    reset: () => {
      set(initialState);
      if (browser) {
        localStorage.removeItem('telegram_activity_stats');
      }
    }
  };
}

function loadActivityStats(): ActivityStats {
  if (!browser) {
    return {
      sessionCount: 0,
      totalGamesPlayed: 0,
      lastActiveDate: null
    };
  }

  try {
    const saved = localStorage.getItem('telegram_activity_stats');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Игнорируем ошибки чтения из localStorage
  }

  return {
    sessionCount: 0,
    totalGamesPlayed: 0,
    lastActiveDate: null
  };
}

function saveActivityStats(stats: ActivityStats): void {
  if (!browser) return;

  try {
    localStorage.setItem('telegram_activity_stats', JSON.stringify(stats));
  } catch {
    // Игнорируем ошибки записи в localStorage
  }
}

export const telegramStore = createTelegramStore();

export const isInTelegram = derived(
  telegramStore,
  ($telegram) => $telegram.isInTelegram
);

export const telegramUser = derived(
  telegramStore,
  ($telegram) => $telegram.user
);

export const telegramUserName = derived(
  telegramStore,
  ($telegram) => $telegram.userName
);

export const telegramPlatform = derived(
  telegramStore,
  ($telegram) => $telegram.platform
);

export const isUserAvailable = derived(
  telegramStore,
  ($telegram) => $telegram.user !== null
);

export const activityStats = derived(
  telegramStore,
  ($telegram) => ({
    sessionCount: $telegram.sessionCount,
    totalGamesPlayed: $telegram.totalGamesPlayed,
    lastActiveDate: $telegram.lastActiveDate
  })
);

export const isDarkMode = derived(
  telegramStore,
  ($telegram) => $telegram.colorScheme === 'dark'
);

export const isTelegramInitialized = derived(
  telegramStore,
  ($telegram) => $telegram.isInitialized
);
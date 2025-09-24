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
        console.log('📱 [TELEGRAM STORE] Skipping initialization - not in browser environment');
        return;
      }

      console.log('📱 [TELEGRAM STORE] Starting initialization');

      try {
        const isInitialized = initializeTelegramApp();
        const userInfo = getTelegramUserInfo();

        console.log('📱 [TELEGRAM STORE] User info retrieved:', {
          isInTelegram: userInfo.isInTelegram,
          hasUser: !!userInfo.user,
          userName: userInfo.userName,
          platform: userInfo.platform
        });

        if (!userInfo.isInTelegram) {
          console.warn('📱 [TELEGRAM STORE] Not running in Telegram - user name will be default');
        } else if (!userInfo.user) {
          console.warn('📱 [TELEGRAM STORE] Running in Telegram but user data not available');
          console.warn('📱 [TELEGRAM STORE] User name will be default. Check Telegram privacy settings.');
        }

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

        console.log('📱 [TELEGRAM STORE] Initialization completed successfully');
      } catch (error) {
        console.error('📱 [TELEGRAM STORE] Failed to initialize:', error);
        console.error('📱 [TELEGRAM STORE] App will continue with default values');
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
      } catch (error) {
        console.warn('Failed to refresh user info:', error);
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
  } catch (error) {
    console.warn('Failed to load activity stats:', error);
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
  } catch (error) {
    console.warn('Failed to save activity stats:', error);
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
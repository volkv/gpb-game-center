export type ReminderPermissionState = NotificationPermission | 'unsupported' | 'unknown';

export interface ReminderRecord {
  id: string;
  fireAt: number;
  delivered: boolean;
  title: string;
  body: string;
  delayHours: number;
}

export interface ReminderSettingsState {
  enabled: boolean;
  reminders: ReminderRecord[];
  permission: ReminderPermissionState;
  lastOptInAt?: number;
}

interface ReminderPreset {
  id: string;
  delayHours: number;
  title: string;
  body: string;
}

interface ReminderServiceInitResult {
  settings: ReminderSettingsState;
  dueReminders: ReminderRecord[];
}

const STORAGE_KEY = 'quiz-shield-ruble-reminders';
const DEFAULT_SETTINGS: ReminderSettingsState = {
  enabled: false,
  reminders: [],
  permission: 'unknown'
};

const REMINDER_PRESETS: ReminderPreset[] = [
  {
    id: 'reminder-24h',
    delayHours: 24,
    title: 'Вернитесь и закрепите защиту',
    body: 'В «Щит и Рубль» появились новые сценарии — повторите тренировку, чтобы удержать навык.'
  },
  {
    id: 'reminder-72h',
    delayHours: 72,
    title: '3 дня без практики',
    body: 'Проверьте, помните ли вы признаки мошенничества. Квиз займёт всего пару минут.'
  },
  {
    id: 'reminder-168h',
    delayHours: 168,
    title: 'Свежий вызов безопасности',
    body: 'Поддерживайте бдительность: повторите квиз и сравните прогресс по точности ответов.'
  }
];

const activeTimers = new Map<string, number>();
let cachedSettings: ReminderSettingsState = { ...DEFAULT_SETTINGS };
let reminderCallback: ((record: ReminderRecord) => void) | null = null;

function now(): number {
  return Date.now();
}

function supportsNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function readStorage(): ReminderSettingsState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS, permission: resolvePermissionState('unknown') };
    }

    const parsed = JSON.parse(raw) as Partial<ReminderSettingsState>;
    return normalizeSettings(parsed);
  } catch (error) {
    console.warn('Не удалось загрузить настройки напоминаний', error);
    return { ...DEFAULT_SETTINGS, permission: resolvePermissionState('unknown') };
  }
}

function writeStorage(settings: ReminderSettingsState) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Не удалось сохранить настройки напоминаний', error);
  }
}

function normalizeSettings(input: Partial<ReminderSettingsState> | undefined): ReminderSettingsState {
  const basePermission = resolvePermissionState(input?.permission ?? 'unknown');

  const reminders = (input?.reminders ?? []).map((record) => normalizeRecord(record));

  return {
    enabled: Boolean(input?.enabled),
    reminders,
    permission: basePermission,
    lastOptInAt: typeof input?.lastOptInAt === 'number' ? input?.lastOptInAt : undefined
  } satisfies ReminderSettingsState;
}

function normalizeRecord(record: Partial<ReminderRecord> | undefined): ReminderRecord {
  const preset = record?.id ? REMINDER_PRESETS.find((item) => item.id === record.id) : undefined;

  const delayHours = typeof record?.delayHours === 'number' ? record.delayHours : preset?.delayHours ?? 24;
  const fireAt = typeof record?.fireAt === 'number' ? record.fireAt : now() + delayHours * 3600_000;

  return {
    id: record?.id ?? preset?.id ?? `reminder-${Math.random().toString(36).slice(2, 8)}`,
    fireAt,
    delivered: Boolean(record?.delivered),
    title: record?.title ?? preset?.title ?? 'Вернитесь к тренировке',
    body: record?.body ?? preset?.body ?? 'Повторите квиз, чтобы укрепить навык распознавания мошенников.',
    delayHours
  } satisfies ReminderRecord;
}

function resolvePermissionState(permission: ReminderPermissionState): ReminderPermissionState {
  if (typeof window === 'undefined') return 'unknown';
  if (!supportsNotifications()) return 'unsupported';

  if (permission === 'granted' || permission === 'denied' || permission === 'default') {
    return permission;
  }

  const current = Notification.permission;
  if (current === 'granted' || current === 'denied' || current === 'default') {
    return current;
  }

  return 'unknown';
}

function createReminderRecords(baseTime: number): ReminderRecord[] {
  return REMINDER_PRESETS.map((preset) => ({
    id: preset.id,
    fireAt: baseTime + preset.delayHours * 3600_000,
    delivered: false,
    title: preset.title,
    body: preset.body,
    delayHours: preset.delayHours
  }));
}

function cancelTimer(reminderId: string) {
  const timerId = activeTimers.get(reminderId);
  if (timerId !== undefined) {
    window.clearTimeout(timerId);
    activeTimers.delete(reminderId);
  }
}

function cancelAllTimers() {
  if (typeof window === 'undefined') return;
  activeTimers.forEach((timerId) => window.clearTimeout(timerId));
  activeTimers.clear();
}

function deliverReminder(record: ReminderRecord) {
  if (record.delivered) return;

  record.delivered = true;
  updateStoredReminder(record);

  if (supportsNotifications() && Notification.permission === 'granted') {
    try {
      new Notification(record.title, {
        body: record.body,
        tag: record.id
      });
    } catch (error) {
      console.warn('Не удалось показать нативное уведомление', error);
    }
  }

  reminderCallback?.({ ...record });
}

function scheduleReminder(record: ReminderRecord) {
  if (typeof window === 'undefined') return;
  if (record.delivered) return;

  cancelTimer(record.id);

  const delay = Math.max(0, record.fireAt - now());
  const timerId = window.setTimeout(() => deliverReminder(record), delay);
  activeTimers.set(record.id, timerId);
}

function scheduleAllPending(settings: ReminderSettingsState) {
  if (typeof window === 'undefined') return;

  settings.reminders.filter((record) => !record.delivered).forEach((record) => scheduleReminder(record));
}

function updateStoredReminder(record: ReminderRecord) {
  cachedSettings = {
    ...cachedSettings,
    reminders: cachedSettings.reminders.map((item) => (item.id === record.id ? { ...record } : item))
  };
  writeStorage(cachedSettings);
}

function sendHostMessage(message: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const anyWindow = window as typeof window & {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
    webkit?: { messageHandlers?: Record<string, { postMessage: (msg: unknown) => void }> };
  };

  try {
    const payload = {
      source: 'quiz-shield-ruble',
      ...message
    };
    const serialized = JSON.stringify(payload);

    const rnHandler = anyWindow.ReactNativeWebView;
    if (rnHandler?.postMessage) {
      rnHandler.postMessage(serialized);
    }

    const iosHandler = anyWindow.webkit?.messageHandlers?.quizReminders;
    if (iosHandler?.postMessage) {
      iosHandler.postMessage(serialized);
    }
  } catch (error) {
    console.warn('Не удалось отправить сообщение об уведомлениях в контейнер WebView', error);
  }
}

export async function requestNotificationPermission(): Promise<ReminderPermissionState> {
  if (!supportsNotifications()) {
    cachedSettings = {
      ...cachedSettings,
      permission: 'unsupported'
    };
    writeStorage(cachedSettings);
    return 'unsupported';
  }

  try {
    const result = await Notification.requestPermission();
    cachedSettings = {
      ...cachedSettings,
      permission: result
    };
    writeStorage(cachedSettings);
    return result;
  } catch (error) {
    console.warn('Не удалось запросить разрешение на уведомления', error);
    return resolvePermissionState(cachedSettings.permission);
  }
}

export function initReminderService(
  callback?: (record: ReminderRecord) => void
): ReminderServiceInitResult {
  reminderCallback = callback ?? null;

  cachedSettings = readStorage();
  const nowValue = now();
  const dueReminders: ReminderRecord[] = [];

  cachedSettings.reminders = cachedSettings.reminders.map((record) => {
    const normalized = normalizeRecord(record);
    if (!normalized.delivered && normalized.fireAt <= nowValue) {
      normalized.delivered = true;
      dueReminders.push({ ...normalized });
    }
    return normalized;
  });

  writeStorage(cachedSettings);
  cancelAllTimers();
  scheduleAllPending(cachedSettings);

  return {
    settings: { ...cachedSettings },
    dueReminders
  };
}

export function enableReminderSchedule(baseTime = now()): ReminderSettingsState {
  cachedSettings = {
    ...cachedSettings,
    enabled: true,
    lastOptInAt: baseTime,
    reminders: createReminderRecords(baseTime)
  };

  writeStorage(cachedSettings);
  cancelAllTimers();
  scheduleAllPending(cachedSettings);

  sendHostMessage({
    type: 'schedule-reminders',
    reminders: cachedSettings.reminders.map((record) => ({
      id: record.id,
      fireAt: record.fireAt,
      title: record.title,
      body: record.body,
      delayHours: record.delayHours
    }))
  });

  return { ...cachedSettings };
}

export function disableReminderSchedule(): ReminderSettingsState {
  cachedSettings = {
    ...cachedSettings,
    enabled: false,
    reminders: cachedSettings.reminders.map((record) => ({ ...record, delivered: true }))
  };

  writeStorage(cachedSettings);
  cancelAllTimers();

  sendHostMessage({ type: 'cancel-reminders' });

  return { ...cachedSettings };
}

export function getReminderSettings(): ReminderSettingsState {
  return { ...cachedSettings };
}

export function updateReminderPermission(permission: ReminderPermissionState): ReminderSettingsState {
  cachedSettings = {
    ...cachedSettings,
    permission: resolvePermissionState(permission)
  };
  writeStorage(cachedSettings);
  return { ...cachedSettings };
}

export function markReminderAsHandled(reminderId: string) {
  cachedSettings = {
    ...cachedSettings,
    reminders: cachedSettings.reminders.map((record) =>
      record.id === reminderId ? { ...record, delivered: true } : record
    )
  };
  writeStorage(cachedSettings);
}

export function isReminderSchedulingAvailable(): boolean {
  return typeof window !== 'undefined';
}

export function getReminderPresets(): ReminderPreset[] {
  return [...REMINDER_PRESETS];
}

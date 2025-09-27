export type AnalyticsPayload = Record<string, unknown>;

interface AnalyticsEvent {
  source: string;
  name: string;
  timestamp: string;
  payload: AnalyticsPayload;
}

const ANALYTICS_CHANNEL = 'quiz-shield-ruble-event';

function sanitizePayload(payload: AnalyticsPayload): AnalyticsPayload {
  const sanitized: AnalyticsPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value === null) {
      sanitized[key] = null;
      continue;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (item === null || typeof item !== 'object') {
          return item;
        }
        return JSON.parse(JSON.stringify(item));
      });
      continue;
    }

    if (typeof value === 'object') {
      sanitized[key] = JSON.parse(JSON.stringify(value));
      continue;
    }

    if (typeof value === 'number' && !Number.isFinite(value)) {
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

function sendToNative(message: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const serialized = JSON.stringify({
    source: 'quiz-shield-ruble',
    ...message
  });

  const anyWindow = window as typeof window & {
    ReactNativeWebView?: { postMessage: (msg: string) => void };
    webkit?: { messageHandlers?: Record<string, { postMessage: (msg: string) => void }> };
  };

  try {
    const handler = anyWindow.ReactNativeWebView;
    if (handler?.postMessage) {
      handler.postMessage(serialized);
    }
  } catch (error) {
    console.warn('Не удалось отправить событие в WebView (ReactNative)', error);
  }

  try {
    const iosHandler = anyWindow.webkit?.messageHandlers?.quizAnalytics;
    if (iosHandler?.postMessage) {
      iosHandler.postMessage(serialized);
    }
  } catch (error) {
    console.warn('Не удалось отправить событие в WebView (iOS)', error);
  }
}

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return;

  const timestamp = new Date().toISOString();
  const detail: AnalyticsEvent = {
    source: 'quiz-shield-ruble',
    name,
    timestamp,
    payload: sanitizePayload(payload)
  };

  window.dispatchEvent(new CustomEvent(ANALYTICS_CHANNEL, { detail }));

  const anyWindow = window as typeof window & { dataLayer?: Array<Record<string, unknown>> };

  if (Array.isArray(anyWindow.dataLayer)) {
    anyWindow.dataLayer.push({
      event: `quiz-shield-ruble:${name}`,
      timestamp,
      ...detail.payload
    });
  }

  sendToNative({ type: 'analytics-event', detail });
}

export function trackError(context: string, error: unknown, meta: AnalyticsPayload = {}) {
  const description = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  trackEvent('error', {
    context,
    description,
    stack,
    ...meta
  });
}

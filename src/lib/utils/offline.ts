import { writable } from 'svelte/store';

export const isOnline = writable(true);

export function createOfflineStore() {
	const { subscribe, set } = isOnline;

	function updateOnlineStatus() {
		set(navigator.onLine);
	}

	if (typeof window !== 'undefined') {
		updateOnlineStatus();
		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);
	}

	return {
		subscribe
	};
}

export class NetworkError extends Error {
	constructor(message: string, public isOffline: boolean = false) {
		super(message);
		this.name = 'NetworkError';
		this.isOffline = isOffline;
	}
}

export function createRetryHandler(maxRetries: number = 3, baseDelay: number = 1000) {
	return async function retry<T>(
		fn: () => Promise<T>,
		retryCount: number = 0
	): Promise<T> {
		try {
			return await fn();
		} catch (error) {
			const isNetworkError = error instanceof NetworkError ||
				(error instanceof Error && error.message.includes('fetch'));

			if (retryCount < maxRetries && isNetworkError) {
				const delay = baseDelay * Math.pow(2, retryCount);
				await new Promise(resolve => setTimeout(resolve, delay));
				return retry(fn, retryCount + 1);
			}
			throw error;
		}
	};
}

export function createOfflineQueue() {
	const queue: Array<() => Promise<any>> = [];

	function addToQueue(action: () => Promise<any>) {
		if (!navigator.onLine) {
			queue.push(action);
			return Promise.reject(new NetworkError('Нет подключения к интернету', true));
		}
		return action();
	}

	async function processQueue() {
		if (navigator.onLine && queue.length > 0) {
			const actions = [...queue];
			queue.length = 0;

			for (const action of actions) {
				try {
					await action();
				} catch (error) {
					if (import.meta.env.DEV) {
						console.error('Failed to process queued action:', error);
					}
				}
			}
		}
	}

	if (typeof window !== 'undefined') {
		window.addEventListener('online', processQueue);
	}

	return { addToQueue, processQueue };
}
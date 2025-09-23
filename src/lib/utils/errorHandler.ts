/**
 * Centralized error handling and graceful degradation utilities
 */

export interface AppError {
	code: string;
	message: string;
	details?: any;
	timestamp: number;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export type ErrorHandler = (error: AppError) => void;

class ErrorHandlerService {
	private handlers: ErrorHandler[] = [];
	private errorQueue: AppError[] = [];
	private maxQueueSize = 50;

	constructor() {
		this.setupGlobalErrorHandlers();
	}

	private setupGlobalErrorHandlers() {
		// Only setup handlers in browser environment
		if (typeof window === 'undefined') return;

		// Handle unhandled promise rejections
		window.addEventListener('unhandledrejection', (event) => {
			this.handleError({
				code: 'UNHANDLED_PROMISE_REJECTION',
				message: event.reason?.message || 'Unhandled promise rejection',
				details: event.reason,
				timestamp: Date.now(),
				severity: 'high'
			});
		});

		// Handle JavaScript errors
		window.addEventListener('error', (event) => {
			this.handleError({
				code: 'JAVASCRIPT_ERROR',
				message: event.message,
				details: {
					filename: event.filename,
					lineno: event.lineno,
					colno: event.colno,
					error: event.error
				},
				timestamp: Date.now(),
				severity: 'medium'
			});
		});
	}

	addHandler(handler: ErrorHandler) {
		this.handlers.push(handler);
	}

	removeHandler(handler: ErrorHandler) {
		const index = this.handlers.indexOf(handler);
		if (index > -1) {
			this.handlers.splice(index, 1);
		}
	}

	handleError(error: AppError) {
		// Add to queue
		this.errorQueue.push(error);
		if (this.errorQueue.length > this.maxQueueSize) {
			this.errorQueue.shift();
		}

		// Notify handlers
		this.handlers.forEach(handler => {
			try {
				handler(error);
			} catch (handlerError) {
				console.error('Error in error handler:', handlerError);
			}
		});

		// Log to console in development
		if (import.meta.env.DEV) {
			console.error('[ErrorHandler]', error);
		}
	}

	getErrors(): AppError[] {
		return [...this.errorQueue];
	}

	clearErrors() {
		this.errorQueue = [];
	}

	// Helper methods for common error scenarios
	handleGameLoadError(gameId: string, error: any) {
		this.handleError({
			code: 'GAME_LOAD_ERROR',
			message: `Failed to load game: ${gameId}`,
			details: { gameId, error },
			timestamp: Date.now(),
			severity: 'medium'
		});
	}

	handleNetworkError(url: string, error: any) {
		this.handleError({
			code: 'NETWORK_ERROR',
			message: `Network request failed: ${url}`,
			details: { url, error },
			timestamp: Date.now(),
			severity: 'medium'
		});
	}

	handleComponentError(componentName: string, error: any) {
		this.handleError({
			code: 'COMPONENT_ERROR',
			message: `Component error in ${componentName}`,
			details: { componentName, error },
			timestamp: Date.now(),
			severity: 'low'
		});
	}
}

// Singleton instance
export const errorHandler = new ErrorHandlerService();

// Utility function for wrapping async operations
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	fallback?: T,
	errorCode?: string
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		errorHandler.handleError({
			code: errorCode || 'ASYNC_OPERATION_ERROR',
			message: error instanceof Error ? error.message : 'Unknown error',
			details: error,
			timestamp: Date.now(),
			severity: 'medium'
		});

		if (fallback !== undefined) {
			return fallback;
		}
		throw error;
	}
}

// Network connectivity detection
export function createNetworkMonitor() {
	// Default to online for SSR
	let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
	const listeners: Array<(online: boolean) => void> = [];

	function notifyListeners() {
		listeners.forEach(listener => listener(isOnline));
	}

	// Only setup listeners in browser environment
	if (typeof window !== 'undefined') {
		window.addEventListener('online', () => {
			isOnline = true;
			notifyListeners();
		});

		window.addEventListener('offline', () => {
			isOnline = false;
			notifyListeners();
			errorHandler.handleError({
				code: 'NETWORK_OFFLINE',
				message: 'Network connection lost',
				details: null,
				timestamp: Date.now(),
				severity: 'medium'
			});
		});
	}

	return {
		get isOnline() {
			return isOnline;
		},
		addListener(listener: (online: boolean) => void) {
			listeners.push(listener);
		},
		removeListener(listener: (online: boolean) => void) {
			const index = listeners.indexOf(listener);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	};
}

export const networkMonitor = createNetworkMonitor();

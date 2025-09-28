import { browser } from '$app/environment';
import { getTelegramWebApp, isTelegramEnvironment } from '$lib/telegram/integration';
import type { GyroscopeData, Gravity, InputState } from './types';
import { GYROSCOPE_CONFIG, PHYSICS_CONFIG } from './constants';

export interface GyroscopeManager {
	isSupported: boolean;
	isActive: boolean;
	calibration: GyroscopeData | null;

	start(): Promise<boolean>;
	stop(): void;
	calibrate(): Promise<GyroscopeData | null>;
	convertToGravity(data: GyroscopeData): Gravity;
	setSensitivity?(sensitivity: number): void;

	onGyroscopeChanged: (callback: (data: GyroscopeData) => void) => void;
	onGyroscopeStarted: (callback: () => void) => void;
	onGyroscopeFailed: (callback: (error: string) => void) => void;

	cleanup(): void;
}

export interface FallbackInputManager {
	isActive: boolean;
	touchStart: { x: number; y: number } | null;

	start(element: HTMLElement): void;
	stop(): void;
	convertToGravity(input: { x: number; y: number }): Gravity;

	onInputChanged: (callback: (gravity: Gravity) => void) => void;

	cleanup(): void;
}

class TelegramGyroscopeManager implements GyroscopeManager {
	public isSupported = false;
	public isActive = false;
	public calibration: GyroscopeData | null = null;

	private webApp = getTelegramWebApp();
	private changeCallback: ((data: GyroscopeData) => void) | null = null;
	private startedCallback: (() => void) | null = null;
	private failedCallback: ((error: string) => void) | null = null;

	private gyroscopeChangedHandler = (event: any) => {
		try {
			const data: GyroscopeData = {
				alpha: event.alpha || 0,
				beta: event.beta || 0,
				gamma: event.gamma || 0,
				timestamp: Date.now()
			};

			if (this.changeCallback) {
				this.changeCallback(data);
			}
		} catch (error) {
			console.error('🔄 [GYROSCOPE] Error processing gyroscope data:', error);
			if (this.failedCallback) {
				this.failedCallback('Failed to process gyroscope data');
			}
		}
	};

	private gyroscopeStartedHandler = () => {
		console.log('🔄 [GYROSCOPE] Gyroscope started successfully');
		this.isActive = true;
		if (this.startedCallback) {
			this.startedCallback();
		}
	};

	private gyroscopeFailedHandler = (event: any) => {
		const error = event?.error || 'Unknown gyroscope error';
		console.error('🔄 [GYROSCOPE] Gyroscope failed:', error);
		this.isActive = false;
		if (this.failedCallback) {
			this.failedCallback(error);
		}
	};

	constructor() {
		this.isSupported = this.checkSupport();
		this.setupEventHandlers();
	}

	private checkSupport(): boolean {
		if (!browser || !isTelegramEnvironment() || !this.webApp) {
			console.log('🔄 [GYROSCOPE] Not in Telegram environment or no WebApp API');
			return false;
		}

		try {
			// Check for new direct methods first
			if (typeof this.webApp.startGyroscope === 'function' && typeof this.webApp.stopGyroscope === 'function') {
				console.log('🔄 [GYROSCOPE] Telegram WebApp API supports direct gyroscope methods');
				return true;
			}
			// Fallback to postEvent method for older versions
			else if (typeof this.webApp.postEvent === 'function') {
				console.log('🔄 [GYROSCOPE] Telegram WebApp API supports postEvent (legacy)');
				return true;
			}
		} catch (error) {
			console.warn('🔄 [GYROSCOPE] Error checking gyroscope support:', error);
		}

		console.warn('🔄 [GYROSCOPE] No gyroscope support detected');
		return false;
	}

	private setupEventHandlers(): void {
		if (!this.webApp || !this.isSupported) return;

		try {
			// Register event handlers correctly by passing the handler function directly
			this.webApp.onEvent('gyroscopeChanged', this.gyroscopeChangedHandler);
			this.webApp.onEvent('gyroscopeStarted', this.gyroscopeStartedHandler);
			this.webApp.onEvent('gyroscopeFailed', this.gyroscopeFailedHandler);

			console.log('🔄 [GYROSCOPE] Event handlers registered successfully');
			console.log('🔄 [GYROSCOPE] WebApp API version:', this.webApp.version);
			console.log('🔄 [GYROSCOPE] Platform:', this.webApp.platform);
		} catch (error) {
			console.error('🔄 [GYROSCOPE] Failed to setup event handlers:', error);
			this.isSupported = false;
		}
	}

	async start(): Promise<boolean> {
		if (!this.isSupported || !this.webApp) {
			console.warn('🔄 [GYROSCOPE] Cannot start: not supported or no WebApp');
			return false;
		}

		try {
			console.log('🔄 [GYROSCOPE] Starting gyroscope...');
			console.log('🔄 [GYROSCOPE] WebApp methods available:', {
				startGyroscope: typeof this.webApp.startGyroscope,
				stopGyroscope: typeof this.webApp.stopGyroscope,
				postEvent: typeof this.webApp.postEvent
			});

			// Try direct method first (newer Telegram versions)
			if (typeof this.webApp.startGyroscope === 'function') {
				console.log('🔄 [GYROSCOPE] Using direct startGyroscope() method');
				this.webApp.startGyroscope();
			} else if (typeof this.webApp.postEvent === 'function') {
				console.log('🔄 [GYROSCOPE] Using legacy postEvent method');
				this.webApp.postEvent('web_app_start_gyroscope');
			} else {
				console.error('🔄 [GYROSCOPE] No gyroscope start method available');
				return false;
			}

			return new Promise((resolve) => {
				const timeout = setTimeout(() => {
					console.warn('🔄 [GYROSCOPE] Start timeout after 5 seconds');
					resolve(false);
				}, 5000);

				const originalStartedCallback = this.startedCallback;
				this.startedCallback = () => {
					clearTimeout(timeout);
					if (originalStartedCallback) originalStartedCallback();
					resolve(true);
				};

				const originalFailedCallback = this.failedCallback;
				this.failedCallback = (error) => {
					clearTimeout(timeout);
					if (originalFailedCallback) originalFailedCallback(error);
					resolve(false);
				};
			});
		} catch (error) {
			console.error('🔄 [GYROSCOPE] Failed to start gyroscope:', error);
			return false;
		}
	}

	stop(): void {
		if (!this.isSupported || !this.webApp) return;

		try {
			console.log('🔄 [GYROSCOPE] Stopping gyroscope...');

			// Try direct method first (newer Telegram versions)
			if (typeof this.webApp.stopGyroscope === 'function') {
				console.log('🔄 [GYROSCOPE] Using direct stopGyroscope() method');
				this.webApp.stopGyroscope();
			} else if (typeof this.webApp.postEvent === 'function') {
				console.log('🔄 [GYROSCOPE] Using legacy postEvent method');
				this.webApp.postEvent('web_app_stop_gyroscope');
			}

			this.isActive = false;
			console.log('🔄 [GYROSCOPE] Gyroscope stopped successfully');
		} catch (error) {
			console.error('🔄 [GYROSCOPE] Failed to stop gyroscope:', error);
		}
	}

	async calibrate(): Promise<GyroscopeData | null> {
		if (!this.isActive) {
			console.warn('🔄 [GYROSCOPE] Cannot calibrate: gyroscope not active');
			return null;
		}

		console.log('🔄 [GYROSCOPE] Starting calibration...');
		const calibrationSamples: GyroscopeData[] = [];

		return new Promise((resolve) => {
			const originalCallback = this.changeCallback;

			this.changeCallback = (data: GyroscopeData) => {
				calibrationSamples.push(data);
				if (originalCallback) originalCallback(data);
			};

			setTimeout(() => {
				this.changeCallback = originalCallback;

				if (calibrationSamples.length === 0) {
					console.warn('🔄 [GYROSCOPE] No calibration samples collected');
					resolve(null);
					return;
				}

				const avgAlpha = calibrationSamples.reduce((sum, s) => sum + s.alpha, 0) / calibrationSamples.length;
				const avgBeta = calibrationSamples.reduce((sum, s) => sum + s.beta, 0) / calibrationSamples.length;
				const avgGamma = calibrationSamples.reduce((sum, s) => sum + s.gamma, 0) / calibrationSamples.length;

				this.calibration = {
					alpha: avgAlpha,
					beta: avgBeta,
					gamma: avgGamma,
					timestamp: Date.now()
				};

				console.log('🔄 [GYROSCOPE] Calibration completed:', this.calibration);
				resolve(this.calibration);
			}, GYROSCOPE_CONFIG.CALIBRATION_TIME);
		});
	}

	convertToGravity(data: GyroscopeData): Gravity {
		const calibrated = this.calibration ? {
			alpha: data.alpha - this.calibration.alpha,
			beta: data.beta - this.calibration.beta,
			gamma: data.gamma - this.calibration.gamma
		} : data;

		const deadZone = GYROSCOPE_CONFIG.DEAD_ZONE;
		const sensitivity = GYROSCOPE_CONFIG.SENSITIVITY;
		const maxTilt = GYROSCOPE_CONFIG.MAX_TILT;

		let x = Math.abs(calibrated.gamma) > deadZone ? calibrated.gamma : 0;
		let y = Math.abs(calibrated.beta) > deadZone ? calibrated.beta : 0;

		x = Math.max(-maxTilt, Math.min(maxTilt, x * sensitivity));
		y = Math.max(-maxTilt, Math.min(maxTilt, y * sensitivity));

		const normalizedX = (x / maxTilt) * PHYSICS_CONFIG.MAX_GRAVITY;
		const normalizedY = (y / maxTilt) * PHYSICS_CONFIG.MAX_GRAVITY;

		return {
			x: normalizedX,
			y: normalizedY,
			intensity: Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)
		};
	}

	onGyroscopeChanged(callback: (data: GyroscopeData) => void): void {
		this.changeCallback = callback;
	}

	onGyroscopeStarted(callback: () => void): void {
		this.startedCallback = callback;
	}

	onGyroscopeFailed(callback: (error: string) => void): void {
		this.failedCallback = callback;
	}

	cleanup(): void {
		if (this.webApp && this.isSupported) {
			try {
				// Remove event handlers correctly by passing the same handler function
				this.webApp.offEvent('gyroscopeChanged', this.gyroscopeChangedHandler);
				this.webApp.offEvent('gyroscopeStarted', this.gyroscopeStartedHandler);
				this.webApp.offEvent('gyroscopeFailed', this.gyroscopeFailedHandler);
				console.log('🔄 [GYROSCOPE] Event handlers removed successfully');
			} catch (error) {
				console.warn('🔄 [GYROSCOPE] Error during cleanup:', error);
			}
		}

		this.stop();
		this.changeCallback = null;
		this.startedCallback = null;
		this.failedCallback = null;
		console.log('🔄 [GYROSCOPE] Cleanup completed');
	}
}

class TouchFallbackManager implements FallbackInputManager {
	public isActive = false;
	public touchStart: { x: number; y: number } | null = null;

	private element: HTMLElement | null = null;
	private inputCallback: ((gravity: Gravity) => void) | null = null;
	private currentTouch: { x: number; y: number } | null = null;

	private touchStartHandler = (event: TouchEvent) => {
		event.preventDefault();
		const touch = event.touches[0];
		if (!touch || !this.element) return;

		const rect = this.element.getBoundingClientRect();
		this.touchStart = {
			x: touch.clientX - rect.left - rect.width / 2,
			y: touch.clientY - rect.top - rect.height / 2
		};

		this.currentTouch = { ...this.touchStart };
	};

	private touchMoveHandler = (event: TouchEvent) => {
		event.preventDefault();
		if (!this.touchStart || !this.element) return;

		const touch = event.touches[0];
		if (!touch) return;

		const rect = this.element.getBoundingClientRect();
		this.currentTouch = {
			x: touch.clientX - rect.left - rect.width / 2,
			y: touch.clientY - rect.top - rect.height / 2
		};

		const deltaX = this.currentTouch.x - this.touchStart.x;
		const deltaY = this.currentTouch.y - this.touchStart.y;

		const gravity = this.convertToGravity({ x: deltaX, y: deltaY });

		if (this.inputCallback) {
			this.inputCallback(gravity);
		}
	};

	private touchEndHandler = (event: TouchEvent) => {
		event.preventDefault();
		this.touchStart = null;
		this.currentTouch = null;

		if (this.inputCallback) {
			this.inputCallback({ x: 0, y: 0, intensity: 0 });
		}
	};

	private mouseDownHandler = (event: MouseEvent) => {
		event.preventDefault();
		if (!this.element) return;

		const rect = this.element.getBoundingClientRect();
		this.touchStart = {
			x: event.clientX - rect.left - rect.width / 2,
			y: event.clientY - rect.top - rect.height / 2
		};

		this.currentTouch = { ...this.touchStart };
	};

	private mouseMoveHandler = (event: MouseEvent) => {
		event.preventDefault();
		if (!this.touchStart || !this.element) return;

		const rect = this.element.getBoundingClientRect();
		this.currentTouch = {
			x: event.clientX - rect.left - rect.width / 2,
			y: event.clientY - rect.top - rect.height / 2
		};

		const deltaX = this.currentTouch.x - this.touchStart.x;
		const deltaY = this.currentTouch.y - this.touchStart.y;

		const gravity = this.convertToGravity({ x: deltaX, y: deltaY });

		if (this.inputCallback) {
			this.inputCallback(gravity);
		}
	};

	private mouseUpHandler = (event: MouseEvent) => {
		event.preventDefault();
		this.touchStart = null;
		this.currentTouch = null;

		if (this.inputCallback) {
			this.inputCallback({ x: 0, y: 0, intensity: 0 });
		}
	};

	start(element: HTMLElement): void {
		this.element = element;
		this.isActive = true;

		element.addEventListener('touchstart', this.touchStartHandler, { passive: false });
		element.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
		element.addEventListener('touchend', this.touchEndHandler, { passive: false });

		element.addEventListener('mousedown', this.mouseDownHandler);
		document.addEventListener('mousemove', this.mouseMoveHandler);
		document.addEventListener('mouseup', this.mouseUpHandler);

		console.log('🔄 [FALLBACK] Touch/mouse fallback started');
	}

	stop(): void {
		if (this.element) {
			this.element.removeEventListener('touchstart', this.touchStartHandler);
			this.element.removeEventListener('touchmove', this.touchMoveHandler);
			this.element.removeEventListener('touchend', this.touchEndHandler);

			this.element.removeEventListener('mousedown', this.mouseDownHandler);
			document.removeEventListener('mousemove', this.mouseMoveHandler);
			document.removeEventListener('mouseup', this.mouseUpHandler);
		}

		this.isActive = false;
		this.element = null;
		this.touchStart = null;
		this.currentTouch = null;

		console.log('🔄 [FALLBACK] Touch/mouse fallback stopped');
	}

	convertToGravity(input: { x: number; y: number }): Gravity {
		const sensitivity = GYROSCOPE_CONFIG.FALLBACK_TOUCH_SENSITIVITY;
		const maxDistance = 100;

		const normalizedX = Math.max(-1, Math.min(1, input.x / maxDistance)) * sensitivity;
		const normalizedY = Math.max(-1, Math.min(1, input.y / maxDistance)) * sensitivity;

		const gravityX = normalizedX * PHYSICS_CONFIG.MAX_GRAVITY;
		const gravityY = normalizedY * PHYSICS_CONFIG.MAX_GRAVITY;

		return {
			x: gravityX,
			y: gravityY,
			intensity: Math.sqrt(gravityX * gravityX + gravityY * gravityY)
		};
	}

	onInputChanged(callback: (gravity: Gravity) => void): void {
		this.inputCallback = callback;
	}

	cleanup(): void {
		this.stop();
		this.inputCallback = null;
	}
}

export function createGyroscopeManager(): GyroscopeManager {
	return new TelegramGyroscopeManager();
}

export function createFallbackInputManager(): FallbackInputManager {
	return new TouchFallbackManager();
}

export function createInputState(): InputState {
	return {
		gyroscope: null,
		touch: null,
		mouse: null,
		fallbackActive: false
	};
}

export function throttle<T extends (...args: any[]) => void>(
	func: T,
	limit: number
): T {
	let inThrottle: boolean;
	return (function(this: any, ...args: any[]) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	}) as T;
}
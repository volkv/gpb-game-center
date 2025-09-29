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

	private gyroscopeChangedHandler = (...args: any[]) => {
		try {
			const telegramGyro = this.webApp?.Gyroscope;
			if (!telegramGyro || !telegramGyro.x || !telegramGyro.y || !telegramGyro.z) return;

			// Получаем данные из отдельных полей x, y, z
			const actualData = { x: telegramGyro.x, y: telegramGyro.y, z: telegramGyro.z };

			if (!actualData || typeof actualData !== 'object') {
				return;
			}

			// Modern API: convert x,y,z to alpha,beta,gamma
			const data: GyroscopeData = {
				alpha: actualData.z * 180 / Math.PI,
				beta: actualData.y * 180 / Math.PI,
				gamma: actualData.x * 180 / Math.PI,
				timestamp: Date.now()
			};

			if (this.changeCallback) {
				this.changeCallback(data);
			}
		} catch (error) {
			if (this.failedCallback) {
				this.failedCallback('Failed to process gyroscope data');
			}
		}
	};

	private gyroscopeStartedHandler = () => {
		this.isActive = true;
		if (this.startedCallback) {
			this.startedCallback();
		}
	};

	private gyroscopeFailedHandler = (event: any) => {
		const error = event?.error || 'Unknown gyroscope error';
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
			return false;
		}

		try {
			const hasOnEvent = typeof this.webApp.onEvent === 'function';
			const hasModernGyroscope = this.webApp.Gyroscope && typeof this.webApp.Gyroscope.start === 'function';

			if (!hasOnEvent || !hasModernGyroscope) {
				return false;
			}

			// Check version compatibility (need 7.0+ for modern API)
			const version = this.webApp.version || '0.0';
			const majorVersion = parseInt(version.split('.')[0]) || 0;

			return majorVersion >= 7;
		} catch (error) {
			return false;
		}
	}

	private setupEventHandlers(): void {
		if (!this.webApp || !this.isSupported) return;

		try {
			this.webApp.onEvent('gyroscopeChanged', this.gyroscopeChangedHandler);
			this.webApp.onEvent('gyroscopeStarted', this.gyroscopeStartedHandler);
			this.webApp.onEvent('gyroscopeFailed', this.gyroscopeFailedHandler);
		} catch (error) {
			this.isSupported = false;
		}
	}

	async start(): Promise<boolean> {
		if (!this.isSupported || !this.webApp) {
			return false;
		}

		try {
			if (this.webApp.Gyroscope && typeof this.webApp.Gyroscope.start === 'function') {
				this.webApp.Gyroscope.start({ refresh_rate: 60 });
			} else {
				return false;
			}

			return new Promise((resolve) => {
				const timeout = setTimeout(() => resolve(false), 5000);

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
			return false;
		}
	}

	stop(): void {
		if (!this.isSupported || !this.webApp) return;

		try {
			if (this.webApp.Gyroscope && typeof this.webApp.Gyroscope.stop === 'function') {
				this.webApp.Gyroscope.stop();
			}
			this.isActive = false;
		} catch (error) {
			// Silent fail
		}
	}

	async calibrate(): Promise<GyroscopeData | null> {
		if (!this.isActive) {
			return null;
		}

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
				this.webApp.offEvent('gyroscopeChanged', this.gyroscopeChangedHandler);
				this.webApp.offEvent('gyroscopeStarted', this.gyroscopeStartedHandler);
				this.webApp.offEvent('gyroscopeFailed', this.gyroscopeFailedHandler);
			} catch (error) {
				// Silent fail
			}
		}

		this.stop();
		this.changeCallback = null;
		this.startedCallback = null;
		this.failedCallback = null;
	}
}

class TouchFallbackManager implements FallbackInputManager {
	public isActive = false;
	public touchStart: { x: number; y: number } | null = null;

	private element: HTMLElement | null = null;
	private inputCallback: ((gravity: Gravity) => void) | null = null;
	private currentTouch: { x: number; y: number } | null = null;
	private lastMoveTime = 0;
	private moveThrottleMs = 16;
	private lastGravity: { x: number; y: number } = { x: 0, y: 0 };
	private smoothingFactor = 0.85;

	private pointerDownHandler = (event: PointerEvent) => {
		event.preventDefault();
		if (!this.element) return;

		this.element.setPointerCapture(event.pointerId);

		const rect = this.element.getBoundingClientRect();
		this.touchStart = {
			x: event.clientX - rect.left - rect.width / 2,
			y: event.clientY - rect.top - rect.height / 2
		};

		this.currentTouch = { ...this.touchStart };
		if (import.meta.env.DEV) {
			console.log('🎮 [POINTER] pointerDown:', JSON.stringify({
				pointerId: event.pointerId,
				pointerType: event.pointerType,
				clientX: event.clientX,
				clientY: event.clientY,
				rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
				touchStart: this.touchStart,
				currentTouch: this.currentTouch
			}, null, 2));
		}
	};

	private pointerMoveHandler = (event: PointerEvent) => {
		event.preventDefault();
		if (!this.touchStart || !this.element) return;

		const now = Date.now();
		if (now - this.lastMoveTime < this.moveThrottleMs) return;
		this.lastMoveTime = now;

		const rect = this.element.getBoundingClientRect();
		this.currentTouch = {
			x: event.clientX - rect.left - rect.width / 2,
			y: event.clientY - rect.top - rect.height / 2
		};

		const deltaX = this.currentTouch.x - this.touchStart.x;
		const deltaY = this.currentTouch.y - this.touchStart.y;

		const gravity = this.convertToGravity({ x: deltaX, y: deltaY });

		if (import.meta.env.DEV) {
			console.log('🎮 [POINTER] pointerMove:', JSON.stringify({
				pointerId: event.pointerId,
				pointerType: event.pointerType,
				currentTouch: this.currentTouch,
				delta: { x: deltaX, y: deltaY },
				gravity,
				callbackExists: !!this.inputCallback
			}, null, 2));
		}

		if (this.inputCallback) {
			this.inputCallback(gravity);
		}
	};

	private pointerUpHandler = (event: PointerEvent) => {
		event.preventDefault();
		if (this.element) {
			this.element.releasePointerCapture(event.pointerId);
		}

		this.touchStart = null;
		this.currentTouch = null;
		this.lastGravity = { x: 0, y: 0 };

		if (import.meta.env.DEV) {
			console.log('🎮 [POINTER] pointerUp - resetting gravity to zero', {
				pointerId: event.pointerId,
				pointerType: event.pointerType
			});
		}

		if (this.inputCallback) {
			this.inputCallback({ x: 0, y: 0, intensity: 0 });
		}
	};


	start(element: HTMLElement): void {
		this.element = element;
		this.isActive = true;

		element.addEventListener('pointerdown', this.pointerDownHandler, { passive: false });
		element.addEventListener('pointermove', this.pointerMoveHandler, { passive: false });
		element.addEventListener('pointerup', this.pointerUpHandler, { passive: false });
		element.addEventListener('pointercancel', this.pointerUpHandler, { passive: false });
		element.addEventListener('pointerleave', this.pointerUpHandler, { passive: false });

		element.style.touchAction = 'none';
		element.style.userSelect = 'none';
		element.style.webkitUserSelect = 'none';
		element.style.webkitTouchCallout = 'none';
		element.style.overscrollBehavior = 'none';
	}

	stop(): void {
		if (this.element) {
			this.element.removeEventListener('pointerdown', this.pointerDownHandler);
			this.element.removeEventListener('pointermove', this.pointerMoveHandler);
			this.element.removeEventListener('pointerup', this.pointerUpHandler);
			this.element.removeEventListener('pointercancel', this.pointerUpHandler);
			this.element.removeEventListener('pointerleave', this.pointerUpHandler);
		}

		this.isActive = false;
		this.element = null;
		this.touchStart = null;
		this.currentTouch = null;
	}

	convertToGravity(input: { x: number; y: number }): Gravity {
		const sensitivity = GYROSCOPE_CONFIG.FALLBACK_TOUCH_SENSITIVITY;
		const maxDistance = 200;
		const deadZone = 10;

		const adjustedX = Math.abs(input.x) > deadZone ? input.x : 0;
		const adjustedY = Math.abs(input.y) > deadZone ? input.y : 0;

		const normalizedX = Math.max(-1, Math.min(1, adjustedX / maxDistance)) * sensitivity;
		const normalizedY = Math.max(-1, Math.min(1, adjustedY / maxDistance)) * sensitivity;

		const rawGravityX = normalizedX * PHYSICS_CONFIG.MAX_GRAVITY;
		const rawGravityY = normalizedY * PHYSICS_CONFIG.MAX_GRAVITY;

		const smoothedGravityX = this.lastGravity.x * this.smoothingFactor + rawGravityX * (1 - this.smoothingFactor);
		const smoothedGravityY = this.lastGravity.y * this.smoothingFactor + rawGravityY * (1 - this.smoothingFactor);

		this.lastGravity.x = smoothedGravityX;
		this.lastGravity.y = smoothedGravityY;

		if (import.meta.env.DEV) {
			console.log('🎮 [GRAVITY] convertToGravity:', JSON.stringify({
				input,
				adjusted: { x: adjustedX, y: adjustedY },
				sensitivity,
				maxDistance,
				deadZone,
				normalized: { x: normalizedX, y: normalizedY },
				rawGravity: { x: rawGravityX, y: rawGravityY },
				smoothedGravity: { x: smoothedGravityX, y: smoothedGravityY },
				intensity: Math.sqrt(smoothedGravityX * smoothedGravityX + smoothedGravityY * smoothedGravityY)
			}, null, 2));
		}

		return {
			x: smoothedGravityX,
			y: smoothedGravityY,
			intensity: Math.sqrt(smoothedGravityX * smoothedGravityX + smoothedGravityY * smoothedGravityY)
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
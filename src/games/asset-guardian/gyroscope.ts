import { browser } from '$app/environment';
import { getTelegramWebApp, isTelegramEnvironment } from '$lib/telegram/integration';
import type { GyroscopeData, Gravity, InputState } from './types';
import { GYROSCOPE_CONFIG, PHYSICS_CONFIG } from './constants';

export interface GyroscopeManager {
	isSupported: boolean;
	isActive: boolean;
	calibration: GyroscopeData | null;
	isDebugLogging: boolean;

	start(): Promise<boolean>;
	stop(): void;
	calibrate(): Promise<GyroscopeData | null>;
	convertToGravity(data: GyroscopeData): Gravity;
	setSensitivity?(sensitivity: number): void;

	startDebugLogging(): void;
	stopDebugLogging(): DebugLogData[];

	onGyroscopeChanged: (callback: (data: GyroscopeData) => void) => void;
	onGyroscopeStarted: (callback: () => void) => void;
	onGyroscopeFailed: (callback: (error: string) => void) => void;

	cleanup(): void;
}

export interface DebugLogData {
	timestamp: number;
	rawTelegramData: { x: number; y: number; z: number };
	convertedDegrees: GyroscopeData;
	smoothedData: GyroscopeData;
	gravity: Gravity;
	processingSteps: any;
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
	public isDebugLogging = false;

	private webApp = getTelegramWebApp();
	private changeCallback: ((data: GyroscopeData) => void) | null = null;
	private startedCallback: (() => void) | null = null;
	private failedCallback: ((error: string) => void) | null = null;
	private lastProcessTime = 0;
	private gyroThrottleMs = 100;
	private dataBuffer: GyroscopeData[] = [];
	private bufferSize = 6;
	private debugLogs: DebugLogData[] = [];

	private gyroscopeChangedHandler = (...args: any[]) => {
		try {
			const now = Date.now();
			if (now - this.lastProcessTime < this.gyroThrottleMs) return;
			this.lastProcessTime = now;

			const telegramGyro = this.webApp?.Gyroscope;
			if (!telegramGyro) return;

			const actualData = {
				x: telegramGyro.x || 0,
				y: telegramGyro.y || 0,
				z: telegramGyro.z || 0
			};

			const rawData: GyroscopeData = {
				alpha: actualData.z * 180 / Math.PI,
				beta: actualData.y * 180 / Math.PI,
				gamma: actualData.x * 180 / Math.PI,
				timestamp: now
			};

			this.dataBuffer.push(rawData);
			if (this.dataBuffer.length > this.bufferSize) {
				this.dataBuffer.shift();
			}

			if (this.dataBuffer.length >= this.bufferSize) {
				const smoothedData = this.getSmoothedData();
				const gravity = this.convertToGravity(smoothedData);

				if (this.isDebugLogging) {
					const debugLogEntry: DebugLogData = {
						timestamp: now,
						rawTelegramData: actualData,
						convertedDegrees: rawData,
						smoothedData: smoothedData,
						gravity: gravity,
						processingSteps: {
							bufferSize: this.dataBuffer.length,
							bufferRange: {
								alphaMin: Math.min(...this.dataBuffer.map(d => d.alpha)),
								alphaMax: Math.max(...this.dataBuffer.map(d => d.alpha)),
								betaMin: Math.min(...this.dataBuffer.map(d => d.beta)),
								betaMax: Math.max(...this.dataBuffer.map(d => d.beta)),
								gammaMin: Math.min(...this.dataBuffer.map(d => d.gamma)),
								gammaMax: Math.max(...this.dataBuffer.map(d => d.gamma))
							},
							calibration: this.calibration
						}
					};

					this.debugLogs.push(debugLogEntry);
					console.log('📝 [DEBUG-GYRO]', debugLogEntry);
				}

				if (import.meta.env.DEV && !this.isDebugLogging) {
					console.log('🎯 [GYRO] Raw Telegram data:', JSON.stringify({
						x: actualData.x,
						y: actualData.y,
						z: actualData.z,
						magnitude: Math.sqrt(actualData.x * actualData.x + actualData.y * actualData.y + actualData.z * actualData.z)
					}, null, 2));
					console.log('🔄 [GYRO] Converted to degrees:', JSON.stringify({
						alpha: rawData.alpha,
						beta: rawData.beta,
						gamma: rawData.gamma,
						alphaMag: Math.abs(rawData.alpha),
						betaMag: Math.abs(rawData.beta),
						gammaMag: Math.abs(rawData.gamma)
					}, null, 2));
					console.log('🎭 [GYRO] Smoothed data:', JSON.stringify({
						alpha: smoothedData.alpha,
						beta: smoothedData.beta,
						gamma: smoothedData.gamma,
						bufferSize: this.dataBuffer.length,
						bufferRange: {
							alphaMin: Math.min(...this.dataBuffer.map(d => d.alpha)),
							alphaMax: Math.max(...this.dataBuffer.map(d => d.alpha)),
							betaMin: Math.min(...this.dataBuffer.map(d => d.beta)),
							betaMax: Math.max(...this.dataBuffer.map(d => d.beta)),
							gammaMin: Math.min(...this.dataBuffer.map(d => d.gamma)),
							gammaMax: Math.max(...this.dataBuffer.map(d => d.gamma))
						}
					}, null, 2));
				}

				if (this.changeCallback) {
					this.changeCallback(smoothedData);
				}
			}
		} catch (error) {
			console.error('❌ [GYRO] Processing error:', error);
			if (this.failedCallback) {
				this.failedCallback('Failed to process gyroscope data');
			}
		}
	};

	private getSmoothedData(): GyroscopeData {
		if (this.dataBuffer.length === 0) {
			return { alpha: 0, beta: 0, gamma: 0, timestamp: Date.now() };
		}

		if (this.dataBuffer.length === 1) {
			return { ...this.dataBuffer[0] };
		}

		const weights = [0.4, 0.35, 0.25];
		const recent = this.dataBuffer.slice(-3);

		let alpha = 0, beta = 0, gamma = 0, totalWeight = 0;

		recent.forEach((data, index) => {
			const weight = weights[index] || 0.1;
			alpha += data.alpha * weight;
			beta += data.beta * weight;
			gamma += data.gamma * weight;
			totalWeight += weight;
		});

		const smoothedAlpha = alpha / totalWeight;
		const smoothedBeta = beta / totalWeight;
		const smoothedGamma = gamma / totalWeight;

		const basicNoiseThreshold = GYROSCOPE_CONFIG.DEAD_ZONE;

		return {
			alpha: Math.abs(smoothedAlpha) < basicNoiseThreshold ? 0 : smoothedAlpha,
			beta: Math.abs(smoothedBeta) < basicNoiseThreshold ? 0 : smoothedBeta,
			gamma: Math.abs(smoothedGamma) < basicNoiseThreshold ? 0 : smoothedGamma,
			timestamp: Date.now()
		};
	};

	private getMedian(values: number[]): number {
		const sorted = [...values].sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 === 0
			? (sorted[mid - 1] + sorted[mid]) / 2
			: sorted[mid];
	}

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

		// Swapped beta and gamma to fix landscape mode controls.
		// Left-right tilt (gamma) now controls vertical movement (y-axis).
		// Forward-backward tilt (beta) now controls horizontal movement (x-axis).
		let x = Math.abs(calibrated.beta) > deadZone ? calibrated.beta : 0;
		let y = Math.abs(calibrated.gamma) > deadZone ? calibrated.gamma : 0;

		const significantMovementThreshold = GYROSCOPE_CONFIG.SIGNIFICANT_MOVEMENT_THRESHOLD;
		const beforeSignificantFilter = { x, y };
		if (Math.abs(x) < significantMovementThreshold) x = 0;
		if (Math.abs(y) < significantMovementThreshold) y = 0;

		const beforeInversion = { x, y };
		x = x * sensitivity;
		y = y * sensitivity;

		const beforeClamp = { x, y };
		x = Math.max(-maxTilt, Math.min(maxTilt, x));
		y = Math.max(-maxTilt, Math.min(maxTilt, y));

		const microMovementThreshold = GYROSCOPE_CONFIG.MICRO_MOVEMENT_THRESHOLD;
		const beforeMicroFilter = { x, y };
		if (Math.abs(x) < microMovementThreshold) x = 0;
		if (Math.abs(y) < microMovementThreshold) y = 0;

		const normalizedX = (x / maxTilt) * PHYSICS_CONFIG.MAX_GRAVITY;
		const normalizedY = (y / maxTilt) * PHYSICS_CONFIG.MAX_GRAVITY;

		const result = {
			x: normalizedX,
			y: normalizedY,
			intensity: Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY)
		};

		if (import.meta.env.DEV) {
			console.log('🔄 [GYRO] COMPLETE PIPELINE:', JSON.stringify({
				step1_input: { alpha: data.alpha, beta: data.beta, gamma: data.gamma },
				step2_calibrated: { alpha: calibrated.alpha, beta: calibrated.beta, gamma: calibrated.gamma },
				step3_deadzone: {
					deadZoneThreshold: deadZone,
					beforeDeadzone: { gamma: calibrated.gamma, beta: calibrated.beta },
					afterDeadzone: { x: Math.abs(calibrated.gamma) > deadZone ? calibrated.gamma : 0, y: Math.abs(calibrated.beta) > deadZone ? calibrated.beta : 0 }
				},
				step4_significantFilter: {
					threshold: significantMovementThreshold,
					before: beforeSignificantFilter,
					after: { x, y: Math.abs(beforeSignificantFilter.y) < significantMovementThreshold ? 0 : beforeSignificantFilter.y }
				},
				step5_inversion: {
					sensitivity,
					before: beforeInversion,
					after: { x: -beforeInversion.x * sensitivity, y: beforeInversion.y * sensitivity }
				},
				step6_clamp: {
					maxTilt,
					before: beforeClamp,
					after: { x, y }
				},
				step7_microFilter: {
					threshold: microMovementThreshold,
					before: beforeMicroFilter,
					after: { x, y }
				},
				step8_normalize: {
					maxGravity: PHYSICS_CONFIG.MAX_GRAVITY,
					normalized: { x: normalizedX, y: normalizedY },
					final: result
				},
				WILL_MOVE: result.intensity > 0 ? 'YES' : 'NO'
			}, null, 2));
		}

		return result;
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

	startDebugLogging(): void {
		console.log('🔥 [DEBUG-GYRO] Started debug logging');
		this.debugLogs = [];
		this.isDebugLogging = true;
	}

	stopDebugLogging(): DebugLogData[] {
		console.log(`🛑 [DEBUG-GYRO] Stopped debug logging. Collected ${this.debugLogs.length} samples`);

		if (this.debugLogs.length > 0) {
			console.log('📊 [DEBUG-GYRO] Summary statistics:');

			const rawDataRanges = {
				x: {
					min: Math.min(...this.debugLogs.map(d => d.rawTelegramData.x)),
					max: Math.max(...this.debugLogs.map(d => d.rawTelegramData.x))
				},
				y: {
					min: Math.min(...this.debugLogs.map(d => d.rawTelegramData.y)),
					max: Math.max(...this.debugLogs.map(d => d.rawTelegramData.y))
				},
				z: {
					min: Math.min(...this.debugLogs.map(d => d.rawTelegramData.z)),
					max: Math.max(...this.debugLogs.map(d => d.rawTelegramData.z))
				}
			};

			const degreesRanges = {
				alpha: {
					min: Math.min(...this.debugLogs.map(d => d.convertedDegrees.alpha)),
					max: Math.max(...this.debugLogs.map(d => d.convertedDegrees.alpha))
				},
				beta: {
					min: Math.min(...this.debugLogs.map(d => d.convertedDegrees.beta)),
					max: Math.max(...this.debugLogs.map(d => d.convertedDegrees.beta))
				},
				gamma: {
					min: Math.min(...this.debugLogs.map(d => d.convertedDegrees.gamma)),
					max: Math.max(...this.debugLogs.map(d => d.convertedDegrees.gamma))
				}
			};

			const gravityRanges = {
				x: {
					min: Math.min(...this.debugLogs.map(d => d.gravity.x)),
					max: Math.max(...this.debugLogs.map(d => d.gravity.x))
				},
				y: {
					min: Math.min(...this.debugLogs.map(d => d.gravity.y)),
					max: Math.max(...this.debugLogs.map(d => d.gravity.y))
				},
				intensity: {
					min: Math.min(...this.debugLogs.map(d => d.gravity.intensity)),
					max: Math.max(...this.debugLogs.map(d => d.gravity.intensity))
				}
			};

			console.log('📈 [DEBUG-GYRO] Raw Telegram data ranges (radians):');
			console.table(rawDataRanges);

			console.log('📐 [DEBUG-GYRO] Converted degrees ranges:');
			console.table(degreesRanges);

			console.log('🎮 [DEBUG-GYRO] Final gravity ranges:');
			console.table(gravityRanges);

			console.log('🎯 [DEBUG-GYRO] Calibration data:');
			console.log(this.calibration);

			console.log('📋 [DEBUG-GYRO] Full debug log array:', this.debugLogs);
		}

		this.isDebugLogging = false;
		const logs = [...this.debugLogs];
		this.debugLogs = [];
		return logs;
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
	private smoothingFactor = 0.95;

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
		(element.style as any).webkitTouchCallout = 'none';
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
		const maxDistance = 250;
		const deadZone = 15;

		const adjustedX = Math.abs(input.x) > deadZone ? input.x : 0;
		const adjustedY = Math.abs(input.y) > deadZone ? input.y : 0;

		const normalizedX = Math.max(-1, Math.min(1, adjustedX / maxDistance)) * sensitivity;
		const normalizedY = Math.max(-1, Math.min(1, adjustedY / maxDistance)) * sensitivity;

		const rawGravityX = normalizedX * PHYSICS_CONFIG.MAX_GRAVITY;
		const rawGravityY = normalizedY * PHYSICS_CONFIG.MAX_GRAVITY;

		const smoothingFactor = GYROSCOPE_CONFIG.SMOOTHING_FACTOR;
		const smoothedGravityX = this.lastGravity.x * smoothingFactor + rawGravityX * (1 - smoothingFactor);
		const smoothedGravityY = this.lastGravity.y * smoothingFactor + rawGravityY * (1 - smoothingFactor);

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
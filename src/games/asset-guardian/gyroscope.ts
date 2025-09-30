import { browser } from '$app/environment';
import { getTelegramWebApp, isTelegramEnvironment } from '$lib/telegram/integration';
import type { GyroscopeData, Gravity, InputState } from './types';
import { GYROSCOPE_CONFIG, PHYSICS_CONFIG } from './constants';

export interface GyroscopeManager {
	isSupported: boolean;
	isActive: boolean;
	isDebugLogging: boolean;

	start(): Promise<boolean>;
	stop(): void;
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
	public isDebugLogging = false;

	private webApp = getTelegramWebApp();
	private changeCallback: ((data: GyroscopeData) => void) | null = null;
	private startedCallback: (() => void) | null = null;
	private failedCallback: ((error: string) => void) | null = null;

	// State for integrating rotation rate
	private currentOrientation = { beta: 0, gamma: 0 };
	private lastTimestamp = 0;

	private debugLogs: DebugLogData[] = [];

	private gyroscopeChangedHandler = () => {
		try {
			const telegramGyro = this.webApp?.Gyroscope;
			if (!telegramGyro) return;

			const now = Date.now();
			if (this.lastTimestamp === 0) {
				this.lastTimestamp = now;
				return; // Skip the first frame to establish a baseline timestamp.
			}

			const deltaTime = (now - this.lastTimestamp) / 1000.0; // Time delta in seconds
			this.lastTimestamp = now;

			// Correctly map Telegram's axes to orientation rates
			const rateBeta = telegramGyro.x || 0;  // Rate around X-axis (forward/backward tilt)
			const rateGamma = telegramGyro.y || 0; // Rate around Y-axis (left/right tilt)

			// Integrate the rotation rate to calculate the absolute orientation (angle).
			// We multiply by (180 / Math.PI) to convert the integrated radians to degrees.
			this.currentOrientation.beta += rateBeta * deltaTime * (180 / Math.PI);
			this.currentOrientation.gamma += rateGamma * deltaTime * (180 / Math.PI);

			// Clamp the tilt to a maximum angle (e.g., 45 degrees) to prevent runaway values from drift.
			const maxTilt = 45;
			this.currentOrientation.gamma = Math.max(-maxTilt, Math.min(maxTilt, this.currentOrientation.gamma));
			this.currentOrientation.beta = Math.max(-maxTilt, Math.min(maxTilt, this.currentOrientation.beta));

			const newOrientationData: GyroscopeData = {
				alpha: 0, // Alpha (compass direction) is not used in this game.
				beta: this.currentOrientation.beta,
				gamma: this.currentOrientation.gamma,
				timestamp: now
			};

			if (this.changeCallback) {
				this.changeCallback(newOrientationData);
			}


		} catch (error) {
			console.error('❌ [GYRO] Processing error:', error);
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

		// Reset orientation state each time the gyroscope is started.
		this.currentOrientation = { beta: 0, gamma: 0 };
		this.lastTimestamp = 0;

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


	convertToGravity(data: GyroscopeData): Gravity {
		// Normalize the tilt angle. The integrated angle is clamped to +/- 45 degrees.
		let normX = data.gamma / 45;
		let normY = data.beta / 45;

		// Clamp normalization to be safe.
		normX = Math.max(-1, Math.min(1, normX));
		normY = Math.max(-1, Math.min(1, normY));

		// Apply a non-linear (squared) curve to the input.
		// This makes small tilts very gentle and requires more tilt for stronger force.
		const curve = (v: number) => Math.sign(v) * v * v;
		const forceX = curve(normX);
		const forceY = curve(normY);

		const finalX = forceX * PHYSICS_CONFIG.GRAVITY_STRENGTH;
		const finalY = forceY * PHYSICS_CONFIG.GRAVITY_STRENGTH;

		const result = {
			x: finalX,
			y: finalY,
			intensity: Math.sqrt(finalX * finalX + finalY * finalY)
		};


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
	private isDragging = false;

	private element: HTMLElement | null = null;
	private inputCallback: ((gravity: Gravity) => void) | null = null;
	private lastGravity: { x: number; y: number } = { x: 0, y: 0 };

	private pointerDownHandler = (event: PointerEvent) => {
		event.preventDefault();
		if (!this.element) return;
		this.isDragging = true;
		this.element.setPointerCapture(event.pointerId);
		this.pointerMoveHandler(event); // Trigger a move on down for immediate response
	};

	private pointerMoveHandler = (event: PointerEvent) => {
		event.preventDefault();
		if (!this.isDragging || !this.element) return;

		const rect = this.element.getBoundingClientRect();
		const currentX = event.clientX - rect.left - rect.width / 2;
		const currentY = event.clientY - rect.top - rect.height / 2;

		const gravity = this.convertToGravity({ x: currentX, y: currentY });

		if (this.inputCallback) {
			this.inputCallback(gravity);
		}
	};

	private pointerUpHandler = (event: PointerEvent) => {
		event.preventDefault();
		if (!this.isDragging) return;

		this.isDragging = false;
		if (this.element) {
			this.element.releasePointerCapture(event.pointerId);
		}

		this.lastGravity = { x: 0, y: 0 };

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
		this.isDragging = false;
		this.element = null;
	}

	convertToGravity(input: { x: number; y: number }): Gravity {
		const maxDistance = 180; // The effective radius of the joystick area

		// Normalize the input distance from the center
		let normX = input.x / maxDistance;
		let normY = input.y / maxDistance;

		// Clamp normalization
		normX = Math.max(-1, Math.min(1, normX));
		normY = Math.max(-1, Math.min(1, normY));

		// Apply the same non-linear (squared) curve
		const curve = (v: number) => Math.sign(v) * v * v;
		const forceX = curve(normX);
		const forceY = curve(normY);

		const rawGravityX = forceX * PHYSICS_CONFIG.GRAVITY_STRENGTH;
		const rawGravityY = forceY * PHYSICS_CONFIG.GRAVITY_STRENGTH;

		// Apply a simple smoothing to the final value
		const smoothingFactor = 0.7;
		const smoothedGravityX = this.lastGravity.x * smoothingFactor + rawGravityX * (1 - smoothingFactor);
		const smoothedGravityY = this.lastGravity.y * smoothingFactor + rawGravityY * (1 - smoothingFactor);

		this.lastGravity.x = smoothedGravityX;
		this.lastGravity.y = smoothedGravityY;

		const result = {
			x: smoothedGravityX,
			y: smoothedGravityY,
			intensity: Math.sqrt(smoothedGravityX * smoothedGravityX + smoothedGravityY * smoothedGravityY)
		};


		return result;
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
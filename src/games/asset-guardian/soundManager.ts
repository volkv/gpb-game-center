export type SoundType =
	| 'bonus_collect'
	| 'bonus_cashback'
	| 'bonus_deposit'
	| 'trap_hit'
	| 'wall_bounce'
	| 'finish'
	| 'combo'
	| 'shield';

export interface SoundConfig {
	type: SoundType;
	volume?: number;
	pitch?: number;
}

export class SoundManager {
	private audioContext: AudioContext | null = null;
	private masterVolume = 0.3;
	private enabled = true;
	private activeSounds = new Set<OscillatorNode>();

	initialize(): void {
		try {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		} catch (error) {
			console.warn('🔊 [SOUND] Web Audio API not supported:', error);
			this.enabled = false;
		}
	}

	play(config: SoundConfig): void {
		if (!this.enabled || !this.audioContext) return;

		try {
			switch (config.type) {
				case 'bonus_collect':
					this.playBonusCollect(config.volume, config.pitch);
					break;
				case 'bonus_cashback':
					this.playBonusCashback(config.volume);
					break;
				case 'bonus_deposit':
					this.playBonusDeposit(config.volume);
					break;
				case 'trap_hit':
					this.playTrapHit(config.volume);
					break;
				case 'wall_bounce':
					this.playWallBounce(config.volume);
					break;
				case 'finish':
					this.playFinish(config.volume);
					break;
				case 'combo':
					this.playCombo(config.volume, config.pitch);
					break;
				case 'shield':
					this.playShield(config.volume);
					break;
			}
		} catch (error) {
			console.warn('🔊 [SOUND] Failed to play sound:', error);
		}
	}

	private playBonusCollect(volume = 1, pitch = 1): void {
		if (!this.audioContext) return;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(
			800 * pitch,
			this.audioContext.currentTime
		);
		oscillator.frequency.exponentialRampToValueAtTime(
			1200 * pitch,
			this.audioContext.currentTime + 0.1
		);

		gainNode.gain.setValueAtTime(
			this.masterVolume * volume * 0.4,
			this.audioContext.currentTime
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + 0.15
		);

		oscillator.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator.start(this.audioContext.currentTime);
		oscillator.stop(this.audioContext.currentTime + 0.15);

		this.trackOscillator(oscillator, 0.15);
	}

	private playBonusCashback(volume = 1): void {
		if (!this.audioContext) return;

		const oscillator1 = this.audioContext.createOscillator();
		const oscillator2 = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator1.type = 'sine';
		oscillator1.frequency.value = 880;

		oscillator2.type = 'sine';
		oscillator2.frequency.value = 1320;

		gainNode.gain.setValueAtTime(
			this.masterVolume * volume * 0.3,
			this.audioContext.currentTime
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + 0.2
		);

		oscillator1.connect(gainNode);
		oscillator2.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator1.start(this.audioContext.currentTime);
		oscillator2.start(this.audioContext.currentTime + 0.05);
		oscillator1.stop(this.audioContext.currentTime + 0.2);
		oscillator2.stop(this.audioContext.currentTime + 0.2);

		this.trackOscillator(oscillator1, 0.2);
		this.trackOscillator(oscillator2, 0.2);
	}

	private playBonusDeposit(volume = 1): void {
		if (!this.audioContext) return;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.type = 'triangle';
		oscillator.frequency.setValueAtTime(
			600,
			this.audioContext.currentTime
		);
		oscillator.frequency.exponentialRampToValueAtTime(
			1000,
			this.audioContext.currentTime + 0.25
		);

		gainNode.gain.setValueAtTime(
			this.masterVolume * volume * 0.35,
			this.audioContext.currentTime
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + 0.25
		);

		oscillator.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator.start(this.audioContext.currentTime);
		oscillator.stop(this.audioContext.currentTime + 0.25);

		this.trackOscillator(oscillator, 0.25);
	}

	private playTrapHit(volume = 1): void {
		if (!this.audioContext) return;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.type = 'sawtooth';
		oscillator.frequency.setValueAtTime(
			220,
			this.audioContext.currentTime
		);
		oscillator.frequency.exponentialRampToValueAtTime(
			110,
			this.audioContext.currentTime + 0.2
		);

		gainNode.gain.setValueAtTime(
			this.masterVolume * volume * 0.5,
			this.audioContext.currentTime
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + 0.2
		);

		oscillator.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator.start(this.audioContext.currentTime);
		oscillator.stop(this.audioContext.currentTime + 0.2);

		this.trackOscillator(oscillator, 0.2);
	}

	private playWallBounce(volume = 1): void {
		if (!this.audioContext) return;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.type = 'square';
		oscillator.frequency.value = 150;

		gainNode.gain.setValueAtTime(
			this.masterVolume * volume * 0.2,
			this.audioContext.currentTime
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + 0.08
		);

		oscillator.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator.start(this.audioContext.currentTime);
		oscillator.stop(this.audioContext.currentTime + 0.08);

		this.trackOscillator(oscillator, 0.08);
	}

	private playFinish(volume = 1): void {
		if (!this.audioContext) return;

		const frequencies = [523.25, 659.25, 783.99, 1046.5];
		const duration = 0.15;

		frequencies.forEach((freq, index) => {
			const oscillator = this.audioContext!.createOscillator();
			const gainNode = this.audioContext!.createGain();

			oscillator.type = 'sine';
			oscillator.frequency.value = freq;

			const startTime = this.audioContext!.currentTime + index * duration;
			gainNode.gain.setValueAtTime(
				this.masterVolume * volume * 0.3,
				startTime
			);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				startTime + duration
			);

			oscillator.connect(gainNode);
			gainNode.connect(this.audioContext!.destination);

			oscillator.start(startTime);
			oscillator.stop(startTime + duration);

			this.trackOscillator(oscillator, duration + index * duration);
		});
	}

	private playCombo(volume = 1, pitch = 1): void {
		if (!this.audioContext) return;

		const oscillator1 = this.audioContext.createOscillator();
		const oscillator2 = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator1.type = 'sine';
		oscillator1.frequency.setValueAtTime(
			1000 * pitch,
			this.audioContext.currentTime
		);
		oscillator1.frequency.exponentialRampToValueAtTime(
			1500 * pitch,
			this.audioContext.currentTime + 0.1
		);

		oscillator2.type = 'sine';
		oscillator2.frequency.value = 1200 * pitch;

		gainNode.gain.setValueAtTime(
			this.masterVolume * volume * 0.4,
			this.audioContext.currentTime
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + 0.2
		);

		oscillator1.connect(gainNode);
		oscillator2.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator1.start(this.audioContext.currentTime);
		oscillator2.start(this.audioContext.currentTime + 0.05);
		oscillator1.stop(this.audioContext.currentTime + 0.2);
		oscillator2.stop(this.audioContext.currentTime + 0.2);

		this.trackOscillator(oscillator1, 0.2);
		this.trackOscillator(oscillator2, 0.2);
	}

	private playShield(volume = 1): void {
		if (!this.audioContext) return;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(
			400,
			this.audioContext.currentTime
		);
		oscillator.frequency.exponentialRampToValueAtTime(
			800,
			this.audioContext.currentTime + 0.15
		);

		gainNode.gain.setValueAtTime(
			this.masterVolume * volume * 0.35,
			this.audioContext.currentTime
		);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			this.audioContext.currentTime + 0.15
		);

		oscillator.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator.start(this.audioContext.currentTime);
		oscillator.stop(this.audioContext.currentTime + 0.15);

		this.trackOscillator(oscillator, 0.15);
	}

	private trackOscillator(oscillator: OscillatorNode, duration: number): void {
		this.activeSounds.add(oscillator);

		setTimeout(() => {
			this.activeSounds.delete(oscillator);
		}, duration * 1000);
	}

	setVolume(volume: number): void {
		this.masterVolume = Math.max(0, Math.min(1, volume));
	}

	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	stopAll(): void {
		if (!this.audioContext) return;

		this.activeSounds.forEach((oscillator) => {
			try {
				oscillator.stop();
			} catch (error) {
			}
		});

		this.activeSounds.clear();
	}

	destroy(): void {
		this.stopAll();

		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}
}

export function createSoundManager(): SoundManager {
	return new SoundManager();
}

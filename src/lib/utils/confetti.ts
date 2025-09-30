import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#007ac3', '#006ba5', '#005a89', '#2693d4', '#52ade4'];
const ACCENT_COLORS = ['#1fc4d9', '#0fa9c2', '#40d6e6', '#71e5f1'];
const SUCCESS_COLORS = ['#2bb48a', '#e2a53a'];
const SPECIAL_COLORS = ['#d13c6a', '#3a7bff'];


function isMobile(): boolean {
	if (typeof window === 'undefined') return false;
	return window.innerWidth <= 768;
}

function getZIndex(): number {
	return 999999;
}

function createFireSequence(colors: string[], count = 200) {
	const defaults = {
		origin: { y: 0.7 },
		colors,
		disableForReducedMotion: false,
		zIndex: getZIndex()
	};

	const mobile = isMobile();
	const spreadMultiplier = mobile ? 0.6 : 1;

	function fire(particleRatio: number, opts: any) {
		const adjustedOpts = {
			...opts,
			spread: (opts.spread || 60) * spreadMultiplier
		};

		confetti({
			...defaults,
			...adjustedOpts,
			particleCount: Math.floor(count * particleRatio)
		});
	}

	fire(0.25, {
		spread: 26,
		startVelocity: 55,
	});

	fire(0.2, {
		spread: 60,
	});

	fire(0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8
	});

	fire(0.1, {
		spread: 120,
		startVelocity: 25,
		decay: 0.92,
		scalar: 1.2
	});

	fire(0.1, {
		spread: 120,
		startVelocity: 45,
	});
}

export const confettiEffects = {
	taskComplete: () => {
		const colors = [...BRAND_COLORS, ...ACCENT_COLORS];
		createFireSequence(colors, 150);
	},

	rewardClaimed: () => {
		const colors = [...ACCENT_COLORS, ...SUCCESS_COLORS];
		createFireSequence(colors, 180);
	},

	purchaseSuccess: () => {
		const colors = [...BRAND_COLORS, ...SUCCESS_COLORS];
		createFireSequence(colors, 220);
	},

	gameComplete: (isSuccess = true) => {
		const colors = isSuccess
			? [...SUCCESS_COLORS, ...ACCENT_COLORS, ...SPECIAL_COLORS]
			: [...BRAND_COLORS, '#9ea7bc'];

		if (isSuccess) {
			createFireSequence(colors, 250);
			setTimeout(() => createFireSequence(colors, 200), 600);
			setTimeout(() => createFireSequence(colors, 150), 1200);
		} else {
			createFireSequence(colors, 100);
		}
	},

	dailyStreak: (streakCount: number) => {
		const colors = [...ACCENT_COLORS, ...SUCCESS_COLORS, ...SPECIAL_COLORS];
		const intensity = Math.min(streakCount * 30 + 120, 250);
		createFireSequence(colors, intensity);
	},

	simpleSuccess: () => {
		const colors = [...BRAND_COLORS];
		createFireSequence(colors, 120);
	}
};

export default confettiEffects;
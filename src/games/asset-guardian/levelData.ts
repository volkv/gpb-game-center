import type { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
	{
		id: 1,
		name: 'Первые шаги',
		difficulty: 'easy',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'empty', 'empty', 'cashback', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall', 'deposit', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'trap_phishing', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'cashback', 'empty', 'wall', 'empty', 'empty', 'wall', 'empty', 'deposit', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'trap_fraud', 'empty', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'cashback', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'deposit', 'empty', 'empty', 'empty', 'empty', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 180,
		targetScore: 300,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Карта с кэшбэком',
			lesson: 'Изучите основы банковских бонусов и избегайте мошенников'
		}
	},

	{
		id: 2,
		name: 'Защита депозитов',
		difficulty: 'easy',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'empty', 'deposit', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'wall', 'wall', 'trap_phishing', 'wall', 'wall', 'empty', 'wall'],
			['wall', 'deposit', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'deposit', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'cashback', 'empty', 'cashback', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'empty', 'trap_fraud', 'empty', 'wall', 'empty', 'wall'],
			['wall', 'cashback', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'deposit', 'wall'],
			['wall', 'empty', 'wall', 'wall', 'wall', 'empty', 'wall', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 180,
		targetScore: 400,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Депозитный счет',
			lesson: 'Накапливайте проценты по вкладам и защищайте сбережения'
		}
	},

	{
		id: 3,
		name: 'Инвестиционный путь',
		difficulty: 'easy',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'empty', 'empty', 'cashback', 'wall', 'deposit', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'empty', 'empty', 'empty', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'deposit', 'empty', 'trap_phishing', 'empty', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'cashback', 'wall', 'empty', 'deposit', 'empty', 'cashback', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'empty', 'trap_fraud', 'empty', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'deposit', 'wall'],
			['wall', 'empty', 'wall', 'wall', 'wall', 'empty', 'wall', 'wall', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 160,
		targetScore: 500,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Инвестиционный портфель',
			lesson: 'Изучите основы инвестирования и управления рисками'
		}
	},

	{
		id: 4,
		name: 'Коридоры безопасности',
		difficulty: 'medium',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'wall', 'deposit', 'empty', 'empty', 'empty', 'trap_phishing', 'wall', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'wall', 'wall', 'wall', 'empty', 'wall', 'wall'],
			['wall', 'cashback', 'empty', 'empty', 'wall', 'trap_fraud', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'wall', 'wall', 'empty', 'wall', 'empty', 'wall', 'wall', 'deposit', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall', 'trap_phishing', 'empty', 'wall'],
			['wall', 'deposit', 'wall', 'wall', 'cashback', 'empty', 'wall', 'empty', 'wall', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'trap_fraud', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'cashback', 'wall', 'wall', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 120,
		targetScore: 600,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Защита от мошенничества',
			lesson: 'Навигируйте через узкие проходы, избегая мошеннических схем'
		}
	},

	{
		id: 5,
		name: 'Спираль богатства',
		difficulty: 'medium',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'deposit', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'empty', 'wall', 'wall'],
			['wall', 'cashback', 'empty', 'empty', 'empty', 'trap_phishing', 'wall', 'empty', 'wall', 'wall'],
			['wall', 'wall', 'empty', 'wall', 'wall', 'empty', 'wall', 'empty', 'wall', 'wall'],
			['wall', 'trap_fraud', 'empty', 'wall', 'deposit', 'empty', 'wall', 'cashback', 'wall', 'wall'],
			['wall', 'wall', 'empty', 'wall', 'wall', 'wall', 'wall', 'empty', 'wall', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'trap_phishing', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 120,
		targetScore: 700,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Накопительный счет',
			lesson: 'Следуйте по спирали к финансовой цели, накапливая капитал'
		}
	},

	{
		id: 6,
		name: 'Комнаты возможностей',
		difficulty: 'medium',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'wall', 'deposit', 'empty', 'wall', 'cashback', 'empty', 'trap_phishing', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'cashback', 'wall', 'wall', 'empty', 'wall', 'wall', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'wall', 'trap_fraud', 'wall', 'wall', 'wall', 'deposit', 'wall'],
			['wall', 'trap_phishing', 'wall', 'empty', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'cashback', 'empty', 'wall', 'deposit', 'empty', 'trap_fraud', 'wall'],
			['wall', 'empty', 'wall', 'wall', 'empty', 'wall', 'wall', 'wall', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 100,
		targetScore: 750,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Мультивалютный счет',
			lesson: 'Исследуйте различные возможности в каждой "комнате"'
		}
	},

	{
		id: 7,
		name: 'Минное поле мошенников',
		difficulty: 'hard',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'trap_phishing', 'empty', 'deposit', 'trap_fraud', 'empty', 'cashback', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'trap_phishing', 'empty', 'empty', 'trap_fraud', 'empty', 'empty', 'wall'],
			['wall', 'trap_fraud', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'deposit', 'wall'],
			['wall', 'empty', 'empty', 'trap_phishing', 'cashback', 'trap_fraud', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'cashback', 'trap_fraud', 'empty', 'empty', 'empty', 'trap_phishing', 'deposit', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'trap_fraud', 'wall'],
			['wall', 'empty', 'trap_phishing', 'deposit', 'trap_fraud', 'empty', 'cashback', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'trap_phishing', 'empty', 'empty', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 90,
		targetScore: 600,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Антифрод система',
			lesson: 'Проходите через поле ловушек, используя системы защиты'
		}
	},

	{
		id: 8,
		name: 'Лабиринт инвестора',
		difficulty: 'hard',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'wall', 'empty', 'empty', 'empty', 'wall', 'trap_phishing', 'wall', 'wall'],
			['wall', 'empty', 'wall', 'deposit', 'wall', 'empty', 'wall', 'empty', 'wall', 'wall'],
			['wall', 'cashback', 'wall', 'empty', 'wall', 'trap_fraud', 'wall', 'empty', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'wall', 'empty', 'empty', 'empty', 'wall', 'wall'],
			['wall', 'wall', 'wall', 'trap_phishing', 'wall', 'empty', 'wall', 'deposit', 'wall', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall', 'empty', 'empty', 'wall'],
			['wall', 'trap_fraud', 'wall', 'wall', 'wall', 'cashback', 'wall', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 90,
		targetScore: 800,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Инвестиционный портфель Pro',
			lesson: 'Навигируйте по сложным инвестиционным решениям'
		}
	},

	{
		id: 9,
		name: 'Крепость активов',
		difficulty: 'hard',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'trap_phishing', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall', 'empty', 'wall'],
			['wall', 'wall', 'wall', 'deposit', 'wall', 'trap_fraud', 'empty', 'wall', 'cashback', 'wall'],
			['wall', 'trap_phishing', 'wall', 'empty', 'wall', 'empty', 'empty', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'wall', 'cashback', 'wall', 'empty', 'deposit', 'wall', 'trap_fraud', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'deposit', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 75,
		targetScore: 850,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Премиальное управление активами',
			lesson: 'Защитите и приумножьте капитал в сложных условиях'
		}
	},

	{
		id: 10,
		name: 'Мастер финансов',
		difficulty: 'hard',
		grid: [
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
			['wall', 'start', 'trap_phishing', 'wall', 'deposit', 'wall', 'trap_fraud', 'wall', 'cashback', 'wall'],
			['wall', 'empty', 'empty', 'wall', 'empty', 'wall', 'empty', 'wall', 'empty', 'wall'],
			['wall', 'wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'trap_fraud', 'empty', 'wall', 'empty', 'wall', 'empty', 'wall', 'deposit', 'wall'],
			['wall', 'empty', 'empty', 'wall', 'cashback', 'wall', 'trap_phishing', 'wall', 'empty', 'wall'],
			['wall', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'wall'],
			['wall', 'deposit', 'wall', 'trap_fraud', 'wall', 'cashback', 'wall', 'trap_phishing', 'wall', 'wall'],
			['wall', 'empty', 'wall', 'empty', 'wall', 'empty', 'wall', 'empty', 'finish', 'wall'],
			['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
		],
		timeLimit: 60,
		targetScore: 900,
		startPosition: { row: 1, col: 1 },
		finishPosition: { row: 8, col: 8 },
		bankingTheme: {
			product: 'Комплексное банковское обслуживание',
			lesson: 'Мастерски управляйте всеми аспектами финансовой безопасности'
		}
	}
];

export function getLevelById(id: number): LevelConfig | undefined {
	return LEVELS.find(level => level.id === id);
}

export function getLevelsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): LevelConfig[] {
	return LEVELS.filter(level => level.difficulty === difficulty);
}

export function getNextLevel(currentLevelId: number): LevelConfig | null {
	const nextLevel = LEVELS.find(level => level.id === currentLevelId + 1);
	return nextLevel || null;
}

export function getTotalLevels(): number {
	return LEVELS.length;
}

export function isLastLevel(levelId: number): boolean {
	return levelId >= LEVELS.length;
}
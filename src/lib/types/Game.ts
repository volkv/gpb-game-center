export type GameStatus = 'active' | 'coming_soon' | 'maintenance' | 'disabled';

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type GameCategory = 'quiz' | 'puzzle' | 'match3' | 'crossword' | 'educational' | 'action';

export interface GameImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface GameProduct {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'deposit' | 'card' | 'loan' | 'investment' | 'insurance' | 'service';
}

export interface GameMetrics {
  averagePlayTime: number; // в секундах
  completionRate: number; // 0-1
  difficulty: GameDifficulty;
  maxScore?: number;
  averageScore?: number;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: GameCategory;
  status: GameStatus;

  // Визуальное оформление
  icon: GameImage;
  backgroundImage?: GameImage;
  gradient?: string;
  themeColor: string;

  // Игровые данные
  metrics: GameMetrics;
  estimatedDuration: number; // в минутах

  // Связанные продукты банка
  relatedProducts: GameProduct[];

  // Мета информация
  version: string;
  createdAt: Date;
  updatedAt: Date;

  // Для динамической загрузки
  componentPath: string;

  // Локализация
  locale?: string;

  // Дополнительные настройки
  settings?: Record<string, any>;
}
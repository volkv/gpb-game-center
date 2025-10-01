
import type { ComponentType } from 'svelte';
import type { QuestionEvidence } from './components/EvidencePreview.svelte';
import type { ProductSpotlightData } from './components/ProductSpotlight.svelte';
import type { ReminderRecord } from './notifications';

export interface Props {
  onexit?: () => void;
}

export interface ResultStats {
  accuracy: number;
  correctAnswers: number;
  level: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ExplanationBlock {
  summary: string;
  insights: string[];
}

export interface ExpertAdviceContent {
  title: string;
  recommendations: string[];
}

export interface MicroLesson {
  title: string;
  fact: string;
}

export interface QuestionProductContext {
  name: string;
  description: string;
  highlight: string;
}

export interface ProductMoment extends ProductSpotlightData {
  triggerQuestionId: number;
}

export interface QuizQuestion {
  id: number;
  category: string;
  threat: string;
  text: string;
  answers: string[];
  correctAnswer: number;
  difficulty: Difficulty;
  explanation: ExplanationBlock;
  expertAdvice: ExpertAdviceContent;
  microLesson: MicroLesson;
  relatedProduct?: QuestionProductContext;
  tip?: string;
  evidence?: QuestionEvidence;
}

export interface CategorySessionStats {
  correct: number;
  total: number;
}

export interface StoredCategoryStats extends CategorySessionStats {
  currentStreak: number;
  bestStreak: number;
}

export interface AchievementRecord {
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StoredProgress {
  totalSessions: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number;
bestAccuracy: number;
  bestDefense: number;
  levelXp: number;
  currentLevelId: string;
  categoryStats: Record<string, StoredCategoryStats>;
  achievements: Record<string, AchievementRecord>;
  lastUpdated?: string;
}

export interface SessionSummary {
  score: number;
  accuracy: number;
  defenseScore: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  categoryBreakdown: Record<string, CategorySessionStats>;
}

export interface AchievementContext {
  session: SessionSummary;
  progress: StoredProgress;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: ComponentType;
  condition: (context: AchievementContext) => boolean;
  progressHint: (context: AchievementContext) => string;
}

export interface LevelStage {
  id: string;
  name: string;
  minXp: number;
  description: string;
}

export type ReminderOrigin = 'restored' | 'scheduled';

export interface ReminderQueueItem extends ReminderRecord {
  origin: ReminderOrigin;
}

export interface LevelOverview {
  name: string;
  description: string;
  progressPercent: number;
  nextName?: string;
  xpToNext?: number;
  xp: number;
}

export interface AchievementView {
  id: string;
  title: string;
  description: string;
  icon: ComponentType;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  progressLabel: string;
  unlockedAt?: string;
  isNew?: boolean;
}

export interface FavoriteCategory {
  id: string;
  name: string;
  icon: ComponentType;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  total: number;
  bestStreak: number;
}

export interface SummaryMetrics {
  totalSessions: number;
  totalCorrect: number;
  totalQuestions: number;
  bestScore: number;
  bestAccuracy: number;
  bestDefense: number;
  currentStreak: number;
  bestStreak: number;
  averageAccuracy: number;
}

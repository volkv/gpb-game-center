<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { gameStore, currentGameState } from '$lib/stores/gameStore';
  import { GameLayout } from '$lib';
  import { Star, ShieldCheck } from 'lucide-svelte';
  import ProductSpotlight from './components/ProductSpotlight.svelte';
  import ReminderBanner from './components/ReminderBanner.svelte';
  import StatsDashboard from './components/StatsDashboard.svelte';
  import QuizIntro from './components/QuizIntro.svelte';
  import QuizResult from './components/QuizResult.svelte';
  import QuizPlayground from './components/QuizPlayground.svelte';

  import type {
    Props,
    ResultStats,
    ProductMoment,
    CategorySessionStats,
    StoredCategoryStats,
    AchievementRecord,
    StoredProgress,
    SessionSummary,
    AchievementContext,
    LevelStage,
    ReminderQueueItem,
    AchievementView,
    FavoriteCategory,
    LevelOverview,
    SummaryMetrics
  } from './types';
  import {
    initReminderService,
    enableReminderSchedule,
    disableReminderSchedule,
    requestNotificationPermission,
    updateReminderPermission,
    getReminderSettings,
    markReminderAsHandled,
    type ReminderSettingsState,
    type ReminderRecord,
    type ReminderPermissionState
  } from './notifications';
  import { trackEvent, trackError } from './analytics';
  import {
    scorePerQuestion,
    questions,
    STORAGE_KEY,
    levelStages,
    achievementDefinitions,
    productMoments,
    difficultyLabels,
    difficultyOrder
  } from './data';

  let { onexit }: Props = $props();

  let currentQuestionIndex = $state(0);
  let score = $state(0);
  let showResult = $state(false);
  let selectedAnswer = $state<number | null>(null);
  let showExplanation = $state(false);
  let resultStats = $state<ResultStats>({ accuracy: 0, correctAnswers: 0, level: 'Новичок' });
  let defenseScore = $state(0);
  let unlockedProductIds = $state<string[]>([]);
  let activeProduct = $state<ProductMoment | null>(null);
  let scorePulse = $state(false);

  let StatsDashboardComponent = $state<any>(null);
  let isStatsComponentLoading = $state(false);
  let statsComponentError = $state<string | null>(null);

  let reminderSettings = $state<ReminderSettingsState>(getReminderSettings());
  let reminderQueue = $state<ReminderQueueItem[]>([]);
  let activeReminder = $state<ReminderQueueItem | null>(null);
  let reminderProcessing = $state(false);

  const reminderPermission = $derived<ReminderPermissionState>(reminderSettings.permission);
  const nextReminderFireAt = $derived(() => {
    const upcoming = reminderSettings.reminders
      .filter((record) => !record.delivered)
      .sort((a, b) => a.fireAt - b.fireAt)[0];
    return upcoming?.fireAt;
  });

  function uniqueCategories() {
    return Array.from(new Set(questions.map((question) => question.category)));
  }

  function createEmptyStoredCategoryStats(): Record<string, StoredCategoryStats> {
    return uniqueCategories().reduce<Record<string, StoredCategoryStats>>((accumulator, category) => {
      accumulator[category] = { correct: 0, total: 0, currentStreak: 0, bestStreak: 0 };
      return accumulator;
    }, {});
  }

  function createEmptySessionCategoryStats(): Record<string, CategorySessionStats> {
    return uniqueCategories().reduce<Record<string, CategorySessionStats>>((accumulator, category) => {
      accumulator[category] = { correct: 0, total: 0 };
      return accumulator;
    }, {});
  }

  function createDefaultProgress(): StoredProgress {
    return {
      totalSessions: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestDefense: 0,
      levelXp: 0,
      currentLevelId: 'novice',
      categoryStats: createEmptyStoredCategoryStats(),
      achievements: {},
      lastUpdated: undefined
    };
  }

  let playerProgress = $state<StoredProgress>(createDefaultProgress());
  let sessionCategoryStats = $state<Record<string, CategorySessionStats>>(createEmptySessionCategoryStats());
  let sessionAchievements = $state<string[]>([]);
  let showStatistics = $state(false);
  let isProgressLoaded = $state(false);

  function determineLevelStage(xp: number): LevelStage {
    return levelStages.reduce((current, stage) => (xp >= stage.minXp ? stage : current), levelStages[0]);
  }

  function nextLevelStageFor(xp: number): LevelStage | null {
    const current = determineLevelStage(xp);
    const index = levelStages.findIndex((stage) => stage.id === current.id);
    if (index === -1 || index === levelStages.length - 1) {
      return null;
    }
    return levelStages[index + 1];
  }

  function alignCategoryStats(state: StoredProgress): StoredProgress {
    const template = createEmptyStoredCategoryStats();
    const merged: Record<string, StoredCategoryStats> = { ...template };

    for (const [category, stats] of Object.entries(state.categoryStats ?? {})) {
      merged[category] = {
        correct: stats.correct ?? 0,
        total: stats.total ?? 0,
        currentStreak: stats.currentStreak ?? 0,
        bestStreak: stats.bestStreak ?? 0
      };
    }

    return {
      ...state,
      categoryStats: merged
    };
  }

  function migrateProgress(raw: unknown): StoredProgress {
    if (!raw || typeof raw !== 'object') {
      return createDefaultProgress();
    }

    const base = createDefaultProgress();
    const value = raw as Partial<StoredProgress>;

    const achievements: Record<string, AchievementRecord> = { ...base.achievements };
    if (value.achievements) {
      for (const [id, record] of Object.entries(value.achievements)) {
        achievements[id] = {
          unlocked: !!record?.unlocked,
          unlockedAt: record?.unlockedAt
        };
      }
    }

    const merged: StoredProgress = {
      ...base,
      ...value,
      achievements,
      levelXp: value.levelXp ?? base.levelXp,
      currentLevelId: value.currentLevelId ?? base.currentLevelId,
      lastUpdated: value.lastUpdated ?? base.lastUpdated
    };

    return alignCategoryStats(merged);
  }

  function loadProgressFromStorage() {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      isProgressLoaded = true;
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        playerProgress = migrateProgress(JSON.parse(stored));
      } else {
        playerProgress = createDefaultProgress();
      }
    } catch (error) {
      console.warn('Не удалось загрузить прогресс квиза', error);
      playerProgress = createDefaultProgress();
    } finally {
      isProgressLoaded = true;
    }
  }

  function persistProgress(state: StoredProgress) {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Не удалось сохранить прогресс квиза', error);
    }
  }

  function computeSummaryMetrics(state: StoredProgress): SummaryMetrics {
    const averageAccuracy = state.totalQuestions === 0
      ? 0
      : Math.round((state.totalCorrect / state.totalQuestions) * 100);

    return {
      totalSessions: state.totalSessions,
      bestScore: state.bestScore,
      bestAccuracy: state.bestAccuracy,
      averageAccuracy,
      bestDefense: state.bestDefense,
      totalCorrect: state.totalCorrect,
      totalQuestions: state.totalQuestions,
      currentStreak: 0, // TODO: Add current streak calculation
      bestStreak: 0 // TODO: Add best streak calculation
    };
  }

  function computeFavoriteCategories(state: StoredProgress): FavoriteCategory[] {
    const categories = Object.entries(state.categoryStats)
      .filter(([, stats]) => stats.total > 0)
      .map(([name, stats]) => ({
        id: name,
        name,
        icon: null as any, // TODO: Add proper icon mapping
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        total: stats.total,
        bestStreak: stats.bestStreak
      }))
      .sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
        return b.total - a.total;
      });

    return categories.slice(0, 3);
  }

  function buildLevelOverview(state: StoredProgress): LevelOverview {
    const currentStage = determineLevelStage(state.levelXp);
    const nextStage = nextLevelStageFor(state.levelXp);
    const minBound = currentStage.minXp;
    const maxBound = nextStage ? nextStage.minXp : state.levelXp;
    const range = nextStage ? nextStage.minXp - minBound : 1;
    const ratio = nextStage ? Math.min(1, (state.levelXp - minBound) / range) : 1;

    return {
      name: currentStage.name,
      description: currentStage.description,
      progressPercent: Math.round(ratio * 100),
      nextName: nextStage?.name,
      xpToNext: nextStage ? Math.max(0, Math.ceil(nextStage.minXp - state.levelXp)) : undefined,
      xp: Math.round(state.levelXp)
    };
  }

  function buildAchievementViews(state: StoredProgress, newlyUnlocked: string[]): AchievementView[] {
    const context: AchievementContext = {
      session: {
        score: 0,
        accuracy: 0,
        defenseScore: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        completedAt: state.lastUpdated ?? new Date().toISOString(),
        categoryBreakdown: {}
      },
      progress: state
    };

    return achievementDefinitions.map((definition) => {
      const record = state.achievements[definition.id];
      const isUnlocked = record?.unlocked ?? false;
      const progressLabel = isUnlocked
        ? (record?.unlockedAt
            ? `Открыто ${new Date(record.unlockedAt).toLocaleDateString('ru-RU')}`
            : 'Открыто')
        : definition.progressHint(context);

      return {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        unlocked: isUnlocked,
        unlockedAt: record?.unlockedAt,
        progressLabel: progressLabel,
        isNew: newlyUnlocked.includes(definition.id)
      } satisfies AchievementView;
    });
  }

  function resolveSessionLevel(accuracy: number): string {
    if (accuracy >= 85) {
      return 'Кибер-детектив';
    }

    if (accuracy >= 65) {
      return 'Страж финансов';
    }

    if (accuracy >= 45) {
      return 'Аналитик защиты';
    }

    return 'Новичок';
  }

  function applySessionToProgress(session: SessionSummary) {
    const previous = alignCategoryStats(playerProgress);

    const updated: StoredProgress = {
      ...previous,
      totalSessions: previous.totalSessions + 1,
      totalCorrect: previous.totalCorrect + session.correctAnswers,
      totalQuestions: previous.totalQuestions + session.totalQuestions,
      bestScore: Math.max(previous.bestScore, session.score),
      bestAccuracy: Math.max(previous.bestAccuracy, session.accuracy),
      bestDefense: Math.max(previous.bestDefense, session.defenseScore),
      levelXp: previous.levelXp + session.accuracy,
      lastUpdated: session.completedAt,
      categoryStats: { ...previous.categoryStats },
      achievements: { ...previous.achievements }
    };

    for (const [category, stats] of Object.entries(session.categoryBreakdown)) {
      const stored = updated.categoryStats[category] ?? {
        correct: 0,
        total: 0,
        currentStreak: 0,
        bestStreak: 0
      };

      const questionTotal = stats.total ?? 0;
      const questionCorrect = stats.correct ?? 0;

      stored.total += questionTotal;
      stored.correct += questionCorrect;

      if (questionTotal > 0) {
        if (questionCorrect === questionTotal) {
          stored.currentStreak = (stored.currentStreak ?? 0) + 1;
        } else {
          stored.currentStreak = 0;
        }

        stored.bestStreak = Math.max(stored.bestStreak ?? 0, stored.currentStreak);
      }

      updated.categoryStats[category] = stored;
    }

    const currentStage = determineLevelStage(updated.levelXp);
    updated.currentLevelId = currentStage.id;

    const context: AchievementContext = { session, progress: updated };
    const newlyUnlocked: string[] = [];

    for (const definition of achievementDefinitions) {
      const existingRecord = updated.achievements[definition.id];
      const alreadyUnlocked = existingRecord?.unlocked ?? false;
      const conditionMet = definition.condition(context);

      if (conditionMet && !alreadyUnlocked) {
        updated.achievements[definition.id] = {
          unlocked: true,
          unlockedAt: session.completedAt
        };
        newlyUnlocked.push(definition.id);
      } else if (alreadyUnlocked) {
        updated.achievements[definition.id] = existingRecord;
      } else {
        updated.achievements[definition.id] = {
          unlocked: false,
          unlockedAt: existingRecord?.unlockedAt
        };
      }
    }

    return { updatedProgress: updated, unlockedAchievements: newlyUnlocked };
  }

  function enqueueReminder(record: ReminderRecord, origin: 'restored' | 'scheduled') {
    const item: ReminderQueueItem = { ...record, origin };
    reminderQueue = [...reminderQueue, item];

    if (!activeReminder) {
      showNextReminder();
    }
  }

  function showNextReminder() {
    if (reminderQueue.length === 0) {
      activeReminder = null;
      return;
    }

    const [next, ...rest] = reminderQueue;
    reminderQueue = rest;
    if (!next) {
      activeReminder = null;
      return;
    }

    activeReminder = next;

    trackEvent('reminder_presented', {
      reminderId: next.id,
      origin: next.origin,
      delayHours: next.delayHours
    });
  }

  function handleReminderDue(record: ReminderRecord) {
    trackEvent('reminder_due', {
      reminderId: record.id,
      delayHours: record.delayHours
    });

    enqueueReminder(record, 'scheduled');
  }

  function handleReminderDismiss() {
    if (!activeReminder) return;

    const dismissedId = activeReminder.id;
    markReminderAsHandled(dismissedId);
    trackEvent('reminder_dismissed', {
      reminderId: dismissedId,
      action: 'dismissed'
    });

    activeReminder = null;
    reminderQueue = reminderQueue.filter((item) => item.id !== dismissedId);
    showNextReminder();
    refreshReminderState();
  }

  function handleReminderAccept() {
    if (!activeReminder) return;

    const reminderId = activeReminder.id;
    markReminderAsHandled(reminderId);
    trackEvent('reminder_accepted', {
      reminderId,
      origin: activeReminder.origin
    });

    activeReminder = null;
    reminderQueue = reminderQueue.filter((item) => item.id !== reminderId);
    showNextReminder();
    refreshReminderState();

    handleStart();
  }

  function refreshReminderState() {
    reminderSettings = getReminderSettings();
  }

  async function handleReminderEnable() {
    if (reminderProcessing) return;
    reminderProcessing = true;

    try {
      if (reminderPermission === 'default' || reminderPermission === 'unknown') {
        const permission = await requestNotificationPermission();
        reminderSettings = updateReminderPermission(permission);
        trackEvent('notification_permission_resolved', { status: permission });
      }

      reminderSettings = enableReminderSchedule();
      trackEvent('reminder_opt_in', {
        permission: reminderSettings.permission,
        remindersPlanned: reminderSettings.reminders.length
      });
    } catch (error) {
      trackError('reminder_enable', error as Error);
    } finally {
      refreshReminderState();
      reminderProcessing = false;
    }
  }

  function handleReminderDisable() {
    if (reminderProcessing) return;
    reminderProcessing = true;

    try {
      reminderSettings = disableReminderSchedule();
      trackEvent('reminder_opt_out', {});
    } catch (error) {
      trackError('reminder_disable', error as Error);
    } finally {
      refreshReminderState();
      reminderProcessing = false;
      reminderQueue = [];
      activeReminder = null;
    }
  }

  async function ensureStatsComponent() {
    if (StatsDashboardComponent || isStatsComponentLoading) {
      return;
    }

    isStatsComponentLoading = true;
    statsComponentError = null;

    try {
      StatsDashboardComponent = StatsDashboard;
      trackEvent('stats_component_loaded');
    } catch (error) {
      statsComponentError = 'Не удалось загрузить статистику';
      trackError('stats_component_load', error as Error);
    } finally {
      isStatsComponentLoading = false;
    }
  }

  onMount(() => {
    loadProgressFromStorage();
    trackEvent('quiz_view', { questions: questions.length });

    const { settings, dueReminders } = initReminderService(handleReminderDue);
    reminderSettings = settings;

    if (dueReminders.length > 0) {
      dueReminders.forEach((record) => enqueueReminder(record, 'restored'));
      trackEvent('reminder_queue_restored', { count: dueReminders.length });
    }
  });

  const maxDefenseScore = productMoments.reduce((total, product) => total + product.bonusValue, 0);

  const currentQuestion = $derived(questions[currentQuestionIndex]);
  const quizProgress = $derived(((currentQuestionIndex + 1) / questions.length) * 100);
  const maxScore = $derived(questions.length * scorePerQuestion);
  const isAnswerCorrect = $derived(selectedAnswer !== null && selectedAnswer === currentQuestion.correctAnswer);
  const defenseProgress = $derived(
    maxDefenseScore === 0 ? 0 : Math.round((defenseScore / maxDefenseScore) * 100)
  );
  const finalCtaMessage = $derived(
    defenseProgress >= 80
      ? `Вы собрали ${defenseProgress}% защитного потенциала — подключите страхование карт и счетов, чтобы закрепить уровень.`
      : defenseProgress >= 40
        ? `Вы нарастили ${defenseProgress}% защитного потенциала. Страхование карт и счетов добавит компенсацию и сопровождение специалистов.`
        : 'Начните с надежного щита: страхование карт и счетов поможет возместить потери, даже если атака произойдет неожиданно.'
  );

  const stageInfo = $derived({
    stageLabel: difficultyLabels[currentQuestion.difficulty],
    stageIndex: difficultyOrder.indexOf(currentQuestion.difficulty) + 1,
    totalStages: difficultyOrder.length,
    stagePosition: (() => {
      const currentDifficulty = currentQuestion.difficulty;
      const stageIndex = difficultyOrder.indexOf(currentDifficulty);
      const questionsBefore = questions.filter(
        (question) => difficultyOrder.indexOf(question.difficulty) < stageIndex
      ).length;
      return currentQuestionIndex - questionsBefore + 1;
    })(),
    questionsInStage: questions.filter((question) => question.difficulty === currentQuestion.difficulty).length,
    isStageStart: (() => {
      const currentDifficulty = currentQuestion.difficulty;
      const stageIndex = difficultyOrder.indexOf(currentDifficulty);
      const questionsBefore = questions.filter(
        (question) => difficultyOrder.indexOf(question.difficulty) < stageIndex
      ).length;
      return currentQuestionIndex === questionsBefore;
    })()
  });

  const currentMicroLesson = $derived(currentQuestion.microLesson);
  const summaryMetrics = $derived<SummaryMetrics>(computeSummaryMetrics(playerProgress));
  const topCategories = $derived<FavoriteCategory[]>(computeFavoriteCategories(playerProgress));
  const levelOverview = $derived<LevelOverview>(buildLevelOverview(playerProgress));
  const achievementViews = $derived<AchievementView[]>(buildAchievementViews(playerProgress, sessionAchievements));
  const hasRecordedSessions = $derived(playerProgress.totalSessions > 0);
  const recentAchievements = $derived(achievementViews.filter((achievement) => achievement.isNew));

  function isProductUnlocked(id: string) {
    return unlockedProductIds.includes(id);
  }

  function tryActivateProductMoment(questionId: number) {
    const moment = productMoments.find(
      (item) => item.triggerQuestionId === questionId && !isProductUnlocked(item.id)
    );

    if (!moment) {
      return false;
    }

    unlockedProductIds = [...unlockedProductIds, moment.id];
    defenseScore += moment.bonusValue;
    activeProduct = moment;
    trackEvent('product_spotlight_shown', {
      productId: moment.id,
      bonus: moment.bonusValue
    });
    return true;
  }

  function handleProductContinue() {
    if (!activeProduct) {
      return;
    }

    const product = activeProduct;
    activeProduct = null;

    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex += 1;
      selectedAnswer = null;
      showExplanation = false;
    } else {
      finishGame();
    }

    trackEvent('product_spotlight_continue', { productId: product.id });
  }

  function resetGameState() {
    currentQuestionIndex = 0;
    score = 0;
    showResult = false;
    selectedAnswer = null;
    showExplanation = false;
    resultStats = { accuracy: 0, correctAnswers: 0, level: 'Новичок' };
    defenseScore = 0;
    unlockedProductIds = [];
    activeProduct = null;
    sessionCategoryStats = createEmptySessionCategoryStats();
    sessionAchievements = [];
    showStatistics = false;
    scorePulse = false;
  }

  function handleStart() {
    resetGameState();
    trackEvent('quiz_start', {
      level: playerProgress.currentLevelId,
      totalQuestions: questions.length
    });
    gameStore.startGame('quiz-shield-ruble');
  }

  function handleAnswerSelect(index: number) {
    if (showExplanation) return;
    selectedAnswer = index;
  }

  function handleAnswerSubmit() {
    if (selectedAnswer === null || showExplanation) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      score += scorePerQuestion;
      scorePulse = true;
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          scorePulse = false;
        }, 480);
      } else {
        scorePulse = false;
      }
    } else {
      scorePulse = false;
    }

    const category = currentQuestion.category;
    const currentStats = sessionCategoryStats[category] ?? { correct: 0, total: 0 };
    sessionCategoryStats = {
      ...sessionCategoryStats,
      [category]: {
        correct: currentStats.correct + (isCorrect ? 1 : 0),
        total: currentStats.total + 1
      }
    };

    showExplanation = true;

    trackEvent('quiz_answer', {
      questionId: currentQuestion.id,
      correct: isCorrect,
      difficulty: currentQuestion.difficulty,
      stageIndex: stageInfo.stageIndex,
      stagePosition: stageInfo.stagePosition
    });
  }

  function handleNext() {
    if (activeProduct) {
      handleProductContinue();
      return;
    }

    if (showExplanation) {
      const pausedForProduct = tryActivateProductMoment(currentQuestion.id);
      if (pausedForProduct) {
        showExplanation = false;
        return;
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex += 1;
      selectedAnswer = null;
      showExplanation = false;
    } else {
      finishGame();
    }
  }

  function finishGame() {
    activeProduct = null;
    showExplanation = false;

    const finalScore = score;
    const totalQuestions = Object.values(sessionCategoryStats).reduce(
      (total, stats) => total + (stats?.total ?? 0),
      0
    ) || questions.length;
    const maxScoreValue = totalQuestions * scorePerQuestion;
    const correctAnswers = Math.round(finalScore / scorePerQuestion);
    const accuracyPercent = Math.round((finalScore / maxScoreValue) * 100);

    const sessionLevel = resolveSessionLevel(accuracyPercent);
    const completedAt = new Date().toISOString();

    const sessionSummary: SessionSummary = {
      score: finalScore,
      accuracy: accuracyPercent,
      defenseScore,
      correctAnswers,
      totalQuestions,
      completedAt,
      categoryBreakdown: sessionCategoryStats
    };

    const { updatedProgress, unlockedAchievements } = applySessionToProgress(sessionSummary);
    playerProgress = updatedProgress;
    sessionAchievements = unlockedAchievements;
    persistProgress(updatedProgress);

    gameStore.completeGame({
      score: finalScore,
      maxScore: maxScoreValue,
      correctAnswers,
      totalAnswers: totalQuestions,
      accuracy: accuracyPercent / 100
    });

    resultStats = { accuracy: accuracyPercent, correctAnswers, level: sessionLevel };
    showResult = true;

    trackEvent('quiz_complete', {
      score: finalScore,
      maxScore: maxScoreValue,
      accuracy: accuracyPercent,
      defenseScore,
      correctAnswers,
      achievementsUnlocked: sessionAchievements.length
    });

    if (sessionAchievements.length > 0) {
      sessionAchievements.forEach((achievementId) => {
        trackEvent('achievement_unlocked', { achievementId });
      });
    }

    if (reminderSettings.enabled) {
      reminderSettings = enableReminderSchedule();
      trackEvent('reminder_schedule_refreshed', { source: 'session_complete' });
    }
    refreshReminderState();
  }

  function handleRestart() {
    handleStart();
  }

  async function handleStatsOpen() {
    if (!isProgressLoaded) {
      return;
    }
    showStatistics = true;
    await ensureStatsComponent();
    trackEvent('stats_opened', { sessions: playerProgress.totalSessions });
  }

  function handleStatsClose() {
    showStatistics = false;
    trackEvent('stats_closed');
  }
</script>

<GameLayout gameName="Щит и Рубль" background="gradient-electric" showScore={true}>
  <div class="quiz-game">
    {#if activeReminder}
      <div class="quiz-reminder">
        <ReminderBanner
          title={activeReminder.title}
          message={activeReminder.body}
          onDismiss={handleReminderDismiss}
          onAction={handleReminderAccept}
        />
      </div>
    {/if}

    {#if showStatistics}
      <section class="quiz-stage quiz-stage--stats" aria-live="polite">
        {#if StatsDashboardComponent}
          <StatsDashboard
            levelInfo={levelOverview}
            metrics={summaryMetrics}
            favoriteCategories={topCategories}
            achievements={achievementViews}
            hasHistory={hasRecordedSessions}
            isLoaded={isProgressLoaded}
            onClose={handleStatsClose}
          />
        {:else if isStatsComponentLoading}
          <div class="stats-loader" role="status">
            <span class="stats-loader__spinner"></span>
            <span>Загружаем статистику…</span>
          </div>
        {:else if statsComponentError}
          <div class="stats-error" role="alert">{statsComponentError}</div>
        {:else}
          <div class="stats-loader" role="status">
            <span class="stats-loader__spinner"></span>
            <span>Готовим данные…</span>
          </div>
        {/if}
      </section>
    {:else if !$currentGameState || $currentGameState.status === 'idle'}
      <QuizIntro
        questions={questions}
        maxScore={maxScore}
        levelOverview={levelOverview}
        hasRecordedSessions={hasRecordedSessions}
        isProgressLoaded={isProgressLoaded}
        onStart={handleStart}
        onStatsOpen={handleStatsOpen}
      />
    {:else if showResult}
      <QuizResult
        resultStats={resultStats}
        score={score}
        scorePulse={scorePulse}
        maxScore={maxScore}
        questions={questions}
        defenseScore={defenseScore}
        maxDefenseScore={maxDefenseScore}
        defenseProgress={defenseProgress}
        levelOverview={levelOverview}
        reminderSettings={reminderSettings}
        reminderProcessing={reminderProcessing}
        nextReminderFireAt={nextReminderFireAt()}
        recentAchievements={recentAchievements}
        finalCtaMessage={finalCtaMessage}
        isProgressLoaded={isProgressLoaded}
        onexit={onexit}
        onStatsOpen={handleStatsOpen}
        onRestart={handleRestart}
        onReminderEnable={handleReminderEnable}
        onReminderDisable={handleReminderDisable}
      />
    {:else}
      {#if activeProduct}
        <section class="quiz-stage quiz-stage--product" aria-live="polite">
          <div class="product-progress">
            <div
              class="score-pill"
              class:score-pill--pulse={scorePulse}
              aria-label={`Набрано очков: ${score}`}
            >
              <Star size={16} aria-hidden="true" />
              <span>{score}</span>
            </div>
            <div
              class="score-pill score-pill--defense"
              aria-label={`Уровень защиты: ${defenseScore} из ${maxDefenseScore}`}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              <span>+{defenseScore}</span>
              <span class="score-pill__total">/ {maxDefenseScore}</span>
            </div>
          </div>
          <ProductSpotlight product={activeProduct} onContinue={handleProductContinue} />
        </section>
      {:else}
        <QuizPlayground
          currentQuestionIndex={currentQuestionIndex}
          questions={questions}
          quizProgress={quizProgress}
          score={score}
          scorePulse={scorePulse}
          defenseScore={defenseScore}
          stageInfo={stageInfo}
          difficultyLabels={difficultyLabels}
          selectedAnswer={selectedAnswer}
          showExplanation={showExplanation}
          isAnswerCorrect={isAnswerCorrect}
          currentMicroLesson={currentMicroLesson}
          onAnswerSelect={handleAnswerSelect}
          onAnswerSubmit={handleAnswerSubmit}
          onNext={handleNext}
        />
      {/if}
    {/if}
  </div>
</GameLayout>

<style>
  .quiz-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    width: 100%;
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  .quiz-stage {
    width: min(640px, 100%);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .quiz-reminder {
    width: min(640px, 100%);
  }

  .stats-loader {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-muted);
    background: var(--color-surface-card);
    color: var(--color-fg-muted);
  }

  .stats-loader__spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--color-border-muted);
    border-top-color: var(--color-brand-500);
    animation: stats-spin 900ms linear infinite;
  }

  .stats-error {
    padding: 1.25rem 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 103, 103, 0.08);
    color: var(--color-state-danger);
    font-weight: 600;
  }

  .quiz-stage--product {
    align-items: center;
    gap: 1.5rem;
  }

  .product-progress {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .score-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius-full);
    background: var(--layer-brand-100);
    color: var(--color-brand-600);
    font-weight: 600;
    font-size: 0.9rem;
    transition: transform 220ms ease, box-shadow 220ms ease;
  }

  .score-pill--pulse {
    animation: score-pulse 420ms ease;
    box-shadow: var(--shadow-soft);
  }

  .score-pill--defense {
    background: var(--layer-brand-080);
    color: var(--color-brand-700);
  }

  .score-pill :global(svg) {
    width: 18px;
    height: 18px;
  }

  .score-pill__total {
    font-size: 0.75rem;
    opacity: 0.85;
  }

  @keyframes score-pulse {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes stats-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
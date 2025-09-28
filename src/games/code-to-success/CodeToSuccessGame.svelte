<script lang="ts">
  import { GameLayout } from '$lib';
  import { gameStore } from '$lib/stores/gameStore';
  import type { GameResults } from '$lib/types/GameState';
  import CharacterSelection from './components/CharacterSelection.svelte';
  import DialogueInterface from './components/DialogueInterface.svelte';
  import ChoiceInterface from './components/ChoiceInterface.svelte';
  import EducationScreen from './components/EducationScreen.svelte';
  import { codeToSuccessScenario, scenes } from './data/scenario';
  import type { Character, NovellaGameState, ChoiceOption, ChoiceHistoryEntry } from './types';
  import { NovellaScreen, CompletionPath, ChoiceConsequence } from './types';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  const screenEnter = (node: Element) => {
    return fly(node, {
      x: 30,
      duration: 400,
      easing: cubicOut
    });
  };

  const screenExit = (node: Element) => {
    return fade(node, {
      duration: 200,
      easing: cubicOut
    });
  };

  interface Props {
    onexit: () => void;
  }

  let { onexit }: Props = $props();

  let gameState = $state<NovellaGameState>({
    currentScreen: NovellaScreen.CHARACTER_SELECTION,
    currentSceneId: 'intro',
    visitedScenes: [],
    choiceHistory: [],
    educationCompleted: false,
    finalScore: 0,
    completionPath: CompletionPath.INCOMPLETE
  });

  let gameStarted = $state(false);

  $effect(() => {
    if (!gameStarted) {
      gameStore.startGame('code-to-success');
      gameStarted = true;
    }
  });

  const updateGameProgress = () => {
    const totalScenes = scenes.length;
    const currentProgress = Math.min(100, Math.round((gameState.visitedScenes.length / totalScenes) * 100));

    gameStore.updateGameState(state => ({
      ...state,
      progress: {
        ...state.progress,
        percentage: currentProgress
      },
      score: {
        ...state.score,
        current: gameState.finalScore
      }
    }));
  };

  const determineCompletionPath = (choiceHistory: ChoiceHistoryEntry[]): CompletionPath => {
    const lastChoice = choiceHistory[choiceHistory.length - 1];
    if (!lastChoice) return CompletionPath.INCOMPLETE;

    const choice = scenes
      .flatMap(scene => scene.choices || [])
      .find(choice => choice.id === lastChoice.choiceId);

    if (!choice) return CompletionPath.INCOMPLETE;

    const selectedOption = choice.options.find(option => option.id === lastChoice.optionId);
    if (!selectedOption) return CompletionPath.INCOMPLETE;

    return selectedOption.consequence === ChoiceConsequence.GOOD ? CompletionPath.GOOD : CompletionPath.BAD;
  };

  const handleCharacterSelect = (character: Character) => {
    gameState.selectedCharacter = character;
    gameState.currentScreen = NovellaScreen.DIALOGUE;
    gameState.currentSceneId = 'intro';
    gameState.currentDialogueStepId = undefined;
    updateGameProgress();
  };

  const handleGameStateUpdate = (newState: NovellaGameState) => {
    gameState = newState;
    updateGameProgress();
  };

  const handleDialogueComplete = () => {
    gameState.currentScreen = NovellaScreen.CHOICE;
    updateGameProgress();
  };

  const handleChoiceSelect = (choiceOption: ChoiceOption) => {
    const choiceHistoryEntry: ChoiceHistoryEntry = {
      choiceId: 'main-choice',
      optionId: choiceOption.id,
      timestamp: new Date()
    };

    gameState.choiceHistory = [...gameState.choiceHistory, choiceHistoryEntry];
    gameState.finalScore += choiceOption.points || 0;
    gameState.completionPath = determineCompletionPath(gameState.choiceHistory);

    const nextScene = scenes.find(scene => scene.id === choiceOption.nextSceneId);
    if (nextScene) {
      gameState.currentSceneId = nextScene.id;
      gameState.currentDialogueStepId = undefined;
      gameState.visitedScenes = [...gameState.visitedScenes, gameState.currentSceneId];
      gameState.currentScreen = NovellaScreen.DIALOGUE;
    } else {
      gameState.currentScreen = NovellaScreen.EDUCATION;
    }
    updateGameProgress();
  };

  const handleRewardClaim = () => {
    gameState.educationCompleted = true;

    const gameResults: GameResults = {
      score: gameState.finalScore,
      maxScore: 100,
      accuracy: gameState.completionPath === CompletionPath.GOOD ? 1.0 : 0.5,
      correctAnswers: gameState.completionPath === CompletionPath.GOOD ? 1 : 0,
      totalAnswers: 1,
      grade: gameState.completionPath === CompletionPath.GOOD ? 'A' : 'C',
      achievements: gameState.completionPath === CompletionPath.GOOD ? ['smart-choice'] : []
    };

    gameStore.completeGame(gameResults);
    gameState.currentScreen = NovellaScreen.COMPLETED;
  };

  const handleExit = () => {
    gameStore.exitGame();
    onexit();
  };
</script>

<GameLayout
  gameName="Код к Успеху"
  background="gradient-mystery"
  showScore={false}
  showBackButton={true}
>
  <div class="screen-container">
    {#if gameState.currentScreen === NovellaScreen.CHARACTER_SELECTION}
      <div class="screen-wrapper" in:screenEnter out:screenExit>
        <CharacterSelection onCharacterSelect={handleCharacterSelect} />
      </div>
    {:else if gameState.currentScreen === NovellaScreen.DIALOGUE}
      <div class="screen-wrapper" in:screenEnter out:screenExit>
        <DialogueInterface
          gameState={gameState}
          onStateUpdate={handleGameStateUpdate}
          onDialogueComplete={handleDialogueComplete}
        />
      </div>
    {:else if gameState.currentScreen === NovellaScreen.CHOICE}
      <div class="screen-wrapper" in:screenEnter out:screenExit>
        <ChoiceInterface
          gameState={gameState}
          onChoiceSelect={handleChoiceSelect}
        />
      </div>
    {:else if gameState.currentScreen === NovellaScreen.EDUCATION}
      <div class="screen-wrapper" in:screenEnter out:screenExit>
        <EducationScreen
          gameState={gameState}
          onRewardClaim={handleRewardClaim}
          onExit={handleExit}
        />
      </div>
    {:else if gameState.currentScreen === NovellaScreen.COMPLETED}
      <div class="screen-wrapper" in:screenEnter out:screenExit>
        <div class="completion-screen">
          <div class="surface-card p-6 text-center max-w-md mx-auto">
            <div class="completion-icon" aria-hidden="true">🎉</div>
            <h3 class="completion-title">
              Поздравляем! Игра завершена!
            </h3>
            <p class="completion-text">
              Вы успешно прошли визуальную новеллу "Код к Успеху" и заработали {gameState.finalScore} очков!
            </p>
            <button
              type="button"
              class="btn-primary"
              onclick={handleExit}
              aria-label="Завершить игру и вернуться в игровой центр"
            >
              Вернуться в Игровой Центр
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div class="screen-wrapper" in:screenEnter out:screenExit>
        <div class="fallback-screen">
          <div class="surface-card p-6 text-center max-w-md mx-auto">
            <h3 class="fallback-title">
              Экран в разработке
            </h3>
            <p class="fallback-text">
              Этот экран будет реализован в следующих итерациях
            </p>
            <button type="button" class="btn-primary" onclick={handleExit}>
              Вернуться в Игровой Центр
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</GameLayout>

<style>
  .screen-container {
    position: relative;
    width: 100%;
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  .screen-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  .fallback-screen,
  .completion-screen {
    min-height: 80vh;
    min-height: 80dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }


  .completion-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .completion-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-brand-600);
    margin: 0 0 1rem 0;
    line-height: 1.3;
  }

  .completion-text {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-fg-secondary);
    line-height: 1.5;
    margin: 0 0 2rem 0;
  }

  .fallback-title {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-fg-primary);
    margin: 0 0 1rem 0;
  }

  .fallback-text {
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-fg-secondary);
    line-height: 1.5;
    margin: 0 0 2rem 0;
  }


</style>

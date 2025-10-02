<script lang="ts">
  import { GameLayout } from '$lib';
  import { gameStore } from '$lib/stores/gameStore';
  import type { GameResults } from '$lib/types/GameState';
  import CharacterSelection from './components/CharacterSelection.svelte';
  import DialogueInterface from './components/DialogueInterface.svelte';
  import ChoiceInterface from './components/ChoiceInterface.svelte';
  import FinalSceneDisplay from './components/FinalSceneDisplay.svelte';
  import EducationScreen from './components/EducationScreen.svelte';
  import GameResultsModal from './components/GameResultsModal.svelte';
  import { codeToSuccessScenario, annaScenes, maximScenes } from './data/scenario';
  import type { Character, NovellaGameState, ChoiceOption, ChoiceHistoryEntry, Scene } from './types';
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
  let showResultsModal = $state(false);
  let currentScenes = $state<Scene[]>([]);

  $effect(() => {
    if (!gameStarted) {
      gameStore.startGame('code-to-success');
      gameStarted = true;
    }
  });

  const updateGameProgress = () => {
    const totalScenes = currentScenes.length || 1;
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

    const choice = currentScenes
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

    if (character.id === 'anna') {
      currentScenes = annaScenes;
      gameState.currentSceneId = 'intro';
    } else if (character.id === 'maxim') {
      currentScenes = maximScenes;
      gameState.currentSceneId = 'maxim-intro';
    } else {
      currentScenes = annaScenes;
      gameState.currentSceneId = 'intro';
    }

    gameState.currentDialogueStepId = undefined;
    updateGameProgress();
  };

  const handleGameStateUpdate = (newState: NovellaGameState) => {
    gameState = newState;
    updateGameProgress();
  };

  const handleDialogueComplete = () => {
    const currentScene = currentScenes.find(scene => scene.id === gameState.currentSceneId);

    if (currentScene?.choices && currentScene.choices.length > 0) {
      gameState.currentScreen = NovellaScreen.CHOICE;
    } else if (currentScene?.id.includes('ending')) {
      gameState.currentScreen = NovellaScreen.FINAL_SCENE;
    } else {
      gameState.currentScreen = NovellaScreen.CHOICE;
    }
    updateGameProgress();
  };

  const handleFinalSceneComplete = () => {
    gameState.currentScreen = NovellaScreen.EDUCATION;
    updateGameProgress();
  };

  const handleChoiceSelect = (choiceOption: ChoiceOption) => {
    const choiceId = gameState.selectedCharacter?.id === 'anna' ? 'main-choice' : 'maxim-main-choice';
    const choiceHistoryEntry: ChoiceHistoryEntry = {
      choiceId,
      optionId: choiceOption.id,
      timestamp: new Date()
    };

    gameState.choiceHistory = [...gameState.choiceHistory, choiceHistoryEntry];
    gameState.finalScore += choiceOption.points || 0;
    gameState.completionPath = determineCompletionPath(gameState.choiceHistory);

    const nextScene = currentScenes.find(scene => scene.id === choiceOption.nextSceneId);
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
    showResultsModal = true;
  };

  const handleRestartGame = () => {
    showResultsModal = false;
    currentScenes = [];
    gameState = {
      currentScreen: NovellaScreen.CHARACTER_SELECTION,
      currentSceneId: 'intro',
      visitedScenes: [],
      choiceHistory: [],
      educationCompleted: false,
      finalScore: 0,
      completionPath: CompletionPath.INCOMPLETE
    };
    gameStore.startGame('code-to-success');
  };

  const handleFinalExit = () => {
    showResultsModal = false;
    gameStore.exitGame();
    onexit();
  };

  const handleExit = () => {
    gameStore.exitGame();
    onexit();
  };
</script>

<GameLayout
  gameName="Код Безопасности"
  background="gradient-mystery"
  showScore={false}
  showBackButton={true}
  noPadding={true}
>
  {#if gameState.currentScreen === NovellaScreen.CHARACTER_SELECTION}
    <div class="screen-wrapper" in:screenEnter out:screenExit>
      <CharacterSelection onCharacterSelect={handleCharacterSelect} />
    </div>
  {:else if gameState.currentScreen === NovellaScreen.DIALOGUE}
    <div class="screen-wrapper" in:screenEnter out:screenExit>
      <DialogueInterface
        gameState={gameState}
        scenes={currentScenes}
        onStateUpdate={handleGameStateUpdate}
        onDialogueComplete={handleDialogueComplete}
      />
    </div>
  {:else if gameState.currentScreen === NovellaScreen.CHOICE}
    <div class="screen-wrapper" in:screenEnter out:screenExit>
      <ChoiceInterface
        gameState={gameState}
        scenes={currentScenes}
        onChoiceSelect={handleChoiceSelect}
      />
    </div>
  {:else if gameState.currentScreen === NovellaScreen.FINAL_SCENE}
    {#key gameState.currentSceneId}
      <FinalSceneDisplay
        backgroundImage={currentScenes.find(s => s.id === gameState.currentSceneId)?.backgroundImage || ''}
        onComplete={handleFinalSceneComplete}
      />
    {/key}
  {:else if gameState.currentScreen === NovellaScreen.EDUCATION}
    <div class="screen-wrapper" in:screenEnter out:screenExit>
      <EducationScreen
        gameState={gameState}
        onRewardClaim={handleRewardClaim}
        onExit={handleExit}
      />
    </div>
  {:else}
    <div class="fallback-screen" in:screenEnter out:screenExit>
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
  {/if}

  <!-- Results Modal -->
  {#if showResultsModal}
    <GameResultsModal
      gameState={gameState}
      onRestart={handleRestartGame}
      onExit={handleFinalExit}
    />
  {/if}
</GameLayout>

<style>
  .screen-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .fallback-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
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

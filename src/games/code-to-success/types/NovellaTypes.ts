export enum NovellaScreen {
  INTRO = 'intro',
  CHARACTER_SELECTION = 'character-selection',
  DIALOGUE = 'dialogue',
  CHOICE = 'choice',
  FINAL_SCENE = 'final-scene',
  EDUCATION = 'education',
  COMPLETED = 'completed'
}

export enum SpeakerType {
  ANNA = 'anna',
  MIKHAIL = 'mikhail',
  FRAUDSTER = 'fraudster',
  NARRATOR = 'narrator',
  PHONE = 'phone'
}

export enum ChoiceConsequence {
  GOOD = 'good',
  BAD = 'bad',
  NEUTRAL = 'neutral'
}

export enum CompletionPath {
  GOOD = 'good',
  BAD = 'bad',
  INCOMPLETE = 'incomplete'
}

export enum ContinueAction {
  TAP = 'tap',
  AUTO = 'auto'
}

export interface Character {
  id: string;
  name: string;
  age: number;
  profession: string;
  description: string;
  avatar: string;
  dialogueImages: string[];
  isAvailable: boolean;
}

export interface DialogueStep {
  id: string;
  speaker: SpeakerType;
  text: string;
  characterImage?: string;
  backgroundImage?: string;
  continueAction: ContinueAction;
  nextStepId?: string;
  choiceId?: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  description?: string;
  consequence: ChoiceConsequence;
  nextSceneId: string;
  points?: number;
}

export interface Choice {
  id: string;
  title: string;
  text: string;
  options: ChoiceOption[];
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  backgroundImage?: string;
  dialogueSteps: DialogueStep[];
  choices?: Choice[];
  nextSceneId?: string;
  isEducational?: boolean;
}

export interface ChoiceHistoryEntry {
  choiceId: string;
  optionId: string;
  timestamp: Date;
}

export interface NovellaGameState {
  currentScreen: NovellaScreen;
  selectedCharacter?: Character;
  currentSceneId: string;
  currentDialogueStepId?: string;
  visitedScenes: string[];
  choiceHistory: ChoiceHistoryEntry[];
  educationCompleted: boolean;
  finalScore: number;
  completionPath: CompletionPath;
}

export interface EducationScreen {
  id: string;
  title: string;
  summary: string;
  correctDecision: string;
  rewardPoints: number;
  productIntegration?: {
    title: string;
    description: string;
    buttonText: string;
    url?: string;
    isActive: boolean;
  };
}

export interface NovellaScenario {
  id: string;
  name: string;
  description: string;
  version: string;
  characters: Character[];
  scenes: Scene[];
  educationScreen: EducationScreen;
  metadata: {
    estimatedDuration: number;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    tags: string[];
  };
}
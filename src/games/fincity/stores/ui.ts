import { writable, derived } from 'svelte/store';
import { generateId } from '$lib/utils/id';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ModalState {
  type: 'build_menu' | 'quest_log' | 'settings' | 'building_info' | 'building_upgrade' | 'achievements' | null;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

interface UIState {
  modal: ModalState;
  toasts: ToastMessage[];
  selectedBuilding: string | null;
  isGridVisible: boolean;
  isMenuOpen: boolean;
  tutorialStep: number;
  isTutorialActive: boolean;
}

const initialUIState: UIState = {
  modal: {
    type: null,
    isOpen: false
  },
  toasts: [],
  selectedBuilding: null,
  isGridVisible: true,
  isMenuOpen: false,
  tutorialStep: 0,
  isTutorialActive: false
};

export const ui = writable<UIState>(initialUIState);

export const modal = derived(ui, $ui => $ui.modal);
export const toasts = derived(ui, $ui => $ui.toasts);
export const selectedBuilding = derived(ui, $ui => $ui.selectedBuilding);
export const isTutorialActive = derived(ui, $ui => $ui.isTutorialActive);

export function openModal(type: ModalState['type'], data?: Record<string, unknown>) {
  ui.update(state => ({
    ...state,
    modal: {
      type,
      isOpen: true,
      data
    }
  }));
}

export function closeModal() {
  ui.update(state => ({
    ...state,
    modal: {
      type: null,
      isOpen: false
    }
  }));
}

export function showToast(
  type: ToastMessage['type'],
  title: string,
  message: string,
  duration: number = 4000
) {
  const toast: ToastMessage = {
    id: generateId('toast'),
    type,
    title,
    message,
    duration
  };

  ui.update(state => ({
    ...state,
    toasts: [...state.toasts, toast]
  }));

  if (duration > 0) {
    setTimeout(() => {
      hideToast(toast.id);
    }, duration);
  }

  return toast.id;
}

export function hideToast(toastId: string) {
  ui.update(state => ({
    ...state,
    toasts: state.toasts.filter(toast => toast.id !== toastId)
  }));
}

export function clearAllToasts() {
  ui.update(state => ({
    ...state,
    toasts: []
  }));
}

export function selectBuilding(buildingId: string | null) {
  ui.update(state => ({
    ...state,
    selectedBuilding: buildingId
  }));
}

export function toggleGrid() {
  ui.update(state => ({
    ...state,
    isGridVisible: !state.isGridVisible
  }));
}


export function toggleMenu() {
  ui.update(state => ({
    ...state,
    isMenuOpen: !state.isMenuOpen
  }));
}

export function startTutorial() {
  ui.update(state => ({
    ...state,
    isTutorialActive: true,
    tutorialStep: 0
  }));
}

export function nextTutorialStep() {
  ui.update(state => ({
    ...state,
    tutorialStep: state.tutorialStep + 1
  }));
}

export function completeTutorial() {
  ui.update(state => ({
    ...state,
    isTutorialActive: false,
    tutorialStep: 0
  }));
}

export function skipTutorial() {
  ui.update(state => ({
    ...state,
    isTutorialActive: false,
    tutorialStep: 0
  }));
}

export function showSuccessToast(title: string, message: string) {
  return showToast('success', title, message);
}

export function showErrorToast(title: string, message: string) {
  return showToast('error', title, message);
}

export function showWarningToast(title: string, message: string) {
  return showToast('warning', title, message);
}

export function showInfoToast(title: string, message: string) {
  return showToast('info', title, message);
}

export function resetUIState() {
  ui.set({ ...initialUIState });
}
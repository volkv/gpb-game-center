import { cubicOut, quintOut, elasticOut, backOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

// Базовые параметры анимаций
export interface AnimationParams {
  delay?: number;
  duration?: number;
  easing?: (t: number) => number;
}

export interface SlideParams extends AnimationParams {
  x?: number;
  y?: number;
}

export interface ScaleParams extends AnimationParams {
  start?: number;
  opacity?: number;
}

export interface StaggerParams extends AnimationParams {
  baseDelay?: number;
  increment?: number;
}

// Плавное появление снизу с упругостью (для иконок игр)
export function slideUpBounce(
  node: Element,
  { delay = 0, duration = 600, y = 50, easing = elasticOut }: SlideParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: ${transform} translateY(${(1 - t) * y}px);
      opacity: ${t * opacity};
    `
  };
}

// Масштабирование с упругостью (для кнопок и карточек)
export function scaleSpring(
  node: Element,
  { delay = 0, duration = 400, start = 0.8, easing = backOut }: ScaleParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: ${transform} scale(${start + (1 - start) * t});
      opacity: ${t * opacity};
    `
  };
}

// Горизонтальный слайд для переходов между экранами
export function slideHorizontal(
  node: Element,
  { delay = 0, duration = 300, x = 100, easing = cubicOut }: SlideParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: ${transform} translateX(${(1 - t) * x}px);
      opacity: ${t * opacity};
    `
  };
}

// Последовательное появление элементов (staggered animation)
export function createStaggeredAnimation(
  index: number,
  { baseDelay = 0, increment = 100, duration = 400, easing = quintOut }: StaggerParams = {}
) {
  return {
    delay: baseDelay + index * increment,
    duration,
    easing
  };
}

// Пульсация для индикаторов загрузки
export function pulse(
  node: Element,
  { delay = 0, duration = 1000 }: AnimationParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    css: (t) => {
      const pulse = Math.sin(t * Math.PI * 2);
      return `
        opacity: ${0.5 + 0.5 * pulse};
        transform: scale(${1 + 0.1 * pulse});
      `;
    }
  };
}

// Переворот карточки (flip effect)
export function flip(
  node: Element,
  { delay = 0, duration = 600, easing = cubicOut }: AnimationParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: rotateY(${(1 - t) * 180}deg);
      opacity: ${t * opacity};
    `
  };
}

// Эффект взрыва (для анимации победы)
export function explode(
  node: Element,
  { delay = 0, duration = 800, easing = quintOut }: AnimationParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t) => {
      const scale = 1 + (1 - t) * 2;
      const opacity = t;
      return `
        transform: scale(${scale});
        opacity: ${opacity};
        filter: blur(${(1 - t) * 10}px);
      `;
    }
  };
}

// Эффект печатной машинки для текста
export function typewriter(
  node: Element,
  { delay = 0, duration = 1000 }: AnimationParams = {}
): TransitionConfig {
  const text = node.textContent || '';
  const length = text.length;

  return {
    delay,
    duration,
    tick: (t) => {
      const i = Math.trunc(length * t);
      node.textContent = text.slice(0, i);
    }
  };
}

// Глитч-эффект для игровых элементов
export function glitch(
  node: Element,
  { delay = 0, duration = 300 }: AnimationParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    css: (t) => {
      const glitchX = Math.random() * 10 - 5;
      const glitchY = Math.random() * 10 - 5;
      const intensity = (1 - t) * 20;

      return `
        transform: translate(${glitchX * intensity}px, ${glitchY * intensity}px);
        filter: hue-rotate(${Math.random() * 360}deg) saturate(${100 + intensity * 10}%);
        opacity: ${0.7 + t * 0.3};
      `;
    }
  };
}

// Утилиты для работы с анимациями
export const animationPresets = {
  // Быстрые переходы для интерактивных элементов
  fast: { duration: 200, easing: cubicOut },

  // Стандартные переходы для большинства элементов
  normal: { duration: 300, easing: cubicOut },

  // Медленные переходы для драматических эффектов
  slow: { duration: 600, easing: quintOut },

  // Упругие анимации для игровых элементов
  bouncy: { duration: 500, easing: elasticOut },

  // Плавные переходы для текста и контента
  smooth: { duration: 400, easing: quintOut }
} as const;

// Функция для создания последовательности анимаций
export function sequenceAnimation(
  elements: Element[],
  animationFn: (node: Element, params: any) => TransitionConfig,
  params: any = {},
  staggerDelay = 100
) {
  return elements.map((element, index) => {
    return animationFn(element, {
      ...params,
      delay: (params.delay || 0) + index * staggerDelay
    });
  });
}

// Обработчики для различных игровых событий
export const gameAnimations = {
  // Появление иконки игры
  gameIconEnter: (node: Element, index: number) =>
    slideUpBounce(node, {
      ...createStaggeredAnimation(index, { increment: 150 }),
      y: 30,
      easing: backOut
    }),

  // Нажатие на иконку игры
  gameIconClick: (node: Element) =>
    scaleSpring(node, {
      duration: 200,
      start: 0.95,
      easing: elasticOut
    }),

  // Переход к игре
  gameTransition: (node: Element) =>
    slideHorizontal(node, {
      duration: 400,
      x: -100,
      easing: quintOut
    }),

  // Анимация победы
  victory: (node: Element) =>
    explode(node, {
      duration: 1000,
      easing: quintOut
    }),

  // Анимация загрузки игры
  gameLoading: (node: Element) =>
    pulse(node, { duration: 1500 })
} as const;
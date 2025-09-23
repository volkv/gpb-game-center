import { cubicOut, quintOut, elasticOut, backOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { animationPresets } from './animations.js';

export interface TransitionParams {
  delay?: number;
  duration?: number;
  easing?: (t: number) => number;
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
}

export function slideEnhanced(
  node: Element,
  { delay = 0, duration = 300, easing = cubicOut, x = 0, y = 0 }: TransitionParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: ${transform} translate(${x * (1 - t)}px, ${y * (1 - t)}px);
      opacity: ${t * opacity};
    `
  };
}

export function scaleEnhanced(
  node: Element,
  { delay = 0, duration = 300, easing = quintOut, scale = 0.8, opacity = 0 }: TransitionParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const baseOpacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: ${transform} scale(${scale + (1 - scale) * t});
      opacity: ${opacity + (baseOpacity - opacity) * t};
    `
  };
}

export function slideInOut(
  node: Element,
  { delay = 0, duration = 400, easing = quintOut, x = 100 }: TransitionParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
      transform: translateX(${u * x}px);
      opacity: ${t};
    `
  };
}

export function scaleAndSlide(
  node: Element,
  { delay = 0, duration = 500, easing = backOut, x = 30, y = 30, scale = 0.9 }: TransitionParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: ${transform} translate(${x * (1 - t)}px, ${y * (1 - t)}px) scale(${scale + (1 - scale) * t});
      opacity: ${t * opacity};
    `
  };
}

export function staggeredFadeIn(
  node: Element,
  { delay = 0, duration = 400, easing = quintOut }: TransitionParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t) => `
      opacity: ${t};
      transform: translateY(${20 * (1 - t)}px);
    `
  };
}

export function bounceIn(
  node: Element,
  { delay = 0, duration = 600, easing = elasticOut }: TransitionParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: scale(${0.3 + 0.7 * t});
      opacity: ${t};
    `
  };
}

export function slideHorizontalSmooth(
  node: Element,
  { delay = 0, duration = 400, easing = quintOut, x = 50 }: TransitionParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t, u) => {
      const slideX = u * x;
      const opacity = t;
      return `
        transform: translateX(${slideX}px);
        opacity: ${opacity};
        filter: blur(${u * 2}px);
      `;
    }
  };
}

export function fadeBlur(
  node: Element,
  { delay = 0, duration = 300, easing = cubicOut }: TransitionParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
      opacity: ${t};
      filter: blur(${u * 4}px);
    `
  };
}

export function spring(
  node: Element,
  { delay = 0, duration = 500, easing = elasticOut }: TransitionParams = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing,
    css: (t) => {
      const scale = t < 0.5 ? 0.8 + 0.4 * t : 1.2 - 0.2 * t;
      return `
        transform: scale(${scale});
        opacity: ${t};
      `;
    }
  };
}

export function slideUpBounce(
  node: Element,
  { delay = 0, duration = 600, easing = backOut, y = 50 }: TransitionParams = {}
): TransitionConfig {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;

  return {
    delay,
    duration,
    easing,
    css: (t) => `
      transform: ${transform} translateY(${y * (1 - t)}px);
      opacity: ${t * opacity};
    `
  };
}

export const transitionPresets = {
  fast: { duration: 200, easing: cubicOut },
  normal: { duration: 300, easing: cubicOut },
  slow: { duration: 500, easing: quintOut },
  bouncy: { duration: 600, easing: elasticOut },
  smooth: { duration: 400, easing: quintOut },
  spring: { duration: 500, easing: backOut }
} as const;

export const gameTransitions = {
  iconEnter: (delay: number = 0) => ({
    delay,
    duration: 600,
    easing: backOut
  }),

  cardHover: {
    duration: 200,
    easing: cubicOut
  },

  screenTransition: {
    duration: 400,
    easing: quintOut
  },

  modalFade: {
    duration: 300,
    easing: cubicOut
  },

  buttonPress: {
    duration: 150,
    easing: cubicOut
  }
} as const;

export function createStaggered(
  baseTransition: (node: Element, params: any) => TransitionConfig,
  index: number,
  baseDelay: number = 0,
  increment: number = 100
) {
  return (node: Element, params: TransitionParams = {}) =>
    baseTransition(node, {
      ...params,
      delay: baseDelay + index * increment
    });
}

export function reduceMotionTransition(
  normalTransition: (node: Element, params: any) => TransitionConfig,
  reducedTransition?: (node: Element, params: any) => TransitionConfig
) {
  return (node: Element, params: TransitionParams = {}) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && reducedTransition) {
      return reducedTransition(node, { ...params, duration: 200 });
    }

    if (prefersReducedMotion) {
      return {
        delay: params.delay || 0,
        duration: 200,
        css: (t: number) => `opacity: ${t};`
      };
    }

    return normalTransition(node, params);
  };
}
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    value?: number;
    target?: number;
    duration?: number;
    format?: 'number' | 'currency' | 'percentage';
    prefix?: string;
    suffix?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'score' | 'mini-stat';
    label?: string;
    animated?: boolean;
    class?: string;
  }

  let {
    value = 0,
    target = 0,
    duration = 1000,
    format = 'number',
    prefix = '',
    suffix = '',
    size = 'md',
    variant = 'default',
    label = '',
    animated = true,
    class: className = ''
  }: Props = $props();

  let displayValue = $state(value);
  let previousTarget = $state(target);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const variantClasses = {
    default: 'font-bold tabular-nums',
    score: 'font-score animate-count-up',
    'mini-stat': 'mini-stat-value'
  };

  const formatValue = (val: number): string => {
    const rounded = Math.round(val);

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(rounded);
      case 'percentage':
        return `${rounded}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('ru-RU').format(rounded);
    }
  };

  const animateValue = (start: number, end: number, duration: number) => {
    if (!animated) {
      displayValue = end;
      return;
    }

    const startTime = Date.now();
    const difference = end - start;

    const updateValue = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      displayValue = start + (difference * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        displayValue = end;
      }
    };

    requestAnimationFrame(updateValue);
  };

  $effect(() => {
    if (target !== previousTarget) {
      animateValue(displayValue, target, duration);
      previousTarget = target;
    }
  });

  onMount(() => {
    if (target !== value) {
      animateValue(value, target, duration);
    }
  });

  const baseClasses = [
    sizeClasses[size],
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');
</script>

{#if variant === 'mini-stat'}
  <div class="mini-stat {className}">
    <div class="mini-stat-value">
      {prefix}{formatValue(displayValue)}{suffix}
    </div>
    {#if label}
      <div class="mini-stat-label">{label}</div>
    {/if}
  </div>
{:else if variant === 'score'}
  <div class="score-display {className}">
    <div class="score-value">
      {prefix}{formatValue(displayValue)}{suffix}
    </div>
    {#if label}
      <div class="score-label">{label}</div>
    {/if}
  </div>
{:else}
  <div class="counter-container {className}">
    <div class={baseClasses}>
      {prefix}{formatValue(displayValue)}{suffix}
    </div>
    {#if label}
      <div class="font-ui-secondary text-gpb-gray-600 mt-1">{label}</div>
    {/if}
  </div>
{/if}

<style>
  .counter-container {
    text-align: center;
  }
</style>
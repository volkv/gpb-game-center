<script lang="ts">
  import Bubble from './Bubble.svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from '../../types/Icon';

  interface Props {
    value?: number;
    max?: number;
    variant?: 'linear' | 'circular' | 'bubble';
    size?: 'sm' | 'md' | 'lg';
    color?: 'violet' | 'mint' | 'raspberry' | 'melissa' | 'sakura' | 'henbane' | 'primary';
    showLabel?: boolean;
    showPercentage?: boolean;
    label?: string;
    animated?: boolean;
    glowing?: boolean;
    resource?: 'coins' | 'crystals' | 'energy' | 'experience';
    class?: string;
  }

  let {
    value = 0,
    max = 100,
    variant = 'linear',
    size = 'md',
    color = 'violet',
    showLabel = false,
    showPercentage = false,
    label,
    animated = true,
    glowing = false,
    resource,
    class: className = ''
  }: Props = $props();

  const percentage = $derived(Math.min((value / max) * 100, 100));
  const circumference = $derived(variant === 'circular' ? 2 * Math.PI * 45 : 0);
  const strokeDasharray = $derived(variant === 'circular' ? circumference : 0);
  const strokeDashoffset = $derived(variant === 'circular' ? circumference - (percentage / 100) * circumference : 0);

  const sizeClasses = {
    linear: {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    },
    circular: {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20'
    }
  };

  const progressColors = {
    violet: { bg: 'bg-violet', stroke: 'stroke-violet', glow: 'glow-violet' },
    mint: { bg: 'bg-mint', stroke: 'stroke-mint', glow: 'glow-mint' },
    raspberry: { bg: 'bg-raspberry', stroke: 'stroke-raspberry', glow: 'glow-violet' },
    melissa: { bg: 'bg-melissa', stroke: 'stroke-melissa', glow: 'glow-mint' },
    sakura: { bg: 'bg-sakura', stroke: 'stroke-sakura', glow: 'glow-violet' },
    henbane: { bg: 'bg-henbane', stroke: 'stroke-henbane', glow: '' },
    primary: { bg: 'bg-violet', stroke: 'stroke-violet', glow: 'glow-violet' }
  };

  const getProgressColor = (colorKey: string) => {
    return progressColors[colorKey as keyof typeof progressColors] || progressColors.violet;
  };

  const resourceIcons = {
    coins: 'coin' as IconName,
    crystals: 'crystal' as IconName,
    energy: 'energy' as IconName,
    experience: 'experience' as IconName
  };

  const resourceColors = {
    coins: 'mint',
    crystals: 'raspberry',
    energy: 'violet',
    experience: 'melissa'
  } as const;
</script>

{#if variant === 'bubble'}
  <Bubble
    color={resource ? resourceColors[resource] : 'violet'}
    size={size}
    class="progress-bubble {glowing ? 'animate-glow-violet' : ''} {className}"
  >
    {#if resource && resourceIcons[resource]}
      <Icon name={resourceIcons[resource]} size="sm" />
    {/if}
    <span class="text-body-sm font-heading">
      {value.toLocaleString()}
      {showPercentage ? ` (${Math.round(percentage)}%)` : ''}
      {max !== 100 ? ` / ${max.toLocaleString()}` : ''}
    </span>
    {#if showLabel && label}
      <span class="text-body-xs opacity-80">{label}</span>
    {/if}
  </Bubble>

{:else if variant === 'linear'}
  <div class="progress-container {className}">
    {#if showLabel && label}
      <div class="progress-header">
        <span class="progress-label text-body font-heading">{label}</span>
        {#if showPercentage}
          <span class="progress-percentage text-body-sm">{Math.round(percentage)}%</span>
        {/if}
      </div>
    {:else if showPercentage}
      <div class="progress-header-minimal">
        <span class="progress-percentage text-body-sm">{Math.round(percentage)}%</span>
      </div>
    {/if}

    <div class="progress-track {sizeClasses.linear[size]}">
      <div
        class="progress-fill {getProgressColor(color).bg} {animated ? 'progress-animated' : ''} {glowing ? getProgressColor(color).glow : ''}"
        style="width: {percentage}%"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {#if glowing}
          <div class="progress-shimmer"></div>
        {/if}
      </div>
    </div>
  </div>

{:else if variant === 'circular'}
  <div class="circular-progress {sizeClasses.circular[size]} {glowing ? getProgressColor(color).glow : ''}">
    <svg class="progress-circle" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        stroke-width="8"
        fill="transparent"
        class="progress-track-circle text-henbane-30"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        stroke-width="8"
        fill="transparent"
        stroke-dasharray={strokeDasharray}
        stroke-dashoffset={strokeDashoffset}
        stroke-linecap="round"
        class="progress-fill-circle {getProgressColor(color).stroke} {animated ? 'progress-circle-animated' : ''}"
      />
    </svg>

    <div class="progress-center">
      {#if resource && resourceIcons[resource]}
        <Icon name={resourceIcons[resource]} size="sm" color="var(--color-{resourceColors[resource]})" />
      {/if}
      {#if showPercentage}
        <span class="progress-value text-body font-heading text-black">
          {Math.round(percentage)}%
        </span>
      {:else if showLabel && label}
        <span class="progress-label-center text-body-xs font-heading text-center text-black">
          {label}
        </span>
      {/if}
    </div>
  </div>
{/if}

<style>
  @reference "../../../../app.css";

  .progress-container {
    @apply w-full space-y-2;
  }

  .progress-header {
    @apply flex justify-between items-center;
  }

  .progress-header-minimal {
    @apply flex justify-end;
  }

  .progress-label {
    @apply text-black;
  }

  .progress-percentage {
    @apply text-henbane;
  }

  .progress-track {
    @apply w-full bg-lily-50 rounded-[var(--radius-lg)] overflow-hidden;
    @apply border border-henbane-20;
  }

  .progress-fill {
    @apply h-full transition-all duration-[var(--duration-slow)] ease-out;
    @apply relative overflow-hidden;
  }

  .progress-animated {
    @apply animate-pulse;
  }

  .progress-shimmer {
    @apply absolute inset-0 opacity-30;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
  }

  .circular-progress {
    @apply relative inline-flex items-center justify-center;
    @apply bg-lily-50 rounded-full;
    @apply border-2 border-henbane-20;
  }

  .progress-circle {
    @apply w-full h-full transform -rotate-90;
  }

  .progress-track-circle {
    @apply opacity-30;
  }

  .progress-fill-circle {
    @apply transition-all duration-[var(--duration-slow)] ease-out;
  }

  .progress-circle-animated {
    animation: progress-rotate 2s linear infinite;
  }

  .progress-center {
    @apply absolute inset-0 flex flex-col items-center justify-center space-y-1;
  }

  .progress-value {
    @apply leading-none;
  }

  .progress-label-center {
    @apply leading-tight px-2;
  }

  .progress-bubble {
    @apply transition-all duration-[var(--duration-fast)];
  }

  @keyframes progress-rotate {
    from {
      transform: rotate(-90deg);
    }
    to {
      transform: rotate(270deg);
    }
  }
</style>
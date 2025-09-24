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
  <div class="fincity-progress-container {className}">
    {#if showLabel && label}
      <div class="fincity-progress-header">
        <span class="fincity-progress-label text-body font-heading">{label}</span>
        {#if showPercentage}
          <span class="fincity-progress-percentage text-body-sm">{Math.round(percentage)}%</span>
        {/if}
      </div>
    {:else if showPercentage}
      <div class="fincity-progress-header-minimal">
        <span class="fincity-progress-percentage text-body-sm">{Math.round(percentage)}%</span>
      </div>
    {/if}

    <div class="fincity-progress-track {sizeClasses.linear[size]}">
      <div
        class="fincity-progress-fill {getProgressColor(color).bg} {animated ? 'fincity-progress-animated' : ''} {glowing ? getProgressColor(color).glow : ''}"
        style="width: {percentage}%"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {#if glowing}
          <div class="fincity-progress-shimmer"></div>
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


<script lang="ts">
  import Bubble from './Bubble.svelte';
  import { Coins, Gem, Battery, Star } from 'lucide-svelte';

  interface Props {
    value?: number;
    max?: number;
    variant?: 'linear' | 'circular' | 'bubble';
    size?: 'sm' | 'md' | 'lg';
    color?: 'violet' | 'mint' | 'raspberry' | 'emerald' | 'raspberry-light' | 'henbane' | 'primary';
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
    violet: { bg: 'bg-gpb-violet', stroke: 'stroke-gpb-violet', glow: 'neon-glow' },
    mint: { bg: 'bg-gpb-mint', stroke: 'stroke-gpb-mint', glow: 'neon-glow' },
    raspberry: { bg: 'bg-gpb-raspberry', stroke: 'stroke-gpb-raspberry', glow: 'neon-glow' },
    emerald: { bg: 'bg-gpb-emerald', stroke: 'stroke-gpb-emerald', glow: 'neon-glow' },
    'raspberry-light': { bg: 'bg-gpb-raspberry-light', stroke: 'stroke-gpb-raspberry-light', glow: 'neon-glow' },
    henbane: { bg: 'bg-gpb-gray-600', stroke: 'stroke-gpb-gray-600', glow: '' },
    primary: { bg: 'bg-gpb-violet', stroke: 'stroke-gpb-violet', glow: 'neon-glow' },
    electric: { bg: 'gradient-electric', stroke: 'stroke-gpb-violet', glow: 'neon-glow' },
    power: { bg: 'gradient-power', stroke: 'stroke-gpb-raspberry', glow: 'neon-glow' },
    wealth: { bg: 'gradient-wealth', stroke: 'stroke-gpb-gold', glow: 'neon-glow' },
    mystery: { bg: 'gradient-mystery', stroke: 'stroke-gpb-purple', glow: 'neon-glow' }
  };

  const getProgressColor = (colorKey: string) => {
    return progressColors[colorKey as keyof typeof progressColors] || progressColors.violet;
  };

  const resourceIcons = {
    coins: Coins,
    crystals: Gem,
    energy: Battery,
    experience: Star
  };

  const resourceColors = {
    coins: 'emerald',
    crystals: 'raspberry',
    energy: 'violet',
    experience: 'mint'
  } as const;
</script>

{#if variant === 'bubble'}
  <Bubble
    color={resource ? resourceColors[resource] : 'violet'}
    size={size}
    class="progress-bubble {glowing ? 'animate-glow-violet' : ''} {className}"
  >
    {#if resource && resourceIcons[resource]}
      {@const IconComponent = resourceIcons[resource]}
      <IconComponent size={16} class="neon-glow" />
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
  <div class="progress-bar-container {className}">
    {#if showLabel && label}
      <div class="progress-header flex justify-between items-center mb-2">
        <span class="font-ui-primary">{label}</span>
        {#if showPercentage}
          <span class="font-ui-secondary text-sm">{Math.round(percentage)}%</span>
        {/if}
      </div>
    {:else if showPercentage}
      <div class="progress-header-minimal flex justify-end mb-2">
        <span class="font-ui-secondary text-sm">{Math.round(percentage)}%</span>
      </div>
    {/if}

    <div class="progress-bar {sizeClasses.linear[size]} bg-black/20 rounded-full overflow-hidden">
      <div
        class="progress-fill h-full {getProgressColor(color).bg} rounded-full transition-all duration-1000 ease-out relative overflow-hidden {animated ? 'animate-pulse' : ''} {glowing ? getProgressColor(color).glow : ''}"
        style="width: {percentage}%"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {#if glowing}
          <div class="progress-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
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

    <div class="progress-center absolute inset-0 flex items-center justify-center flex-col">
      {#if resource && resourceIcons[resource]}
        {@const IconComponent = resourceIcons[resource]}
        <IconComponent size={20} class="text-gpb-violet neon-glow mb-1" />
      {/if}
      {#if showPercentage}
        <span class="font-score text-lg text-black">
          {Math.round(percentage)}%
        </span>
      {:else if showLabel && label}
        <span class="font-ui-secondary text-xs text-center text-black">
          {label}
        </span>
      {/if}
    </div>
  </div>
{/if}


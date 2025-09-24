<script lang="ts">
  interface Props {
    value?: number;
    max?: number;
    variant?: 'linear' | 'circular';
    size?: 'sm' | 'md' | 'lg';
    color?: 'electric' | 'power' | 'wealth' | 'mystery';
    showLabel?: boolean;
    showPercentage?: boolean;
    label?: string;
    animated?: boolean;
    shimmer?: boolean;
    class?: string;
  }

  let {
    value = 0,
    max = 100,
    variant = 'linear',
    size = 'md',
    color = 'electric',
    showLabel = false,
    showPercentage = false,
    label = '',
    animated = true,
    shimmer = true,
    class: className = ''
  }: Props = $props();

  const percentage = $derived(Math.min((value / max) * 100, 100));
  const circumference = $derived(variant === 'circular' ? 2 * Math.PI * 45 : 0);
  const strokeDasharray = $derived(variant === 'circular' ? circumference : 0);
  const strokeDashoffset = $derived(variant === 'circular' ? circumference - (percentage / 100) * circumference : 0);

  const sizeClasses = {
    linear: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    },
    circular: {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20'
    }
  };

  const colorClasses = {
    electric: 'gradient-electric',
    power: 'gradient-power',
    wealth: 'gradient-wealth',
    mystery: 'gradient-mystery'
  };
</script>

{#if variant === 'linear'}
  <div class="progress-container {className}">
    {#if showLabel && label}
      <div class="flex items-center justify-between mb-2">
        <span class="font-ui-primary text-gpb-gray-700">{label}</span>
        {#if showPercentage}
          <span class="font-ui-secondary text-gpb-gray-500">{Math.round(percentage)}%</span>
        {/if}
      </div>
    {:else if showPercentage}
      <div class="flex justify-end mb-2">
        <span class="font-ui-secondary text-gpb-gray-500">{Math.round(percentage)}%</span>
      </div>
    {/if}

    <div class="progress-bar {sizeClasses.linear[size]}">
      <div
        class="progress-fill {animated ? 'animate-shimmer' : ''}"
        style="width: {percentage}%; background: linear-gradient(135deg, {color === 'electric' ? '#1919EF 0%, #58FFFF 100%' :
               color === 'power' ? '#DD41DB 0%, #FF8C42 100%' :
               color === 'wealth' ? '#FFD700 0%, #50C878 100%' :
               '#9B59B6 0%, #1919EF 100%'})"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress ${Math.round(percentage)}%`}
      >
        {#if shimmer}
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        {/if}
      </div>
    </div>
  </div>

{:else if variant === 'circular'}
  <div class="circular-progress {sizeClasses.circular[size]} {className}">
    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        stroke-width="8"
        fill="transparent"
        class="text-gpb-gray-200"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#{color}-gradient)"
        stroke-width="8"
        fill="transparent"
        stroke-dasharray={strokeDasharray}
        stroke-dashoffset={strokeDashoffset}
        stroke-linecap="round"
        class={animated ? 'transition-all duration-1000 ease-out' : ''}
      />
    </svg>

    <div class="absolute inset-0 flex items-center justify-center">
      {#if showPercentage}
        <span class="font-score text-gpb-gray-800 text-sm">
          {Math.round(percentage)}%
        </span>
      {:else if showLabel && label}
        <span class="font-ui-caption text-center text-gpb-gray-600 max-w-8">
          {label}
        </span>
      {/if}
    </div>

    <defs>
      <linearGradient id="{color}-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        {#if color === 'electric'}
          <stop offset="0%" stop-color="#1919EF"/>
          <stop offset="100%" stop-color="#58FFFF"/>
        {:else if color === 'power'}
          <stop offset="0%" stop-color="#DD41DB"/>
          <stop offset="100%" stop-color="#FF8C42"/>
        {:else if color === 'wealth'}
          <stop offset="0%" stop-color="#FFD700"/>
          <stop offset="100%" stop-color="#50C878"/>
        {:else}
          <stop offset="0%" stop-color="#9B59B6"/>
          <stop offset="100%" stop-color="#1919EF"/>
        {/if}
      </linearGradient>
    </defs>
  </div>
{/if}
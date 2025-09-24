<script lang="ts">
  import { Lock, Flame, Crown, Sparkles } from 'lucide-svelte';

  interface Props {
    variant?: 'new' | 'hot' | 'locked' | 'pro' | 'online' | 'offline';
    size?: 'sm' | 'md' | 'lg';
    icon?: boolean;
    children?: any;
    class?: string;
  }

  let {
    variant = 'new',
    size = 'md',
    icon = false,
    children,
    class: className = ''
  }: Props = $props();

  const variantClasses = {
    new: 'badge-new',
    hot: 'badge-hot',
    locked: 'badge-locked',
    pro: 'badge-pro',
    online: 'status-online',
    offline: 'status-offline'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const getIcon = (variant: string) => {
    switch (variant) {
      case 'locked':
        return Lock;
      case 'hot':
        return Flame;
      case 'pro':
        return Crown;
      case 'new':
        return Sparkles;
      default:
        return null;
    }
  };

  const IconComponent = getIcon(variant);
  const baseClasses = variantClasses[variant];
  const classes = [baseClasses, sizeClasses[size], className].filter(Boolean).join(' ');
</script>

{#if variant === 'online' || variant === 'offline'}
  <div
    class={`${baseClasses} ${className}`}
    role="status"
    aria-label={variant === 'online' ? 'В сети' : 'Не в сети'}
    title={variant === 'online' ? 'В сети' : 'Не в сети'}
  ></div>
{:else}
  <span
    class={classes}
    role="status"
    aria-label="Статус игры"
  >
    {#if icon && IconComponent}
      <IconComponent size={iconSizes[size]} class="inline-block" />
      {#if children}
        <span class="ml-1">
          {@render children?.()}
        </span>
      {/if}
    {:else}
      {@render children?.()}
    {/if}
  </span>
{/if}
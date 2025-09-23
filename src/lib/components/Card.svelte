<script lang="ts">
  interface Props {
    gradient?: boolean;
    gradientType?: 'violet-cumin' | 'raspberry-sakura' | 'mint-melissa' | 'raspberry-violet' | 'mint-violet' | 'black-cumin';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children?: any;
    class?: string;
  }

  let {
    gradient = false,
    gradientType = 'violet-cumin',
    padding = 'md',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const baseClass = 'card';
  const gradientClass = gradient ? 'card-gradient' : '';
  const paddingClass = padding !== 'none' ? `p-${padding === 'sm' ? '3' : padding === 'md' ? '4' : '6'}` : '';

  const classes = [baseClass, gradientClass, paddingClass, className].filter(Boolean).join(' ');

  const gradientStyle = gradient && gradientType !== 'violet-cumin'
    ? `gradient-${gradientType}`
    : '';
</script>

<div
  class={classes}
  class:gradient-mint-melissa={gradientType === 'mint-melissa' && gradient}
  class:gradient-raspberry-sakura={gradientType === 'raspberry-sakura' && gradient}
  class:gradient-raspberry-violet={gradientType === 'raspberry-violet' && gradient}
  class:gradient-mint-violet={gradientType === 'mint-violet' && gradient}
  class:gradient-black-cumin={gradientType === 'black-cumin' && gradient}
  {...restProps}
>
  {@render children?.()}
</div>
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    backgroundImage: string;
    onComplete: () => void;
  }

  let { backgroundImage, onComplete }: Props = $props();

  onMount(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  });
</script>

<div class="final-scene-display" style="background-image: url({backgroundImage})" transition:fade={{ duration: 500 }} role="img" aria-label="Финальная сцена истории">
  <div class="overlay" aria-hidden="true"></div>
</div>

<style>
  .final-scene-display {
    position: fixed;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: var(--color-neutral-900);
    z-index: 100;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
      rgba(5, 7, 19, 0.2) 0%,
      rgba(5, 7, 19, 0.4) 100%
    );
  }
</style>
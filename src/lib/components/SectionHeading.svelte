<script lang="ts">
  interface Props {
    eyebrow?: string;
    title: string;
    id?: string;
    action?: any;
  }
  let { eyebrow, title, id, action }: Props = $props();
</script>

<div class="section-heading">
  {#if eyebrow}
    <p class="section-heading__eyebrow">{eyebrow}</p>
  {/if}
  <div class="section-heading__title-row">
    <h2 class="section-heading__title" {id}>{title}</h2>
    {#if action}
      {@render action()}
    {/if}
  </div>
</div>

<style>
  .section-heading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-heading__eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
    margin: 0;
  }

  .section-heading__title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  .section-heading__title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-fg-primary);
    margin: 0;
    letter-spacing: -0.01em;
  }
</style>
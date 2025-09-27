<script lang="ts">
  import { Maximize2 } from 'lucide-svelte';
  import { Modal } from '$lib';

  type EvidenceType = 'sms' | 'call' | 'website' | 'atm' | 'app' | 'social';

  interface EvidenceBase {
    caption?: string;
    ariaLabel?: string;
  }

  export interface SmsEvidence extends EvidenceBase {
    type: 'sms';
    sender: string;
    timestamp: string;
    message: string[];
    link?: string;
  }

  export interface CallEvidence extends EvidenceBase {
    type: 'call';
    caller: string;
    phone: string;
    riskNote: string;
    script: string[];
  }

  export interface WebsiteEvidence extends EvidenceBase {
    type: 'website';
    url: string;
    isSecure: boolean;
    title: string;
    prompts: string[];
    warning: string;
  }

  export interface AtmEvidence extends EvidenceBase {
    type: 'atm';
    location: string;
    anomalies: string[];
    status: string;
  }

  export interface AppEvidence extends EvidenceBase {
    type: 'app';
    title: string;
    prompt: string;
    actions: string[];
    warning: string;
  }

  export interface SocialEvidence extends EvidenceBase {
    type: 'social';
    contact: string;
    platform: string;
    messages: Array<{ fromBank?: boolean; text: string; highlight?: boolean }>;
  }

  export type QuestionEvidence =
    | SmsEvidence
    | CallEvidence
    | WebsiteEvidence
    | AtmEvidence
    | AppEvidence
    | SocialEvidence;

  interface Props {
    evidence: QuestionEvidence;
  }

  let { evidence }: Props = $props();
  let isModalOpen = $state(false);

  const typeLabels: Record<EvidenceType, string> = {
    sms: 'Подозрительное SMS',
    call: 'Подозрительный звонок',
    website: 'Сомнительный сайт',
    atm: 'Рискованный банкомат',
    app: 'Фальшивое окно',
    social: 'Социальная инженерия'
  };

  const ariaDescription = $derived(() => evidence.ariaLabel ?? typeLabels[evidence.type]);

  function openModal() {
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }
</script>

{#snippet RenderEvidence({ variant }: { variant: 'preview' | 'modal' })}
  <div
    class={`evidence-frame evidence-frame--${variant} evidence-frame--${evidence.type}`}
    role="img"
    aria-label={ariaDescription}
  >
    {#if evidence.type === 'sms'}
      <div class="sms-shell">
        <header class="sms-header">
          <span class="sms-header__title">{evidence.sender}</span>
          <span class="sms-header__time">{evidence.timestamp}</span>
        </header>
        <div class="sms-body">
          {#each evidence.message as line}
            <p class="sms-text">{line}</p>
          {/each}
          {#if evidence.link}
            <span class="sms-link">{evidence.link}</span>
          {/if}
        </div>
      </div>
    {:else if evidence.type === 'call'}
      <div class="call-shell">
        <header class="call-header">
          <span class="call-caller">{evidence.caller}</span>
          <span class="call-phone">{evidence.phone}</span>
        </header>
        <div class="call-body">
          <span class="call-warning">{evidence.riskNote}</span>
          <ul class="call-script">
            {#each evidence.script as line}
              <li>{line}</li>
            {/each}
          </ul>
        </div>
      </div>
    {:else if evidence.type === 'website'}
      <div class="web-shell">
        <header class="web-header">
          <span class={`web-lock ${evidence.isSecure ? 'secure' : 'danger'}`}></span>
          <span class="web-url">{evidence.url}</span>
        </header>
        <div class="web-body">
          <h3 class="web-title">{evidence.title}</h3>
          <ul class="web-prompts">
            {#each evidence.prompts as line}
              <li>{line}</li>
            {/each}
          </ul>
          <p class="web-warning">{evidence.warning}</p>
        </div>
      </div>
    {:else if evidence.type === 'atm'}
      <div class="atm-shell">
        <header class="atm-header">
          <span class="atm-location">{evidence.location}</span>
          <span class="atm-status">{evidence.status}</span>
        </header>
        <ul class="atm-anomalies">
          {#each evidence.anomalies as anomaly}
            <li>{anomaly}</li>
          {/each}
        </ul>
      </div>
    {:else if evidence.type === 'app'}
      <div class="app-shell">
        <header class="app-header">
          <span class="app-title">{evidence.title}</span>
        </header>
        <p class="app-prompt">{evidence.prompt}</p>
        <div class="app-actions">
          {#each evidence.actions as action}
            <span class="app-action">{action}</span>
          {/each}
        </div>
        <p class="app-warning">{evidence.warning}</p>
      </div>
    {:else if evidence.type === 'social'}
      <div class="chat-shell">
        <header class="chat-header">
          <span class="chat-platform">{evidence.platform}</span>
          <span class="chat-contact">{evidence.contact}</span>
        </header>
        <div class="chat-body">
          {#each evidence.messages as message}
            <div class={`chat-bubble ${message.fromBank ? 'from-bank' : 'from-attacker'} ${message.highlight ? 'highlight' : ''}`}>
              <p>{message.text}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/snippet}

<div class="evidence-preview">
  <div class="evidence-preview__header">
    <span class="evidence-preview__label">{typeLabels[evidence.type]}</span>
    <button
      type="button"
      class="evidence-preview__zoom"
      onclick={() => openModal()}
      aria-label="Открыть скриншот в увеличении"
    >
      <Maximize2 size={16} aria-hidden="true" />
    </button>
  </div>

  <button type="button" class="evidence-preview__card" onclick={() => openModal()} aria-label={ariaDescription}>
    {@render RenderEvidence({ variant: 'preview' })}
  </button>

  {#if evidence.caption}
    <p class="evidence-preview__caption">{evidence.caption}</p>
  {/if}
</div>

<Modal open={isModalOpen} size="lg" onClose={closeModal}>
  {#snippet children()}
    <div class="evidence-modal">
      {@render RenderEvidence({ variant: 'modal' })}
      {#if evidence.caption}
        <p class="evidence-modal__caption">{evidence.caption}</p>
      {/if}
    </div>
  {/snippet}
</Modal>

<style>
  .evidence-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .evidence-preview__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .evidence-preview__label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-fg-muted);
  }

  .evidence-preview__zoom {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    background: var(--color-surface-muted);
    color: var(--color-fg-muted);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: border-color 150ms ease, color 150ms ease, background-color 150ms ease;
  }

  .evidence-preview__zoom:hover {
    border-color: var(--color-border-muted);
    color: var(--color-brand-600);
    background: var(--layer-brand-050);
  }

  .evidence-preview__card {
    border: 1px solid var(--color-border-muted);
    border-radius: var(--radius-xl);
    background: var(--color-surface-muted);
    padding: 0.85rem;
    cursor: pointer;
    transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    width: 100%;
  }

  .evidence-preview__card:hover {
    border-color: var(--color-brand-500);
    box-shadow: var(--shadow-soft);
    transform: translateY(-1px);
  }

  .evidence-preview__card:focus-visible {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: var(--shadow-focus);
  }

  .evidence-preview__caption {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-fg-muted);
  }

  .evidence-frame {
    border-radius: var(--radius-lg);
    background: var(--color-surface-card);
    border: 1px solid var(--color-border-subtle);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .evidence-frame--preview {
    gap: 0.5rem;
  }

  .evidence-frame--modal {
    padding: 1rem;
    gap: 1rem;
  }

  .sms-shell {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: linear-gradient(135deg, var(--layer-brand-080) 0%, rgba(31, 196, 217, 0.08) 100%);
    border-radius: var(--radius-lg);
    padding: 0.75rem;
  }

  .sms-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--color-fg-secondary);
  }

  .sms-header__title {
    font-weight: 600;
  }

  .sms-header__time {
    font-variant-numeric: tabular-nums;
  }

  .sms-body {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    background: rgba(255, 255, 255, 0.65);
    border-radius: var(--radius-md);
    padding: 0.75rem;
    color: var(--color-neutral-700);
  }

  .sms-text {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.35;
  }

  .sms-link {
    font-size: 0.85rem;
    color: var(--color-state-danger);
    font-weight: 600;
  }

  .call-shell {
    background: linear-gradient(135deg, rgba(209, 60, 106, 0.15) 0%, rgba(255, 118, 173, 0.1) 100%);
    border-radius: var(--radius-lg);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .call-header {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    color: var(--color-neutral-700);
  }

  .call-caller {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .call-phone {
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
  }

  .call-body {
    background: rgba(255, 255, 255, 0.65);
    border-radius: var(--radius-md);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .call-warning {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--color-state-danger);
    letter-spacing: 0.08em;
    font-weight: 600;
  }

  .call-script {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: var(--color-neutral-700);
  }

  .web-shell {
    background: var(--color-surface-base);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-muted);
    overflow: hidden;
  }

  .web-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-surface-muted);
    font-size: 0.8rem;
    color: var(--color-neutral-700);
  }

  .web-lock {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-state-danger);
    position: relative;
  }

  .web-lock.secure {
    background: var(--color-state-success);
  }

  .web-body {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .web-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-neutral-700);
  }

  .web-prompts {
    margin: 0;
    padding-left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: var(--color-neutral-700);
  }

  .web-warning {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-state-danger);
    font-weight: 600;
  }

  .atm-shell {
    background: linear-gradient(140deg, rgba(15, 19, 213, 0.08) 0%, rgba(31, 196, 217, 0.08) 100%);
    border-radius: var(--radius-lg);
    padding: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .atm-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    text-transform: uppercase;
    color: var(--color-neutral-700);
  }

  .atm-status {
    color: var(--color-state-danger);
    font-weight: 600;
  }

  .atm-anomalies {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: var(--color-neutral-700);
  }

  .app-shell {
    background: linear-gradient(135deg, rgba(17, 23, 76, 0.92) 0%, rgba(25, 25, 239, 0.82) 60%, rgba(31, 196, 217, 0.35) 100%);
    border-radius: var(--radius-lg);
    color: var(--color-fg-on-brand);
    padding: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .app-header {
    display: flex;
    justify-content: center;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .app-prompt {
    margin: 0;
    font-size: 0.85rem;
    text-align: center;
  }

  .app-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .app-action {
    background: rgba(255, 255, 255, 0.18);
    border-radius: var(--radius-lg);
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
  }

  .app-warning {
    margin: 0;
    font-size: 0.8rem;
    text-align: center;
    color: rgba(255, 214, 107, 0.92);
    font-weight: 600;
  }

  .chat-shell {
    background: var(--color-surface-muted);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-border-subtle);
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0.75rem;
    background: var(--color-surface-card);
    font-size: 0.8rem;
    color: var(--color-neutral-700);
  }

  .chat-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .chat-bubble {
    border-radius: var(--radius-lg);
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    max-width: 90%;
  }

  .chat-bubble.from-bank {
    align-self: flex-end;
    background: rgba(25, 25, 239, 0.1);
    color: var(--color-brand-700);
  }

  .chat-bubble.from-attacker {
    align-self: flex-start;
    background: rgba(209, 60, 106, 0.12);
    color: var(--color-neutral-700);
    border: 1px solid rgba(209, 60, 106, 0.35);
  }

  .chat-bubble.highlight {
    border-color: var(--color-state-danger);
    box-shadow: 0 0 0 1px rgba(209, 60, 106, 0.35);
  }

  .evidence-modal {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .evidence-modal__caption {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-fg-secondary);
  }

  @media (max-width: 480px) {
    .evidence-preview__card {
      padding: 0.75rem;
    }

    .evidence-frame--modal {
      padding: 0.75rem;
      gap: 0.75rem;
    }
  }
</style>

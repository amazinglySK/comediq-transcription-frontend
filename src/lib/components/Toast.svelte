<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toastStore, type Toast as ToastType } from '$lib/stores/toastStore';
  import { onDestroy } from 'svelte';

  // Proper Svelte 5 store subscription
  let toasts = $state<ToastType[]>([]);
  
  const unsubscribe = toastStore.subscribe(value => {
    toasts = value;
  });

  onDestroy(unsubscribe);
</script>

<div class="toast toast-end">
  {#each toasts as toast (toast.id)}
    <div
      out:fade={{ duration: 300 }}
      class="alert cursor-pointer min-w-80 w-80"
      class:alert-success={toast.type === 'success'}
      class:alert-error={toast.type === 'error'} 
      class:alert-warning={toast.type === 'warning'}
      class:alert-info={toast.type === 'info'}
      onclick={() => toastStore.remove(toast.id)}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && toastStore.remove(toast.id)}
    >
      <div class="flex items-center gap-2">
        {#if toast.type === 'success'}
          <span class="material-icons text-sm">check_circle</span>
        {:else if toast.type === 'error'}
          <span class="material-icons text-sm">error</span>
        {:else if toast.type === 'warning'}
          <span class="material-icons text-sm">warning</span>
        {:else if toast.type === 'info'}
          <span class="material-icons text-sm">info</span>
        {/if}
        <span>{toast.message}</span>
      </div>
    </div>
  {/each}
</div>
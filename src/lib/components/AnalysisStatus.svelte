<script lang="ts">
  interface Props {
    analyzing: boolean;
    error?: string | null;
  }

  let { analyzing, error = null }: Props = $props();
</script>

<!-- Analysis Progress -->
{#if analyzing}
  <div class="alert alert-info mb-4">
    <span class="loading loading-spinner loading-md"></span>
    <span>Analyzing your comedy performance... This may take a few moments.</span>
  </div>
{/if}

<!-- Analysis Error -->
{#if error}
  <div class="alert alert-error mb-4">
    <span>Analysis Error: {error}</span>
  </div>
{/if}
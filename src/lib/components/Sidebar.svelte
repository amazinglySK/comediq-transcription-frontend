<script lang="ts">
  import type { AnalysisHistoryItem } from '$lib/stores/analysisHistoryStore';

  interface Props {
    history: AnalysisHistoryItem[];
    currentAnalysis: AnalysisHistoryItem | null;
    onHistoryItemClick: (item: AnalysisHistoryItem) => void;
  }

  let { history, currentAnalysis, onHistoryItemClick }: Props = $props();
</script>

<div class="drawer-side">
  <label for="my-drawer-1" aria-label="close sidebar" class="drawer-overlay"></label>
  <aside class="bg-base-200 min-h-full w-80">
    <!-- Sidebar Header -->
    <div class="p-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <span class="material-icons">history</span>
        Analysis History
      </h2>
    </div>
    
    <!-- Analysis History -->
    <div class="flex-1 overflow-y-auto">
      {#if history.length > 0}
        <div class="p-4 space-y-2">
          {#each history as item}
            <button 
              class="w-full text-left p-3 rounded-lg hover:bg-base-300 transition-colors"
              class:bg-base-300={currentAnalysis?.id === item.id}
              onclick={() => onHistoryItemClick(item)}
            >
              <div class="font-medium text-sm truncate">{item.filename}</div>
              <div class="text-xs text-base-content/60 truncate">{item.summary || ''}</div>
              <div class="text-xs text-base-content/40 mt-1">
                {new Date(item.timestamp).toLocaleDateString()}
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <div class="p-4 text-center text-base-content/60">
          <span class="material-icons text-4xl mb-2 block">history</span>
          <p class="text-sm">No previous analyses yet</p>
        </div>
      {/if}
    </div>
  </aside>
</div>
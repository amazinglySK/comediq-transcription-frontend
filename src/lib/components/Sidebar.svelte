<script lang="ts">
  import { analysisHistory, type AnalysisHistoryItem } from '$lib/stores/analysisHistoryStore';

  interface Props {
    history: AnalysisHistoryItem[];
    currentAnalysis: AnalysisHistoryItem | null;
    onHistoryItemClick: (item: AnalysisHistoryItem) => void;
  }

  let { history, currentAnalysis, onHistoryItemClick }: Props = $props();

  function handleDelete(id: string) {
    analysisHistory.removeAnalysis(id);
  }

  function handleClearAll() {
    // confirm with user before clearing
    if (confirm('Clear all analysis history? This cannot be undone.')) {
      analysisHistory.clearHistory();
    }
  }
</script>

<div class="drawer-side">
  <label for="my-drawer-1" aria-label="close sidebar" class="drawer-overlay"></label>
  <aside class="bg-base-200 min-h-full w-80 flex flex-col">
    <!-- Sidebar Header -->
    <div class="p-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <span class="material-icons">history</span>
        Analysis History
      </h2>
      {#if history.length > 0}
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          title="Clear history"
          onclick={handleClearAll}
        >
          Clear All
        </button>
      {/if}
    </div>
    
    <!-- Analysis History -->
    <div class="flex-1 overflow-y-auto">
      {#if history.length > 0}
        <div class="p-2 space-y-2">
          {#each history as item}
            <!-- make this a group so delete button appears on hover -->
            <div
              class="group relative w-full rounded-lg transition-colors"
              class:bg-base-300={currentAnalysis?.id === item.id}
            >
              <div
                role="button"
                tabindex="0"
                class="flex flex-col gap-1 cursor-pointer p-3 pr-10 rounded-md transition-colors group-hover:bg-base-300"
                onclick={() => onHistoryItemClick(item)}
                onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); onHistoryItemClick(item); } }}
              >
                <div class="font-medium text-sm truncate">{item.filename}</div>
                <div class="text-xs text-base-content/60 truncate">{item.summary || ''}</div>
                <div class="text-xs text-base-content/40 mt-1">
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>

              <!-- absolutely positioned small delete button, hidden until hover -->
              <button
                type="button"
                class="btn btn-ghost btn-xs absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 hover:text-error hover:shadow-md hover:shadow-error/20"
                aria-label="Delete history item"
                title="Delete"
                onclick={() => handleDelete(item.id)}
              >
                <span class="material-icons text-base">delete</span>
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <div class="p-4 text-center text-base-content/60">
          <span class="material-icons text-4xl mb-2 block">history</span>
          <p class="text-sm">No previous analyses yet</p>
        </div>
      {/if}
    </div>

    <!-- Footer spacer to keep layout consistent -->
    <div class="p-3 border-t border-base-300">
      <div class="text-xs text-base-content/50">Comediq</div>
    </div>
  </aside>
</div>
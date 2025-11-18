<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    title?: string;
    subtitle?: string;
  }

  let { 
    title = "Processing Your Comedy Set", 
    subtitle = "Enjoy this XKCD while we analyze your performance..." 
  }: Props = $props();

  interface Comic {
    num: number;
    title: string;
    alt: string;
    img: string;
    safe_title: string;
  }

  let comic = $state<Comic | null>(null);
  let loading = $state(true);
  let error = $state(false);
  let intervalId: number | null = null;

  async function fetchRandomComic() {
    try {
      loading = true;
      error = false;
      
      // Call our API route to get a random XKCD comic
      const response = await fetch('/api/xkcd');
      const data = await response.json();
      
      if (data.success) {
        comic = data.comic;
      } else {
        throw new Error(data.error || 'Failed to fetch comic');
      }
      
      loading = false;
    } catch (err) {
      console.error('Failed to fetch XKCD comic:', err);
      error = true;
      loading = false;
    }
  }

  onMount(() => {
    // Load first comic immediately
    fetchRandomComic();
    
    // Set up 20-second interval for cycling comics
    intervalId = setInterval(fetchRandomComic, 20000);
  });

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center p-6 bg-base-200">
  <div class="flex flex-col items-center justify-center space-y-6 max-w-4xl w-full">
    <!-- Processing Header -->
    <div class="flex items-center gap-3">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <div class="text-center">
        <h2 class="text-xl font-semibold">{title}</h2>
        <p class="text-base-content/70">{subtitle}</p>
      </div>
    </div>

    <!-- XKCD Comic Display -->
    <div class="card bg-base-100 shadow-xl max-w-2xl w-full">
      <div class="card-body">
        {#if loading}
          <div class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md"></span>
          </div>
        {:else if error}
          <div class="text-center py-8">
            <div class="text-error mb-2">
              <span class="material-icons text-4xl">error_outline</span>
            </div>
            <p class="text-error">Failed to load comic</p>
          </div>
        {:else if comic}
          <div class="text-center space-y-4">
            <!-- Comic Title -->
            <h3 class="text-lg font-semibold">#{comic.num}: {comic.title}</h3>
            
            <!-- Comic Image -->
            <div class="flex justify-center">
              <img 
                src={comic.img} 
                alt={comic.alt}
                title={comic.alt}
                class="max-w-full h-auto rounded-lg shadow-sm"
                style="max-height: 500px;"
              />
            </div>
            
            <!-- Alt Text (hover text) -->
            <div class="text-sm text-base-content/60 italic max-w-lg mx-auto">
              "{comic.alt}"
            </div>
            
            <!-- XKCD Attribution -->
            <div class="text-xs text-base-content/40">
              <a 
                href="https://xkcd.com/{comic.num}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="link link-hover"
              >
                View on xkcd.com
              </a>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Cycling Info -->
    <div class="text-center text-sm text-base-content/50">
      <p>Comics change every 20 seconds</p>
    </div>
  </div>
</div>
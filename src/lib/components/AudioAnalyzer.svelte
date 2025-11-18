<script lang="ts">
  import { enhance } from '$app/forms';
  import { createWavFile } from '$lib/audioUtils';

  interface Props {
    audioUrl: string;
    audioBlob?: Blob | null;
    uploadedFile?: File | null;
    analyzing?: boolean;
    onAnalysisStart?: () => void;
    onAnalysisComplete?: () => void;
  }

  let {
    audioUrl,
    audioBlob = null,
    uploadedFile = null,
    analyzing = false,
    onAnalysisStart,
    onAnalysisComplete
  }: Props = $props();

  let formElement: HTMLFormElement;
  let hiddenFileInput: HTMLInputElement;

  function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!hiddenFileInput || (!audioBlob && !uploadedFile)) {
      console.log('Missing requirements for submit');
      return;
    }

    // Create a DataTransfer object to set files on the input
    const dataTransfer = new DataTransfer();
    
    if (uploadedFile) {
      console.log('Using uploadedFile for form submission');
      const wavFile = createWavFile(uploadedFile, uploadedFile.name);
      dataTransfer.items.add(wavFile);
    } else if (audioBlob) {
      console.log('Using audioBlob for form submission');
      const wavFile = createWavFile(audioBlob, 'recording.wav');
      dataTransfer.items.add(wavFile);
    }
    
    // Set the files on the hidden input
    hiddenFileInput.files = dataTransfer.files;
    
    console.log('Hidden input files:', hiddenFileInput.files);
    console.log('Hidden input file[0]:', hiddenFileInput.files?.[0]);
    
    // Now submit the form
    formElement.requestSubmit();
  }
</script>

<!-- Send button for analysis -->
<form 
  method="POST" 
  action="?/analyze" 
  enctype="multipart/form-data"
  bind:this={formElement} 
  use:enhance={() => {
    analyzing = true;
    onAnalysisStart?.();
    return async ({ update }) => {
      analyzing = false;
      onAnalysisComplete?.();
      await update();
    };
  }}
>
  <!-- Hidden file input to hold the audio file -->
  <input type="file" name="audio" class="hidden" bind:this={hiddenFileInput} />
  
  <div class="tooltip" data-tip={analyzing ? "Analyzing..." : "Analyze comedy"}>
    <button 
      type="submit" 
      class={`btn btn-circle ${analyzing ? 'btn-disabled' : 'btn-primary'}`}
      disabled={analyzing || (!audioBlob && !uploadedFile)}
      onclick={handleSubmit}
    >
      {#if analyzing}
        <span class="loading loading-spinner loading-sm"></span>
      {:else}
        <span class="material-icons">send</span>
      {/if}
    </button>
  </div>
</form>
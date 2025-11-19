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

  function prepareAndSubmitFile(file: File | Blob, filename = 'recording.wav') {
    if (!hiddenFileInput) {
      console.log('Hidden input not ready for submit');
      return;
    }

    // Create a DataTransfer object to set files on the input
    const dataTransfer = new DataTransfer();

    // Ensure we have a File instance
    const wavFile = createWavFile(file, filename);
    dataTransfer.items.add(wavFile);

    // Set the files on the hidden input
    hiddenFileInput.files = dataTransfer.files;

    // Submit the form
    formElement.requestSubmit();
  }

  // Exported helper so parent can programmatically submit a blob/file
  export function submitFile(file: File | Blob, filename?: string) {
    prepareAndSubmitFile(file, filename);
  }

  function handleSubmit(event: Event) {
    event.preventDefault();

    if (!hiddenFileInput || (!audioBlob && !uploadedFile)) {
      console.log('Missing requirements for submit');
      return;
    }

    // Use existing state to submit
    if (uploadedFile) {
      prepareAndSubmitFile(uploadedFile, uploadedFile.name);
    } else if (audioBlob) {
      prepareAndSubmitFile(audioBlob, 'recording.wav');
    }
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
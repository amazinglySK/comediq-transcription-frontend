<script lang="ts">
  import { addToast } from '$lib/stores/toastStore';

  interface Props {
    uploadedFile?: File | null;
    disabled?: boolean;
    onFileSelected?: (data: { file: File; audioUrl: string }) => void;
    onFileClear?: () => void;
  }

  let {
    uploadedFile = null,
    disabled = false,
    onFileSelected,
    onFileClear
  }: Props = $props();

  let fileInputElement = $state<HTMLInputElement>();

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.includes('audio/wav') && !file.name.toLowerCase().endsWith('.wav')) {
        addToast('Please upload a WAV file', 'error');
        return;
      }
      
      const audioUrl = URL.createObjectURL(file);
      onFileSelected?.({ file, audioUrl });
    }
  }

  function clearUpload() {
    if (fileInputElement) {
      fileInputElement.value = '';
    }
    onFileClear?.();
  }
</script>

<!-- Compact file upload for chat input -->
<div class="relative">
  {#if uploadedFile}
    <!-- File selected state -->
    <div class="tooltip" data-tip="Clear file: {uploadedFile.name}">
      <button 
        class="btn btn-circle btn-success"
        onclick={clearUpload}
        aria-label="Clear selected file"
      >
        <span class="material-icons">check</span>
      </button>
    </div>
  {:else}
    <!-- File upload button -->
    <div class="tooltip" data-tip="Upload WAV file">
      <label class="btn btn-circle btn-outline cursor-pointer" class:btn-disabled={disabled}>
        <span class="material-icons">attach_file</span>
        <input 
          type="file" 
          accept=".wav,audio/wav" 
          class="hidden"
          onchange={handleFileUpload}
          bind:this={fileInputElement}
          {disabled}
        />
      </label>
    </div>
  {/if}
</div>
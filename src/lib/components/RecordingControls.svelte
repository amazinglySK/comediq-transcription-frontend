<script lang="ts">
  interface Props {
    recording?: boolean;
    audioUrl?: string;
    disabled?: boolean;
    onRecordingStart?: () => void;
    onRecordingStop?: (data: { audioBlob: Blob; audioUrl: string }) => void;
    onDownload?: () => void;
  }

  let {
    recording = false,
    audioUrl = "",
    disabled = false,
    onRecordingStart,
    onRecordingStop,
    onDownload
  }: Props = $props();

  let mediaStream: MediaStream;
  let mediaRecorder: MediaRecorder;
  let audioChunks: Blob[] = [];

  async function startRecording() {
    audioChunks = [];
    
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      onRecordingStop?.({ audioBlob: blob, audioUrl: url });
    };

    mediaRecorder.start();
    onRecordingStart?.();
  }

  function stopRecording() {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach(track => track.stop());
  }

  function download() {
    onDownload?.();
  }
</script>

<!-- Single record button for chat interface -->
<div class="tooltip" data-tip={recording ? "Stop recording" : "Start recording"}>
  <button 
    class={`btn btn-circle ${recording ? 'btn-error animate-pulse' : 'btn-primary'} ${disabled ? 'btn-disabled' : ''}`}
    onclick={recording ? stopRecording : startRecording} 
    disabled={disabled}
  >
    {#if recording}
      <span class="material-icons">stop</span>
    {:else}
      <span class="material-icons">mic</span>
    {/if}
  </button>
</div>
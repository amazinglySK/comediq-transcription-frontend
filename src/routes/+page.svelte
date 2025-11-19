<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  import RecordingControls from '$lib/components/RecordingControls.svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import AudioAnalyzer from '$lib/components/AudioAnalyzer.svelte';
  import AnalysisResults from '$lib/components/AnalysisResults.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { tick } from 'svelte';
  import { addToast } from '$lib/stores/toastStore';
  import { analysisHistory, type AnalysisHistoryItem } from '$lib/stores/analysisHistoryStore';

  interface Props {
    form: ActionData;
  }

  let { form }: Props = $props();

  // State management
  let recording = $state(false);
  let audioUrl = $state("");
  let audioBlob = $state<Blob | null>(null);
  let uploadedFile = $state<File | null>(null);
  let analyzing = $state(false);
  let showTestResults = $state(false);
  let currentAnalysis = $state<AnalysisHistoryItem | null>(null);
  let analyzerRef: any;
  
  // Subscribe to analysis history
  let history = $state<AnalysisHistoryItem[]>([]);
  analysisHistory.subscribe(value => {
    history = value;
  });

  // Helper function to trim long filenames for display
  function trimFilename(filename: string): string {
    if (filename.length <= 10) return filename;
    return filename.substring(0, 7) + '...';
  }

  // Mock test data
  const testResults = {
    success: true,
    filename: "test-comedy-set.wav",
    transcript: "So I went to the store the other day, and the cashier asked if I wanted my milk in a bag. I said no, just leave it in the carton, it's already pre-packaged! Then I realized I've been adulting wrong this whole time. My mom used to pack my lunch, now I can't even pack my groceries properly. I'm 30 years old and I still don't know if you're supposed to put the bread on top or bottom of the grocery bag. It's like a grocery Tetris game that I'm losing every time.",
    analysis: `# Comedy Performance Analysis

## Overall Performance: **8.2/10**

### Strengths:
- **Strong observational humor** - The grocery store premise is universally relatable
- **Good callback structure** - References "adulting" theme throughout
- **Nice escalation** - Builds from simple milk joke to broader life commentary

### Areas for Improvement:
- **Timing could be tighter** on the grocery Tetris punchline
- **Could use more physical gestures** during the bag packing bit
- **Consider adding a stronger closer** after the Tetris reference

### Audience Engagement:
The **adulting struggle** theme resonates well with millennial audiences. The **self-deprecating tone** creates good audience connection.

### Technical Notes:
- Pause after "pre-packaged" for maximum impact
- Speed up delivery on the "30 years old" section for better rhythm`,
    segmentation: [
      {
        chunk: "Opening Setup",
        bits: [
          {
            bit: "Grocery Store Milk Joke",
            jokes: [
              {
                setup: "So I went to the store the other day, and the cashier asked if I wanted my milk in a bag.",
                punchline: "I said no, just leave it in the carton, it's already pre-packaged!",
                start_time: 2.5,
                end_time: 8.1
              }
            ]
          }
        ]
      },
      {
        chunk: "Adulting Theme Development", 
        bits: [
          {
            bit: "Childhood vs Adult Comparison",
            jokes: [
              {
                setup: "Then I realized I've been adulting wrong this whole time. My mom used to pack my lunch,",
                punchline: "now I can't even pack my groceries properly.",
                start_time: 8.1,
                end_time: 14.3
              }
            ]
          },
          {
            bit: "Grocery Bag Confusion",
            jokes: [
              {
                setup: "I'm 30 years old and I still don't know if you're supposed to put the bread on top or bottom of the grocery bag.",
                punchline: "It's like a grocery Tetris game that I'm losing every time.",
                start_time: 14.3,
                end_time: 22.7
              }
            ]
          }
        ]
      }
    ]
  };

  // Event handlers
  function handleRecordingStart() {
    recording = true;
    // Clear uploaded file when starting recording
    if (uploadedFile) {
      uploadedFile = null;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        audioUrl = "";
      }
    }
  }

  function handleRecordingStop(data: { audioBlob: Blob; audioUrl: string }) {
    (async () => {
      recording = false;
      audioBlob = data.audioBlob;
      audioUrl = data.audioUrl;
      
      addToast('Recording completed successfully', 'success', 3000);

      // Wait for AudioAnalyzer to render (it appears when audioUrl && !analyzing)
      await tick();
      try {
        // If the analyzer component is available, submit the recorded blob
        analyzerRef?.submitFile?.(data.audioBlob, `recording-${Date.now()}.wav`);
      } catch (err) {
        console.error('Failed to auto-submit recording for analysis', err);
      }
    })();
  }

  function handleDownload() {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voice-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function handleFileSelected(data: { file: File; audioUrl: string }) {
    uploadedFile = data.file;
    
    // Clear previous audio URL and recorded audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    audioUrl = data.audioUrl;
    audioBlob = null;
    
    const displayName = trimFilename(data.file.name);
    addToast(`File "${displayName}" uploaded successfully`, 'success', 3000);
  }

  function handleFileClear() {
    uploadedFile = null;
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = "";
    }
  }

  function handleAnalysisStart() {
    analyzing = true;
    addToast('Starting analysis...', 'info', 3000);
  }

  function handleAnalysisComplete() {
    analyzing = false;
  }

  function loadHistoryItem(item: AnalysisHistoryItem) {
    currentAnalysis = item;
    showTestResults = false;
  }

  function startNewAnalysis() {
    currentAnalysis = null;
    showTestResults = false;
    window.location.reload();
  }

  // Show error toast when form has error
  $effect(() => {
    if (form?.error) {
      addToast(`Analysis failed: ${form.error}`, 'error');
    }
  });

  // Save to history when form has successful results
  $effect(() => {
    if (form?.success && form?.filename && form?.transcript && form?.analysis) {
      analysisHistory.addAnalysis({
        filename: form.filename,
        transcript: form.transcript,
        analysis: form.analysis,
        segmentation: form.segmentation || []
      });
      addToast('Analysis completed successfully!', 'success');
    }
  });
</script>

<style>
  .logo-hamburger-btn {
    position: relative;
    overflow: hidden;
  }
  
  .logo-container {
    position: relative;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .comediq-logo,
  .hamburger-icon {
    position: absolute;
    transition: all 0.3s ease-in-out;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .comediq-logo {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
  
  .hamburger-icon {
    opacity: 0;
    transform: rotate(90deg) scale(0.8);
  }
  
  .logo-hamburger-btn:hover .comediq-logo {
    opacity: 0;
    transform: rotate(-90deg) scale(0.8);
  }
  
  .logo-hamburger-btn:hover .hamburger-icon {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
</style>

<svelte:head>
    <title>Comediq: Comedy Analyzer</title>
</svelte:head>

<div class="drawer">
  <input id="my-drawer-1" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- Main Layout with separate sidebar -->
    <div class="flex h-screen">
      <!-- Main Content Area -->
      <div class="flex flex-col flex-1">
        <!-- Navbar (separate from sidebar) -->
        <div class="navbar bg-base-100">
          <div class="navbar-start">
            <label for="my-drawer-1" class="btn btn-square btn-ghost drawer-button logo-hamburger-btn">
              <div class="logo-container">
                <img src="/comediq_white.png" alt="Comediq" class="comediq-logo" />
                <span class="material-icons hamburger-icon">menu</span>
              </div>
            </label>
          </div>
          <div class="navbar-center">
            <h1 class="text-xl font-bold">Comediq Comedy Analyzer</h1>
          </div>
          <div class="navbar-end">
            <!-- Future: Settings, profile, etc -->
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="max-w-4xl mx-auto">
          <!-- Hero Section -->
          {#if !form?.success && !analyzing && !showTestResults && !currentAnalysis}
            <div class="hero min-h-[60vh]">
              <div class="hero-content text-center">
                <div class="max-w-md">
                  <div class="text-6xl mb-6">🎤</div>
                  <h1 class="text-3xl font-bold mb-4">Upload or Record Your Standup!</h1>
                  <p class="text-lg opacity-70">
                    Get detailed analysis of your comedy performance including timing, structure, and audience engagement insights.
                  </p>
                </div>
              </div>
            </div>
          {/if}

          <!-- Loading Screen while analyzing -->
          {#if analyzing}
            <LoadingScreen />
          {/if}

          <!-- Analysis Results -->
          {#if form?.success || showTestResults || currentAnalysis}
            {@const results = currentAnalysis || (showTestResults ? testResults : form)}
            {#if results}
            <div class="space-y-6">
              <!-- New Analysis Button -->
              <div class="flex justify-center">
                <button 
                  class="btn btn-primary"
                  onclick={startNewAnalysis}
                >
                  <span class="material-icons">add</span>
                  New Standup Analysis
                </button>
              </div>
              <!-- File Info Card -->
              <div class="card bg-base-100 shadow-sm">
                <div class="card-body">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="material-icons text-primary">audio_file</span>
                      <span class="font-medium">{results.filename || ''}</span>
                      {#if showTestResults}
                        <span class="badge badge-warning badge-sm">TEST DATA</span>
                      {/if}
                    </div>
                    {#if audioUrl}
                      <audio controls src={audioUrl}></audio>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Analysis Results -->
              <AnalysisResults 
                filename={results.filename || ''}
                transcript={results.transcript || ''}
                analysis={results.analysis || ''}
                segmentation={results.segmentation || []}
              />
            </div>
            {/if}
          {/if}
          </div>
        </div>

        <!-- Record Options (Fixed slightly above bottom) - Only show when no results -->
        {#if !form?.success && !showTestResults && !currentAnalysis}
          <div class="fixed bottom-4 w-full z-10">
            <div class="flex items-center justify-center gap-4 px-6 py-3 mx-auto bg-base-100 rounded-lg shadow-lg border border-base-300 w-fit">
            <!-- File Upload Button -->
            <FileUpload 
              {uploadedFile}
              disabled={recording || audioBlob !== null}
              onFileSelected={handleFileSelected}
              onFileClear={handleFileClear}
            />

            <!-- Audio Preview -->
            {#if audioUrl && !analyzing}
              <div class="flex-1 flex justify-center">
                <audio controls src={audioUrl}></audio>
              </div>
            {/if}

            <!-- Record Button -->
            <RecordingControls 
              {recording}
              {audioUrl}
              disabled={uploadedFile !== null || analyzing}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
              onDownload={handleDownload}
            />

            <!-- Analyze Button -->
            {#if audioUrl && !analyzing}
              <AudioAnalyzer 
                {audioUrl}
                {audioBlob}
                {uploadedFile}
                {analyzing}
                bind:this={analyzerRef}
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
              />
            {/if}
          </div>
        </div>
        {/if}
      </div>
    </div>

  </div>

  <!-- Sidebar Component -->
  <Sidebar 
    {history} 
    {currentAnalysis} 
    onHistoryItemClick={loadHistoryItem} 
  />
</div>

<script lang="ts">
	import { marked } from 'marked';
	import { onMount, onDestroy } from 'svelte';
	import Mark from 'mark.js';

	interface Props {
		filename: string;
		transcript: string;
		analysis: string;
		segmentation: any[];
	}

	let { filename, transcript, analysis, segmentation }: Props = $props();

	// Search functionality
	let searchQuery = $state('');
	let transcriptElement: HTMLElement;
	let markInstance: Mark;
	let currentMatchIndex = $state(0);
	let totalMatches = $state(0);

	// Format time in MM:SS format
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Search and highlight functionality
	function performSearch() {
		if (!markInstance || !searchQuery.trim()) {
			markInstance?.unmark();
			totalMatches = 0;
			currentMatchIndex = 0;
			return;
		}

		markInstance.unmark({
			done: () => {
				markInstance.mark(searchQuery.trim(), {
					separateWordSearch: false,
					caseSensitive: false,
					each: (element) => {
						element.addEventListener('click', () => {
							element.scrollIntoView({ behavior: 'smooth', block: 'center' });
						});
					},
					done: (totalMarks) => {
						totalMatches = totalMarks;
						currentMatchIndex = totalMarks > 0 ? 1 : 0;
						// Scroll to first match
						if (totalMarks > 0) {
							const firstMark = transcriptElement.querySelector('mark');
							firstMark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
						}
					}
				});
			}
		});
	}

	function navigateToMatch(direction: 'next' | 'prev') {
		const marks = transcriptElement.querySelectorAll('mark');
		if (marks.length === 0) return;

		// Remove current highlight
		marks.forEach(mark => mark.classList.remove('bg-warning', 'text-warning-content'));

		if (direction === 'next') {
			currentMatchIndex = currentMatchIndex >= totalMatches ? 1 : currentMatchIndex + 1;
		} else {
			currentMatchIndex = currentMatchIndex <= 1 ? totalMatches : currentMatchIndex - 1;
		}

		// Highlight current match
		const currentMark = marks[currentMatchIndex - 1];
		if (currentMark) {
			currentMark.classList.add('bg-warning', 'text-warning-content');
			currentMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	function clearSearch() {
		searchQuery = '';
		markInstance?.unmark();
		totalMatches = 0;
		currentMatchIndex = 0;
	}

	// Preprocess markdown to handle tables in code blocks
	function preprocessMarkdown(text: string): string {
		// Pattern to match code blocks that contain markdown tables
		const codeBlockWithTableRegex = /```(?:markdown|md)?\s*\n((?:[^\n]*\|[^\n]*\n?)+)\s*```/gi;
		
		// Extract tables from code blocks and convert them back to regular markdown
		let processed = text.replace(codeBlockWithTableRegex, (match, tableContent) => {
			// Check if the content actually looks like a markdown table
			const lines = tableContent.trim().split('\n');
			const hasTableSeparator = lines.some((line: string) => /^\s*\|?[\s\-:|]+\|?\s*$/.test(line));
			
			if (hasTableSeparator) {
				// Return the table content without code block wrapper
				return '\n' + tableContent.trim() + '\n';
			}
			
			// If it's not a table, keep the original code block
			return match;
		});

		// Also handle tables wrapped in generic code blocks (without language specified)
		const genericCodeBlockRegex = /```\s*\n((?:[^\n]*\|[^\n]*\n?)+)\s*```/gi;
		processed = processed.replace(genericCodeBlockRegex, (match, content) => {
			const lines = content.trim().split('\n');
			const hasTableSeparator = lines.some((line: string) => /^\s*\|?[\s\-:|]+\|?\s*$/.test(line));
			const looksLikeTable = lines.length > 1 && lines.every((line: string) => line.includes('|'));
			
			if (hasTableSeparator || looksLikeTable) {
				return '\n' + content.trim() + '\n';
			}
			
			return match;
		});

		return processed;
	}

	// Process markdown to HTML
	const analysisHtml = $derived(() => {
		const processedAnalysis = preprocessMarkdown(analysis);
		return marked(processedAnalysis, {
			gfm: true, // Enable GitHub Flavored Markdown for better table support
			breaks: true // Convert line breaks to <br>
		});
	});

	onMount(() => {
		if (transcriptElement) {
			markInstance = new Mark(transcriptElement);
		}
	});

	onDestroy(() => {
		markInstance?.unmark();
	});

	// Reactive search
	$effect(() => {
		if (markInstance) {
			performSearch();
		}
	});
</script>

<!-- Analysis Results Cards -->
<div class="space-y-6 max-w-4xl mx-auto">
	<!-- Transcript Card -->
	<div class="card bg-base-100 shadow-xl border border-base-300">
		<div class="bg-primary text-primary-content p-4">
			<div class="flex items-center justify-center gap-3">
				<span class="material-icons">subtitles</span>
				<h2 class="text-xl font-semibold">Transcript</h2>
			</div>
		</div>
		
		<div class="card-body">
			<!-- Search Section -->
			<div class="mb-4">
				<div class="flex items-center gap-2 mb-2">
					<div class="flex-1">
						<div class="input-group">
							<input 
								type="text" 
								placeholder="Search in transcript..." 
								class="input input-bordered input-sm flex-1"
								bind:value={searchQuery}
							/>
							{#if searchQuery}
								<button 
									class="btn btn-sm btn-ghost" 
									onclick={clearSearch}
									title="Clear search"
								>
									<span class="material-icons text-sm">close</span>
								</button>
							{/if}
							<span class="btn btn-sm btn-ghost">
								<span class="material-icons text-sm">search</span>
							</span>
						</div>
					</div>
					
					<!-- Search Navigation Controls -->
					{#if totalMatches > 0}
						<div class="flex items-center gap-2">
							<span class="text-sm opacity-75">{currentMatchIndex} of {totalMatches}</span>
							<div class="join">
								<button 
									class="btn btn-xs btn-outline join-item" 
									onclick={() => navigateToMatch('prev')}
									disabled={totalMatches === 0}
									title="Previous match"
								>
									<span class="material-icons text-sm">keyboard_arrow_up</span>
								</button>
								<button 
									class="btn btn-xs btn-outline join-item" 
									onclick={() => navigateToMatch('next')}
									disabled={totalMatches === 0}
									title="Next match"
								>
									<span class="material-icons text-sm">keyboard_arrow_down</span>
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Transcript Content -->
			<div class="max-h-96 overflow-y-auto">
				<p class="text-base" bind:this={transcriptElement}>{transcript}</p>
			</div>
		</div>
	</div>

	<!-- Performance Analysis Card -->
	<div class="card bg-base-100 shadow-xl border border-base-300">
		<div class="bg-accent text-accent-content p-4">
			<div class="flex items-center justify-center gap-3">
				<span class="material-icons">analytics</span>
				<h2 class="text-xl font-semibold">Performance Analysis</h2>
			</div>
		</div>
		<div class="card-body">
			<div class="markdown-content prose prose-sm max-w-none">
				{@html analysisHtml()}
			</div>
		</div>
	</div>

	<!-- Comedy Structure Card -->
	<div class="card bg-base-100 shadow-xl border border-base-300">
		<div class="bg-secondary text-secondary-content p-4">
			<div class="flex items-center justify-center gap-3">
				<span class="material-icons">psychology</span>
				<h2 class="text-xl font-semibold">Comedy Structure Breakdown</h2>
			</div>
		</div>
		<div class="card-body">
			<div class="space-y-4">
				{#each segmentation as chunk, index}
					<div class="collapse-arrow collapse bg-base-200">
						<input type="checkbox" name="segmentation-accordion-{index}" />
						<div class="collapse-title flex items-center gap-2 text-base font-medium">
							<span class="material-icons text-sm">category</span>
							{chunk.chunk}
						</div>
						<div class="collapse-content">
							{#each chunk.bits as bit}
								<div class="mb-4 rounded-lg bg-base-300 p-4">
									<h4 class="mb-3 flex items-center gap-2 font-semibold">
										<span class="material-icons text-sm">lightbulb</span>
										{bit.bit}
									</h4>
									{#each bit.jokes as joke}
										<div class="mb-3 rounded border-l-4 border-primary bg-base-100 p-3">
											<p class="mb-2 text-sm"><strong>Setup:</strong> {joke.setup}</p>
											<p class="mb-2 text-sm"><strong>Punchline:</strong> {joke.punchline}</p>
											<p class="flex items-center gap-1 text-xs text-base-content/60">
												<span class="material-icons" style="font-size: 14px;">schedule</span>
												{formatTime(joke.start_time)} - {formatTime(joke.end_time)}
											</p>
										</div>
									{/each}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "../../app.css";

	:global(.markdown-content h1) {
		@apply mt-6 mb-4 text-2xl font-bold;
	}

	:global(.markdown-content h2) {
		@apply mt-5 mb-3 text-xl font-bold;
	}

	:global(.markdown-content h3) {
		@apply mt-4 mb-2 text-lg font-semibold;
	}

	:global(.markdown-content h4) {
		@apply mt-3 mb-2 text-base font-semibold;
	}

	:global(.markdown-content p) {
		@apply mb-3;
	}

	:global(.markdown-content ul) {
		@apply mb-4 ml-4 list-inside list-disc;
	}

	:global(.markdown-content ol) {
		@apply mb-4 ml-4 list-inside list-decimal;
	}

	:global(.markdown-content li) {
		@apply mb-1;
	}

	:global(.markdown-content strong) {
		@apply font-bold;
	}

	:global(.markdown-content em) {
		@apply italic;
	}

	:global(.markdown-content table) {
		@apply mb-4 w-full border-collapse border border-base-300;
	}

	:global(.markdown-content th) {
		@apply border border-base-300 bg-base-200 px-3 py-2 text-left font-semibold;
	}

	:global(.markdown-content td) {
		@apply border border-base-300 px-3 py-2;
	}

	/* Search highlight styles */
	:global(mark) {
		@apply bg-accent/30 text-accent-content rounded px-1;
		cursor: pointer;
	}

	:global(mark.bg-warning) {
		@apply bg-warning text-warning-content;
	}

	:global(.markdown-content blockquote) {
		@apply mb-4 border-l-4 border-primary bg-base-200 py-2 pl-4 italic;
	}

	:global(.markdown-content code) {
		@apply rounded bg-base-200 px-1 py-0.5 font-mono text-sm;
	}

	:global(.markdown-content pre) {
		@apply mb-4 overflow-x-auto rounded bg-base-200 p-3;
	}

	:global(.markdown-content pre code) {
		@apply bg-transparent p-0;
	}
</style>

<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();
</script>

<main class = "h-screen">
    {@render children()}
</main>

<!-- Global Toast Component - Available everywhere -->
<Toast />


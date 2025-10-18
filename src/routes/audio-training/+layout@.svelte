<script lang="ts">
	import '$lib/styles/themes/audio-training.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="audio-training-app min-h-screen bg-slate-950 text-slate-100">
	{@render children?.()}
</div>

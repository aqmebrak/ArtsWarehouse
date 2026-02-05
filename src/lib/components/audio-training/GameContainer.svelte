<script lang="ts">
	import type { Snippet } from 'svelte';

	interface GameContainerProps {
		title: string;
		description?: string;
		gradient?: string;
		children: Snippet;
	}

	let {
		title,
		description,
		gradient = 'from-slate-900/50 via-slate-800/50 to-slate-900/50',
		children
	}: GameContainerProps = $props();
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h1 class="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
		{#if description}
			<p class="mt-2 text-slate-300">{description}</p>
		{/if}
	</div>

	<!-- Game Content -->
	<div class="game-container rounded-xl bg-gradient-to-br {gradient} p-6 backdrop-blur-sm sm:p-8">
		{@render children()}
	</div>
</div>

<style>
	.game-container {
		border: 1px solid rgb(168 85 247 / 0.3);
		box-shadow:
			0 20px 25px -5px rgb(0 0 0 / 0.3),
			0 8px 10px -6px rgb(168 85 247 / 0.1);
	}
</style>

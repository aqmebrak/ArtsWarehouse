<script lang="ts">
	import '$lib/styles/themes/sbt.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="sbt-app min-h-screen bg-zinc-950 text-gray-100">
	{@render children?.()}
</div>

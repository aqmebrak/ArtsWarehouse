<script lang="ts">
	import '$lib/styles/themes/tellurichymn.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="tellurichymn-app min-h-screen bg-slate-950 text-purple-100">
	{@render children?.()}
</div>

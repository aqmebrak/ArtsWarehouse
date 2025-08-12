<script lang="ts">
	import '../app.css';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { page } from '$app/state';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<div class="my-2 flex w-full flex-col items-center">
	<div class="flex flex-col items-center">
		<a class="title" href="/">No1yz.art</a>
		<div class="line flex-1"></div>
	</div>
	<!-- hide menu if on /tellurichhymn page -->
	{#if page.url.pathname !== '/tellurichymn'}
		<nav class="mt-4 flex w-full flex-wrap items-center justify-center">
			<a href="/gallery">Paintings</a>
			<a href="/sbt">Stories Bones Tell</a>
			<a href="/tellurichymn">Telluric Hymn</a>
			<!-- <a href="/music">Music</a> -->
			<!-- <a href="/respire">Respire</a> -->
		</nav>
	{/if}
</div>

{@render children?.()}

<style>
	.title {
		font-size: 3rem;
	}

	.line {
		height: 1px;
		width: 100%;
		border-top: 1px;
		border-color: var(--font-color-secondary);
		border-style: solid;
		margin-top: -4px;
	}

	nav > a {
		font-size: 1.4rem;
		letter-spacing: 4px;
		padding: 0 10px 0 10px;
	}
</style>

<script lang="ts">
	import '../app.css';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { page } from '$app/state';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import { t } from '$lib/i18n';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<div class="my-2 flex w-full justify-center">
	<a class="title mr-8" href="/">No1yz.art</a>
	<!-- hide menu if on /tellurichhymn page -->
	{#if page.url.pathname !== '/tellurichymn' && page.url.pathname !== '/sbt'}
		<nav class="mt-4 flex flex-wrap items-end justify-center">
			<a href="/gallery">{$t('nav.paintings')}</a>
			<a href="/sbt">{$t('nav.storiesBonesTell')}</a>
			<a href="/tellurichymn">{$t('nav.telluricHymn')}</a>
			<a href="/audio-training">{$t('nav.audioTraining')}</a>
			<!-- <a href="/music">{$t('nav.music')}</a> -->
			<!-- <a href="/respire">{$t('nav.respire')}</a> -->
		</nav>

		<!-- Language Toggle - only show on main navigation pages -->
		<div class="fixed top-4 right-4 z-50">
			<LanguageToggle />
		</div>
	{/if}
</div>

{@render children?.()}

<style>
	div {
		color: var(--font-color);
	}
	.title {
		font-size: 3rem;
	}
	nav > a {
		font-size: 1.4rem;
		letter-spacing: 4px;
		padding: 0 10px 0 10px;
	}
</style>

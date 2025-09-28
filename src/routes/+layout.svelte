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

<div class="my-2 flex flex-col md:flex-row w-full justify-center">
	<a class="title text-center md:mr-8" href="/">No1yz.art</a>
	<!-- hide menu if on /tellurichhymn page -->
	{#if page.url.pathname !== '/tellurichymn' && page.url.pathname !== '/sbt'}
		<nav class="mt-4 flex flex-col md:flex-row flex-wrap items-center text-xl md:text-2xl md:items-end justify-center gap-1 md:gap-4">
			<a href="/gallery">{$t('nav.paintings')}</a>
			<a href="/sbt">{$t('nav.storiesBonesTell')}</a>
			<a href="/tellurichymn">{$t('nav.telluricHymn')}</a>
			<a href="/audio-training">{$t('nav.audioTraining')}</a>
			<!-- <a href="/music">{$t('nav.music')}</a> -->
			<!-- <a href="/respire">{$t('nav.respire')}</a> -->
		</nav>

		<!-- Language Toggle - only show on main navigation pages -->
		<div class="fixed top-2 right-2 z-50">
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

</style>

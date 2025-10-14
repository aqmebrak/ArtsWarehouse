<script lang="ts">
	import '../app.css';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { page } from '$app/state';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import { t } from '$lib/i18n';
	import type { LayoutProps } from './$types';
	import { resolve } from '$app/paths';

	let { children }: LayoutProps = $props();

	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<div class="flex w-full flex-col justify-center py-2 md:flex-row">
	<a class="title text-center md:mr-8" href={resolve('/')}>No1yz.art</a>
	<!-- hide menu if on /tellurichhymn page -->
	{#if page.url.pathname !== '/tellurichymn' && page.url.pathname !== '/sbt'}
		<nav
			class="mt-4 flex flex-col flex-wrap items-center justify-center gap-1 text-xl md:flex-row md:items-end md:gap-4 md:text-2xl"
		>
			<a href={resolve('/gallery')}>{$t('nav.paintings')}</a>
			<a href={resolve('/sbt')}>{$t('nav.storiesBonesTell')}</a>
			<a href={resolve('/tellurichymn')}>{$t('nav.telluricHymn')}</a>
			<a href={resolve('/audio-training')}>{$t('nav.audioTraining')}</a>
			<a href={resolve('/recipes')}>Recipes</a>
			<!-- <a href={resolve("/respire")}>{$t('nav.respire')}</a> -->
		</nav>

		<!-- Language Toggle - only show on main navigation pages -->
		<div class="fixed top-2 right-2 z-50">
			<LanguageToggle />
		</div>
	{/if}
</div>

<main class="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
	{@render children?.()}
</main>

<style>
	div {
		color: var(--font-color);
	}
	.title {
		font-size: 3rem;
	}
</style>

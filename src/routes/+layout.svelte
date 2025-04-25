<script lang="ts">
	import '../app.css';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { createMenubar, melt } from '@melt-ui/svelte';
	import { ThemeSwitch } from '$lib/index';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	// foodyz
	const {
		elements: { menubar },
		builders: { createMenu }
	} = createMenubar();
	const {
		elements: { menu, item, trigger }
	} = createMenu();

	const {
		elements: { menu: menuA, item: itemA, trigger: triggerA }
	} = createMenu();
	const {
		elements: { menu: menuB, item: itemB, trigger: triggerB }
	} = createMenu();
</script>

<header
	class="mx-auto flex w-full max-w-[1440px] items-center gap-4 border border-solid border-emerald-200 px-4 md:px-6 lg:px-8"
>
	<div class="order-2 flex items-center justify-center gap-2 p-2 md:order-1">
		<img
			src="/logo.png"
			alt="logo"
			class="h-full w-1/4 object-contain md:max-h-[52px] md:w-full md:max-w-[300px]"
		/>
		<h1 class="text-center text-xl font-semibold md:whitespace-nowrap md:text-4xl">
			<a href="/">Les recettes de la Barnière</a>
		</h1>
	</div>
	<!-- MENU -->
	<!-- <div class="order-1 text-base md:order-2" use:melt={$menubar}>
		<button use:melt={$trigger} class="">|||</button>
		<div
			use:melt={$menu}
			class="flex flex-col border border-solid border-emerald-500 bg-emerald-100 dark:bg-emerald-900"
		>
			<a
				{...$item}
				use:item
				class="cursor-pointer border-b border-emerald-500 p-2 hover:bg-white dark:hover:bg-emerald-800"
				href="/init">Reset</a
			>
			<a
				{...$item}
				use:item
				class="cursor-pointer p-2 hover:bg-white dark:hover:bg-emerald-800"
				href="/recipes/add">Add</a
			>
		</div>
	</div> -->
	<a class="order-4" href="/recipes/add">Ajouter</a>

	<!--  TOGGLE DARK MODE  -->
	<div class="order-4 ml-auto">
		<ThemeSwitch />
	</div>
</header>

<div class="mt-2 flex w-full flex-col items-center">
	<div class="flex flex-col items-center">
		<a class="title" href="/">No1yz.art</a>
		<div class="line flex-1"></div>
	</div>
	<nav class="mt-4 flex w-full flex-wrap items-center justify-center">
		<a href="/gallery">Paintings</a>
		<a href="/music">Music</a>
		<a href="/respire">Respire</a>
		<a href="/game">Game</a>
	</nav>
</div>

<main class="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
	{@render children?.()}
</main>

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

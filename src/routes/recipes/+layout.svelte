<script lang="ts">
	import { createMenubar, melt } from '@melt-ui/svelte';
	import { ThemeSwitch } from '$lib/index';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

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
			<a href="/recipes">Les recettes de la Barnière</a>
		</h1>
	</div>
	<!-- MENU -->
	<div class="order-1 text-base md:order-2" use:melt={$menubar}>
		<button use:melt={$trigger} class="">|||</button>
		<div
			use:melt={$menu}
			class="flex flex-col border border-solid border-emerald-500 bg-emerald-100 dark:bg-emerald-900"
		>
			{#each data.recipes as recipe}
				<a
					{...$item}
					use:item
					class="cursor-pointer border-b border-emerald-500 p-2 hover:bg-white dark:hover:bg-emerald-800"
					href={`/recipes/${recipe.id}`}>{recipe.name}</a
				>
			{/each}
		</div>
	</div>
	<a class="order-4" href="/recipes/add">Ajouter</a>

	<!--  TOGGLE DARK MODE  -->
	<div class="order-4 ml-auto">
		<ThemeSwitch />
	</div>
</header>

<main class="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8">
	{@render children?.()}
</main>

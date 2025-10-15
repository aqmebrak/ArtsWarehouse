<script lang="ts">
	import '$lib/styles/themes/recipes.css';
	import * as Menubar from '$lib/components/ui/menubar';
	import { ThemeSwitch } from '$lib/index';
	import type { LayoutProps } from './$types';
	import { resolve } from '$app/paths';

	let { children, data }: LayoutProps = $props();
</script>

<header
	class="mx-auto mt-12 flex w-full max-w-[1440px] items-center gap-4 border border-solid border-emerald-200 bg-emerald-50 px-4 text-gray-700 md:px-6 lg:px-8 dark:bg-emerald-950 dark:text-gray-200"
>
	<div class="order-2 flex items-center justify-center gap-2 p-2 md:order-1">
		<img
			src="/logo.png"
			alt="logo"
			class="h-full w-1/4 object-contain md:max-h-[52px] md:w-full md:max-w-[300px]"
		/>
		<h1 class="text-center text-xl font-semibold md:text-4xl md:whitespace-nowrap">
			<a href={resolve('/recipes')}>Les recettes de la Barnière</a>
		</h1>
	</div>
	<Menubar.Root>
		<Menubar.Menu>
			<Menubar.Trigger>Recettes</Menubar.Trigger>
			<Menubar.Content>
				{#each data.recipes as recipe (recipe.id)}
					<Menubar.Item>
						<a class="" href={resolve(`/recipes/${recipe.id}`)}>
							{recipe.name}
						</a>
					</Menubar.Item>
				{/each}
			</Menubar.Content>
		</Menubar.Menu>
	</Menubar.Root>

	<a class="order-4" href={resolve('/recipes/add')}>Ajouter</a>

	<div class="order-4 ml-auto">
		<ThemeSwitch />
	</div>
</header>

<main
	class="mx-auto w-full max-w-[1440px] bg-emerald-50 px-4 text-gray-700 md:px-6 lg:px-8 dark:bg-emerald-950 dark:text-gray-200"
>
	{@render children?.()}
</main>

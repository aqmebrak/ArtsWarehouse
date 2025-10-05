<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex h-fit flex-col items-center justify-center p-4">
	<h2 class="text-2xl font-semibold">Recettes</h2>
	{#each data.recipes as recipe (recipe.id)}
		<ul class="py-8">
			<li class="flex gap-4">
				<h2>{recipe.name}</h2>
				<a href={`/recipes/${recipe.id}`}>View Recipe</a>
			</li>
		</ul>
	{:else}
		<p>No recipes found.</p>
	{/each}
</div>

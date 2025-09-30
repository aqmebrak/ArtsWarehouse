<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div>
	{#each data.recipes as recipe}
		<ul class="py-8">
			<li class="flex gap-4">
				<h2>{recipe.name}</h2>
				<a href={`/recipes/${recipe.id}`}>View Recipe</a>
			</li>
		</ul>
	{/each}
</div>

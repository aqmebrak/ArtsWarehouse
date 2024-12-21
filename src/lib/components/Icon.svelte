<script lang="ts">
	import pathsByName from './icons/icons-outline';
	export const iconOptions = Object.keys(pathsByName);
	export const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

	interface Props {
		name?: string;
		direction?: string;
		className?: string;
	}

	let { name = 'close', direction = 'n', className = 'h-5 w-5' }: Props = $props();

	let paths = $derived(pathsByName[name] || []);
	let rotation = $derived(directions.indexOf(direction) * 45);
</script>

<svg
	class={`c ${className}`}
	viewBox="0 0 25 25"
	fill-rule="evenodd"
	clip-rule="evenodd"
	style={`transform: rotate(${rotation}deg)`}
>
	{#each paths as path}
		<path d={path} />
	{/each}
</svg>

<style>
	.c {
		fill: currentColor;
		transition: all 0.3s ease-out;
		overflow: visible;
	}
</style>

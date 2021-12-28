<script>
	import pathsByName from './icons/icons-outline';
	export const iconOptions = Object.keys(pathsByName);
	export const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

	export let name = 'close';
	export let direction = 'n';
    export let className = 'h-5 w-5';

	$: paths = pathsByName[name] || [];
	$: rotation = directions.indexOf(direction) * 45;
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

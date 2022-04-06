<script lang="ts">
	import Icon from 'src/components/Icon.svelte';

	export let icon;
	export let label;
	export let url;
</script>

<div class="flex justify-center mt-8">
	<a href={url} target="_blank">
		<Icon name={icon} className="h-4 w-4" />
		<span class="pl-1">{label}</span>
	</a>
</div>

<style>
	a {
		display: flex;
		cursor: pointer;
		flex-direction: row;
		align-items: center;
		background-color: var(--periwinkle-crayola);
		color: var(--plump-purple);
		border-radius: 5px;
		border-width: 1px;
		border-color: var(--plump-purple);
		padding: 10px;
		font-size: 14px;
	}
	a svg {
		margin-bottom: 12px;
	}
	a span {
		color: var(--plump-purple);
	}

</style>

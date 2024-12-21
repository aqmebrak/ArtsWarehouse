<!-- eslint-disable -->
<!-- @ts-ignore -->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { modals } from '$lib/store/modals';
	import GalleryColumns from './GalleryColumns.svelte';

	interface Props {
		gap?: number;
		maxColumnWidth?: number;
		children?: import('svelte').Snippet;
	}

	let { gap = 10, maxColumnWidth = 250, children }: Props = $props();

	let slotHolder = $state();
	let columns = $state([[]]);
	let galleryWidth = $state(0);
	let columnCount = $state(0);

	onMount(Draw);

	function handleClick(url: string) {
		const rex = /(.*)\/(.*)(.jpg|.png)/g;
		const id = rex.exec(url)[2];
		modals.update((modalsPrev) => ({ ...modalsPrev, [id]: true }));
	}

	async function Draw() {
		await tick();

		if (!slotHolder) {
			return;
		}

		const imageContainers = Array.from(slotHolder.childNodes).filter((child) => {
			return child.id === 'IMG';
		});
		columns = [];

		// Fill the columns with image URLs
		for (let i = 0; i < imageContainers.length; i++) {
			const imgSrc = imageContainers[i].firstChild.src;
			const idx = i % columnCount;
			columns[idx] = [...(columns[idx] || []), imgSrc];
		}
	}
	$effect(() => {
		columnCount = parseInt(String(galleryWidth / maxColumnWidth)) || 1;
	});
	$effect(() => {
		columnCount && Draw();
	});
	let galleryStyle = $derived(
		`grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`
	);
</script>

<div id="slotHolder" bind:this={slotHolder} onDOMNodeInserted={Draw} onDOMNodeRemoved={Draw}>
	{#if children}
		{@render children()}
	{/if}
</div>

<GalleryColumns
	columns={columns}
	handleClick={handleClick}
	galleryWidth={galleryWidth}
	galleryStyle={galleryStyle}
	/>

<style>
	#slotHolder {
		display: none;
	}
</style>
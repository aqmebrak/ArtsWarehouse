<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { modals } from '$src/store/modals';

	export let gap = 10;
	export let maxColumnWidth = 250;

	let slotHolder = null;
	let columns = [];
	let galleryWidth = 0;
	let columnCount = 0;

	$: columnCount = parseInt(galleryWidth / maxColumnWidth) || 1;
	$: columnCount && Draw();
	$: galleryStyle = `grid-template-columns: repeat(${columnCount}, 1fr); --gap: ${gap}px`;

	onMount(Draw);

	function handleClick(url: string) {
		const rex = /\/src(.*)/g;
		const id = rex.exec(url)[0];
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
</script>

<div id="slotHolder" bind:this={slotHolder} on:DOMNodeInserted={Draw} on:DOMNodeRemoved={Draw}>
	<slot />
</div>

{#if columns}
	<div id="gallery" bind:clientWidth={galleryWidth} style={galleryStyle}>
		{#each columns as column}
			<div class="column">
				{#each column as url}
					<img src={url} alt="" on:click={() => handleClick(url)} />
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	img {
		cursor: pointer;
	}
	#slotHolder {
		display: none;
	}
	#gallery {
		width: 100%;
		display: grid;
		gap: var(--gap);
	}
	#gallery .column {
		display: flex;
		flex-direction: column;
	}
	#gallery .column * {
		width: 100%;
		margin-top: var(--gap);
	}
	#gallery .column *:nth-child(1) {
		margin-top: 0;
	}
</style>

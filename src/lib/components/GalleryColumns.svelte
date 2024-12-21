<script lang="ts">
	let { columns, handleClick, galleryWidth, galleryStyle } = $props();
</script>

{#if columns}
	<div id="gallery" bind:clientWidth={galleryWidth} style={galleryStyle}>
		{#each columns as column, indexCol}
			<div class="column">
				{#each column as url}
					<button onclick={(e) => handleClick(url)}>
						<img src={url} alt="" />
					</button>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	img {
		cursor: pointer;
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

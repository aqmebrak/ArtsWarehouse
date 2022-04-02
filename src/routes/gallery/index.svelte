<script lang="ts">
	import Gallery from '$src/components/Gallery.svelte';
	import images from '$src/images';
	import Modal from '$src/components/Modal.svelte';
</script>

<div class="lg:m-20 sm:m-4 m-1">
	<Gallery gap={40} maxColumnWidth={450}>
		{#each images as image}
			<div id="IMG">
				<img src={image} alt="img1" />
			</div>
		{/each}
	</Gallery>

	{#each images as image}
		<Modal id={image}><img src={image} alt="img1" /></Modal>
	{/each}
</div>

<style>
	:global(img) {
		opacity: 0.9;
		transition: all 0.2s;
	}
</style>

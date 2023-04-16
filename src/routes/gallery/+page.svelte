<script lang="ts">
	import Gallery from '../../components/Gallery.svelte';
	import images from '../../images';
	import Modal from '../../components/Modal.svelte';

	const assignId = (image) => {
		return /(.*)\/(.*)(.jpg|.png)/g.exec(image)[2];
	};
</script>

<div class="lg:m-20 sm:m-4 m-1">
	<Gallery gap={40} maxColumnWidth={450}>
		{#each images as image}
			<div id="IMG">
				<img src={image} alt={image} />
			</div>
		{/each}
	</Gallery>

	{#each images as image}
		<Modal id={assignId(image)}><img src={image} alt="img1" style="height: 80vh" /></Modal>
	{/each}
</div>
<!-- svelte-ignore a11y-missing-attribute -->
<img src="https://app.piratepx.com/ship?p=f174aa78-4b94-4857-a367-cc1a1c89a61f" />

<style>
	:global(img) {
		opacity: 0.9;
		transition: all 0.2s;
	}
</style>

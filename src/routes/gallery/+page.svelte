<script lang="ts">
	import Gallery from 'src/components/Gallery.svelte';
	import images from 'src/images';
	import Modal from 'src/components/Modal.svelte';
	import ButtonSocial from "src/components/ButtonSocial.svelte";

	const assignId = (image) => {
		return /(.*)\/(.*)(.jpg|.png)/g.exec(image)[2];
	};
</script>

<div class="flex justify-center mb-4 sm:mb-0">
	<ButtonSocial
			classNames="mt-5"
			label="Instagram"
			icon="instagram"
			url="https://www.instagram.com/matt_paintings/"
	/>
</div>

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

<style>
	:global(img) {
		opacity: 0.9;
		transition: all 0.2s;
	}
</style>

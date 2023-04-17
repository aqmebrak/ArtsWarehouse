<script lang="ts">
	import Gallery from '../../components/Gallery.svelte';
	import images from '../../images';
	import Modal from '../../components/Modal.svelte';
	import ButtonSocial from "../../components/ButtonSocial.svelte";

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
<!-- svelte-ignore a11y-missing-attribute -->
<img src="https://app.piratepx.com/ship?p=90a6a93d-7cd5-49f1-ac23-0c2505f23d94" />

<style>
	:global(img) {
		opacity: 0.9;
		transition: all 0.2s;
	}
</style>

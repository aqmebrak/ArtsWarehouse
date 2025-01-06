<script lang="ts">
	import images from '$lib/images';
	import { modals } from '$lib/store/modals';
	import ButtonSocial from '$lib/components/ButtonSocial.svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';

	let selectedImage = $state(null);

	const {
		elements: { trigger, portalled, overlay, content, close },
		states: { open }
	} = createDialog();

	function handleClickImage(url: string) {
		modals.update((modalsPrev) => ({ ...modalsPrev, [url]: true }));
	}
</script>

<div class="mb-4 flex justify-center sm:mb-0">
	<ButtonSocial
		classNames="mt-5"
		label="Instagram"
		icon="instagram"
		url="https://www.instagram.com/matt_paintings/"
	/>
</div>

<div class="m-1 sm:m-4 lg:m-8 xl:m-12">
	<div class="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
		{#each images as image}
			<div class="flex items-center justify-center">
				<button
					use:melt={$trigger}
					onclick={() => {
						selectedImage = image;
					}}
				>
					<img class="h-full w-full object-contain" src={image} alt={image} />
				</button>
			</div>
		{/each}
	</div>
</div>
{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			use:melt={$content}
			class="fixed left-1/2 top-1/2 z-50 flex max-h-[80vh] w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white p-6 shadow-lg"
		>
			<button use:melt={$close} class="absolute right-0 top-0">X</button>
			<img src={selectedImage} alt="img1" class="h-[80vh]" />
		</div>
	</div>
{/if}

<style>
	img {
		opacity: 0.9;
		transition: all 0.2s;
	}
</style>

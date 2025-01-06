<script lang="ts">
	import ButtonSocial from '$lib/components/ButtonSocial.svelte';
</script>

<div class="mt-12 flex flex-col items-center">
	<div class="text-center">Here you can find all my creations, from music to paintings</div>

	<div class="button-spacer mt-4 flex flex-col items-center">
		<h2>My bands:</h2>
		<ButtonSocial
			classNames="my-2"
			label="Stories Bones Tell (black metal)"
			icon="bandcamp"
			url="https://storiesbonestell.bandcamp.com/releases/"
		/>

		<h2 class="mt-4">As a mixing/mastering engineer</h2>
		<ButtonSocial
			classNames="my-2"
			label="Stories Bones Tell - Of Worlds Long Gone"
			icon="bandcamp"
			url="https://storiesbonestell.bandcamp.com/album/of-worlds-long-gone"
		/>
	</div>
</div>

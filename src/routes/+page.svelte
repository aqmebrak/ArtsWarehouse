<script lang="ts">
	import ButtonSocial from "src/components/ButtonSocial.svelte";
</script>

<div class="flex flex-col items-center mt-12">
	<div class="text-center">Here you can find all my creations, from music to paintings</div>

	<div class="flex flex-col mt-4 button-spacer items-center">
		<h2>My bands:</h2>
		<ButtonSocial
				classNames="my-2"
				label="Stories Bones Tell (black metal)"
				icon="bandcamp"
				url="https://storiesbonestell.bandcamp.com/releases/"
		/>
		<ButtonSocial
				classNames="my-2"
				label="Azimut (post metal)"
				icon="instagram"
				url="https://www.instagram.com/weareazimut/"
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
<img src="https://app.piratepx.com/ship?p=90a6a93d-7cd5-49f1-ac23-0c2505f23d94"  alt="pixel-tracking"/>

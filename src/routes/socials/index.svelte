<script lang="ts">
	import ButtonSocial from 'src/components/ButtonSocial.svelte';
</script>

<div class="mt-10 button-spacer">
	<ButtonSocial
		classNames="mt-5"
		label="SoundCloud"
		icon="soundcloud"
		url="https://soundcloud.com/no1yz/"
	/>
	<ButtonSocial
		classNames="mt-5"
		label="My black metal band"
		icon="bandcamp"
		url="https://storiesbonestell.bandcamp.com/releases/"
	/>
	<ButtonSocial
		classNames="mt-5"
		label="My post metal band"
		icon="instagram"
		url="https://www.instagram.com/weareazimut/"
	/>
	<ButtonSocial classNames="mt-5" label="Github" icon="github" url="https://github.com/aqmebrak/" />
	<ButtonSocial
		classNames="mt-5"
		label="My paintings"
		icon="instagram"
		url="https://www.instagram.com/matt_paintings/"
	/>
</div>

<!-- svelte-ignore a11y-missing-attribute -->
<img src="https://app.piratepx.com/ship?p=f174aa78-4b94-4857-a367-cc1a1c89a61f" />

<style>
	.button-spacer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>

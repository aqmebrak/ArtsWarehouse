<script lang="ts">
	import Player from '$src/components/Player.svelte';
	import songs from '$src/songs';
	import type { Song } from 'src/types';

	let selectedSong;

	const handleSelection = (song: Song) => (selectedSong = song);
</script>

<div class="grid gap-4 grid-cols-3 grid-rows-3">
	<ul>
		{#each songs as song}
			<li>
				<button on:click={() => handleSelection(song)}>{song.title}</button>
			</li>
		{/each}
	</ul>
</div>

<Player song={selectedSong} />

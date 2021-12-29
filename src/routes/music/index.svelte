<script lang="ts">
	import Player from '$src/components/Player.svelte';
	import songs from '$src/songs';
	import type { Song } from 'src/types';

	let selectedSong;

	const handleSelection = (song: Song) => (selectedSong = song);
</script>

<div class="mt-10 flex justify-center h-full ">
	<div class="bg-stone-500 rounded h-2/4 overflow-auto ">
	{#each songs as song}
		<div
			class="my-10 border-y-2 border-y-gray-500 bg-stone-600 cursor-pointer p-6 py-3"
			on:click={() => handleSelection(song)}
		>
			<div class="text-lg text-zinc-200">{song.title}</div>
			<div class="text-sm text-zinc-300">{song.artist}</div>
		</div>
	{/each}
	</div>
</div>

<Player song={selectedSong} />

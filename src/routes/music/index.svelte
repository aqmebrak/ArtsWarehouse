<script lang="ts">
	import songs from '$src/songs';
	import type { Song } from '$src/types';
	import { tick } from 'svelte';
	import Player from '../../components/Player.svelte';
	import { playerState, PlayerStatus, selectedSong, audioElement } from '../../store/playerState';

	/**
	 * Actions
	 */
	const handleSelection = async (song: Song, index: number) => {
		selectedSong.update(() => song);
		await tick();
		$audioElement.play();

		playerState.update(() => ({
			status: PlayerStatus.PLAY,
			currentPosition: index
		}));
	};
</script>

<div class="mt-10 flex justify-center h-[36rem]">
	<!-- liste des morceaux -->
	<div class="bg-periwinkleCrayola rounded-l overflow-auto ">
		{#each songs as song, index}
			<div
				class={$selectedSong === song
					? 'bg-plumpPurple cursor-pointer p-6 py-3'
					: 'bg-plumpPurpleLight cursor-pointer p-6 py-3'}
				on:click={() => handleSelection(song, index)}
			>
				<div class={$selectedSong === song ? 'text-lg text-white' : 'text-lg'}>{song.title}</div>
				<div class={$selectedSong === song ? 'text-sm text-white' : 'text-sm'}>{song.artist}</div>
				<div class={$selectedSong === song ? 'text-sm text-white' : 'text-sm'}>{song.date}</div>
			</div>
			<div class="mb-1"></div>
		{/each}
	</div>
	<Player />
</div>

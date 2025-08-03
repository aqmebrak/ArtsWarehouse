<script lang="ts">
	import { tick } from 'svelte';

	import songs from '$lib/songs';
	import type { Song } from '$lib/types';
	import Player from '$lib/components/Player.svelte';
	import { playerState, PlayerStatus, selectedSong, audioElement } from '$lib/store/playerState';
	import { ariaKeyDownA11yHandler } from '$lib/utils/a11y';

	/**
	 * Actions
	 */
	const handleSelection = async (song: Song, index: number) => {
		selectedSong.set(song);
		await tick();
		if ($audioElement && 'play' in $audioElement) {
			await $audioElement.play();
		}

		playerState.update(() => ({
			status: PlayerStatus.PLAY,
			currentPosition: index
		}));
	};
</script>

<div class="mt-10 flex h-144 justify-center">
	<!-- liste des morceaux -->
	<div class="overflow-auto rounded-l bg-periwinkle-crayola">
		{#each songs as song, index}
			<div
				tabindex="0"
				role="button"
				{...ariaKeyDownA11yHandler(() => handleSelection(song, index))}
				class={$selectedSong === song
					? 'cursor-pointer bg-plump-purple p-6 py-3'
					: 'cursor-pointer bg-plump-purple-light p-6 py-3'}
				onclick={() => handleSelection(song, index)}
			>
				<div class={$selectedSong === song ? 'text-lg text-white' : 'text-lg'}>
					{song.title}
				</div>
				<div class={$selectedSong === song ? 'text-sm text-white' : 'text-sm'}>
					{song.artist}
				</div>
				<div class={$selectedSong === song ? 'text-sm text-white' : 'text-sm'}>
					{song.date}
				</div>
			</div>
			<div class="mb-1"></div>
		{/each}
	</div>
	<Player />
</div>

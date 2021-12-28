<script lang="ts">
	import type { Song } from '$src/types';
	import Icon from '$src/components/Icon.svelte';

	enum PlayerStatus {
		PLAY = 'PLAY',
		PAUSE = 'PAUSE'
	}

	let playerState = {
		status: PlayerStatus.PAUSE,
		currentPosition: 0,
		audioElement: null
	};

	export let song: Song = null;

	const togglePlayPause = () => {
		if (playerState.status === PlayerStatus.PAUSE) {
			playerState.audioElement.play();
			playerState.status = PlayerStatus.PLAY;
		} else {
			playerState.audioElement.pause();
			playerState.status = PlayerStatus.PAUSE;
		}
	};
</script>

{#if song != null}
	<div class="fixed bottom-0 left-0 w-screen">
		<div class="p-2 m-3 flex justify-start items-center border-2 border-secondary">
			<button on:click={togglePlayPause}>
				{#if playerState.status === PlayerStatus.PLAY}
					<Icon name="pause" className="h-12 w-12" />
				{:else}
					<Icon name="play" className="h-12 w-12" />
				{/if}
			</button>
			<div class="flex flex-col justify-center">
				<div>
					{song.title}
				</div>
				<div>
					{song.artist}
				</div>
			</div>
		</div>
	</div>
	<audio bind:this={playerState.audioElement} src={song.src} />
{/if}

<style>
</style>

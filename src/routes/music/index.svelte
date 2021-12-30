<script lang="ts">
	import songs from '$src/songs';
	import type { Song } from '$src/types';
	import Icon from '$src/components/Icon.svelte';
	import { onMount } from 'svelte';

	enum PlayerStatus {
		PLAY = 'PLAY',
		PAUSE = 'PAUSE'
	}

	let selectedSong;
	let timer;
	let percent = 0;
	let playerState = {
		status: PlayerStatus.PAUSE,
		currentPosition: 0,
		audioElement: null
	};

	onMount(() => {
		playerState.audioElement.addEventListener('playing', function (_event) {
			let duration = _event.target.duration;
			advance(duration, playerState.audioElement);
		});
		playerState.audioElement.addEventListener('pause', function (_event) {
			clearTimeout(timer);
		});
		const advance = (duration, element) => {
			let progress = document.getElementById('progress');
			let increment = 10 / duration;
			percent = Math.min(increment * element.currentTime * 10, 100);
			progress.style.width = percent + '%';
			startTimer(duration, element);
		};
		const startTimer = (duration, element) => {
			if (percent < 100) {
				timer = setTimeout(function () {
					advance(duration, element);
				}, 100);
			}
		};
	});

	/**
	 * Actions
	 */
	const handleSelection = (song: Song) => (selectedSong = song);

	const togglePlayPause = () => {
		if (playerState.status === PlayerStatus.PAUSE) {
			playerState.audioElement.play();
			playerState.status = PlayerStatus.PLAY;
		} else {
			playerState.audioElement.pause();
			playerState.status = PlayerStatus.PAUSE;
		}
	};

	const handleNextSong = () => {};

	const handlePreviousSong = () => {};
</script>

<div class="mt-10 flex justify-center h-[36rem]">
	<div class="bg-gray-300 rounded overflow-auto ">
		{#each songs as song}
			<div
				class="my-10 border-y-2 border-y-gray-400 bg-gray-400 cursor-pointer p-6 py-3"
				on:click={() => handleSelection(song)}
			>
				<div class="text-lg text-zinc-200">{song.title}</div>
				<div class="text-sm text-zinc-300">{song.artist}</div>
				<div class="text-sm text-zinc-300">{song.date}</div>
			</div>
		{/each}
	</div>
	<div class="bg-gray-300 rounded-r w-96">
		<div class="p-2 flex flex-col justify-center items-start ">
			<div class="w-0 h-4 bg-primary progress" id="progress" />
			<div class="w-full flex justify-around items-center">
				<div>
					<button on:click={handlePreviousSong}>
						<Icon name="cheveronDoubleLeft" className="h-12 w-12" />
					</button>
				</div>
				<div>
					<button on:click={togglePlayPause}>
						{#if playerState.status === PlayerStatus.PLAY}
							<Icon name="pause" className="h-12 w-12" />
						{:else}
							<Icon name="play" className="h-12 w-12" />
						{/if}
					</button>
				</div>
				<div>
					<button on:click={handleNextSong}>
						<Icon name="cheveronDoubleRight" className="h-12 w-12" />
					</button>
				</div>
			</div>

			{#if selectedSong != null}
				<div class="flex flex-col justify-center">
					<div>
						{selectedSong.title}
					</div>
					<div>
						{selectedSong.artist}
					</div>
				</div>
			{/if}
		</div>
	</div>
	<audio bind:this={playerState.audioElement} src={selectedSong?.src} />
</div>

<style>
	.progress {
		transition: width 0.1s linear;
	}
</style>

<script lang="ts">
	import songs from '$src/songs';
	import type { Song } from '$src/types';
	import Icon from '$src/components/Icon.svelte';
	import { onMount, tick } from 'svelte';

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
	let isSliderOpen = false;
	let slider, sliderContainer, progressContainer;
	let drag = false;

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
		playerState.audioElement.volume = 0.5;
		selectedSong = songs[0];
	});

	const moveTimer = (pageX) => {
		clearTimeout(timer);
		playerState.audioElement.currentTime = pageX - progressContainer.offsetWidth - 138;
	};

	var updateBar = function (y: number, vol?: number) {
		var percentage;
		//if only volume have specificed
		//then direct update volume
		if (vol) {
			percentage = vol * 100;
		} else {
			var position = y - sliderContainer.offsetHeight - 130;
			percentage = (100 * position) / sliderContainer.clientHeight;
		}

		if (percentage > 100) {
			percentage = 100;
		}
		if (percentage < 0) {
			percentage = 0;
		}

		//update volume bar and video volume
		slider.style.height = percentage + '%';
		playerState.audioElement.volume = percentage / 100;
	};

	/**
	 * Actions
	 */
	const handleSelection = async (song: Song, index: number) => {
		selectedSong = song;
		await tick();
		playerState.audioElement.play();

		playerState.status = PlayerStatus.PLAY;
		playerState.currentPosition = index;
	};

	const togglePlayPause = () => {
		if (playerState.status === PlayerStatus.PAUSE) {
			playerState.audioElement.play();
			playerState.status = PlayerStatus.PLAY;
		} else {
			playerState.audioElement.pause();
			playerState.status = PlayerStatus.PAUSE;
		}
	};

	const handleNextSong = async () => {
		const nextPositionToPlay =
			songs.length === playerState.currentPosition + 1 ? 0 : playerState.currentPosition + 1;

		selectedSong = songs[nextPositionToPlay];
		await tick();
		playerState.audioElement.play();
		playerState.status = PlayerStatus.PLAY;
		playerState.currentPosition = nextPositionToPlay;
	};

	const handlePreviousSong = async () => {
		const nextPositionToPlay =
			playerState.currentPosition - 1 < 0 ? songs.length - 1 : playerState.currentPosition - 1;

		selectedSong = songs[nextPositionToPlay];
		await tick();
		playerState.audioElement.play();
		playerState.status = PlayerStatus.PLAY;
		playerState.currentPosition = nextPositionToPlay;
	};

	const openVolumeSlider = async () => {
		isSliderOpen = !isSliderOpen;
		await tick();
		if (slider) slider.style.height = playerState.audioElement.volume * 100 + '%';
	};
</script>

<div class="mt-10 flex justify-center h-[36rem]">
	<div class="bg-periwinkleCrayola rounded-l overflow-auto ">
		{#each songs as song, index}
			<div
				class={selectedSong === song
					? 'bg-plumpPurple cursor-pointer p-6 py-3'
					: 'bg-plumpPurpleLight cursor-pointer p-6 py-3'}
				on:click={() => handleSelection(song, index)}
			>
				<div class={selectedSong === song ? 'text-lg text-white' : 'text-lg'}>{song.title}</div>
				<div class={selectedSong === song ? 'text-sm text-white' : 'text-sm'}>{song.artist}</div>
				<div class={selectedSong === song ? 'text-sm text-white' : 'text-sm'}>{song.date}</div>
			</div>
			<div class="mb-1" />
		{/each}
	</div>
	<div class="bg-periwinkleCrayola rounded-r w-96">
		<div class="p-2 flex flex-col justify-center items-start ">
			<!-- fake progress bar full width to click on it -->
			<div
				class="w-full h-4 cursor-pointer"
				on:click={(ev) => {
					moveTimer(ev.pageX);
				}}
				bind:this={progressContainer}
			>
				<!-- progress bar -->
				<div class="w-0 h-4 bg-secondary progress rounded" id="progress" />
			</div>

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
				<div>
					<button on:click={openVolumeSlider}>
						<Icon name="volumeUp" className="h-6 w-6" />
					</button>
					{#if isSliderOpen}
						<div
							class="volume-slider-con"
							bind:this={sliderContainer}
							on:mousemove={(ev) => {
								if (drag) {
									updateBar(ev.pageY);
								}
							}}
							on:mousedown={async (ev) => {
								drag = true;
								await tick();
								updateBar(ev.pageY);
							}}
							on:mouseup={() => {
								drag = false;
							}}
						>
							<span class="volume-slider" bind:this={slider} />
						</div>
					{/if}
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

	.volume-slider-con {
		height: 100px;
		width: 20px;
		position: absolute;
		background-color: #ddd;
	}
	.volume-slider {
		height: 50%;
		width: 100%;
		position: absolute;
		background-color: var(--font-color);
	}
</style>

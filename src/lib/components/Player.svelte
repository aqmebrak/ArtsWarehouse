<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import {
		playerState,
		PlayerStatus,
		selectedSong,
		audioElement as audioElementStore
	} from '../store/playerState';
	import songs from '../songs';
	import { ariaKeyDownA11yHandler } from '$lib/utils/a11y';

	let isSliderOpen = $state(false);
	let slider = $state(),
		sliderContainer = $state(),
		progressContainer = $state();
	let drag = $state(false);
	let timer = $state(null);
	let percent = $state(0);
	let audioVolume = $state();
	let audioDuration = $state();
	let audioElement = $state(null);

	$effect(() => {
		if (audioElement != null) {
			audioElementStore.update(() => audioElement);
		}
	});

	onMount(() => {
		audioElement.addEventListener('playing', function (_event) {
			let duration = _event.target.duration;
			advance(duration, audioElement);
		});
		audioElement.addEventListener('pause', function () {
			clearTimeout(timer);
		});
		audioElement.addEventListener('ended', function () {
			clearTimeout(timer);
			playerState.update((prev) => ({
				...prev,
				status: PlayerStatus.PAUSE
			}));
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
		audioVolume = 0.5;
		selectedSong.update(() => songs[0]);
	});

	const moveTimer = (e) => {
		clearTimeout(timer);
		const rect = e.target.getBoundingClientRect();
		const x = e.clientX - rect.left;
		audioElement.currentTime =
			(x / progressContainer.getBoundingClientRect().width) * audioDuration;
	};
	const updateBar = function (y: number, vol?: number) {
		let percentage;
		//if only volume have specificed
		//then direct update volume
		if (vol) {
			percentage = vol * 100;
		} else {
			const position = y - sliderContainer.offsetHeight - 130;
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
		audioVolume = percentage / 100;
	};

	/**
	 * Actions
	 */
	const togglePlayPause = () => {
		if ($playerState.status === PlayerStatus.PAUSE) {
			audioElement.play();
			playerState.update((prev) => ({
				...prev,
				status: PlayerStatus.PLAY
			}));
		} else {
			audioElement.pause();
			playerState.update((prev) => ({
				...prev,
				status: PlayerStatus.PAUSE
			}));
		}
	};

	const handleNextSong = async () => {
		const nextPositionToPlay =
			songs.length === $playerState.currentPosition + 1
				? 0
				: $playerState.currentPosition + 1;

		selectedSong.update(() => songs[nextPositionToPlay]);
		await tick();
		audioElement.play();
		playerState.update((prev) => ({
			...prev,
			status: PlayerStatus.PLAY,
			currentPosition: nextPositionToPlay
		}));
	};

	const handlePreviousSong = async () => {
		const nextPositionToPlay =
			$playerState.currentPosition - 1 < 0
				? songs.length - 1
				: $playerState.currentPosition - 1;

		selectedSong.update(() => songs[nextPositionToPlay]);
		await tick();
		audioElement.play();
		playerState.update((prev) => ({
			...prev,
			status: PlayerStatus.PLAY,
			currentPosition: nextPositionToPlay
		}));
	};

	const openVolumeSlider = async () => {
		isSliderOpen = !isSliderOpen;
		await tick();
		if (slider) slider.style.height = audioVolume * 100 + '%';
	};
</script>

<div class="w-96 rounded-r bg-periwinkleCrayola">
	<div class="flex flex-col items-start justify-center p-2">
		<!-- fake progress bar full width to click on it -->
		<div
			{...ariaKeyDownA11yHandler((e) => moveTimer(e))}
			tabindex="0"
			role="button"
			class="h-4 w-full cursor-pointer"
			onclick={moveTimer}
			bind:this={progressContainer}
		>
			<!-- progress bar -->
			<div class="progress h-4 w-0 rounded bg-secondary" id="progress"></div>
		</div>

		<div class="flex w-full items-center justify-around">
			<div>
				<button onclick={handlePreviousSong}>
					<Icon name="cheveronDoubleLeft" className="h-12 w-12" />
				</button>
			</div>
			<div>
				<button onclick={togglePlayPause}>
					{#if $playerState.status === PlayerStatus.PLAY}
						<Icon name="pause" className="h-12 w-12" />
					{:else}
						<Icon name="play" className="h-12 w-12" />
					{/if}
				</button>
			</div>
			<div>
				<button onclick={handleNextSong}>
					<Icon name="cheveronDoubleRight" className="h-12 w-12" />
				</button>
			</div>
			<div>
				<button onclick={openVolumeSlider}>
					<Icon name="volumeUp" className="h-6 w-6" />
				</button>
				{#if isSliderOpen}
					<div
						tabindex="0"
						role="button"
						class="volume-slider-con"
						bind:this={sliderContainer}
						onmousemove={(ev) => {
							if (drag) {
								updateBar(ev.pageY);
							}
						}}
						onmousedown={async (ev) => {
							drag = true;
							await tick();
							updateBar(ev.pageY);
						}}
						onmouseup={() => {
							drag = false;
						}}
					>
						<span class="volume-slider" bind:this={slider}></span>
					</div>
				{/if}
			</div>
		</div>

		<!-- current title played -->
		{#if $selectedSong != null}
			<div class="flex flex-col justify-center">
				<div>
					{$selectedSong.title}
				</div>
				<div>
					{$selectedSong.artist}
				</div>
			</div>
		{/if}
	</div>
</div>
<audio
	bind:this={audioElement}
	bind:volume={audioVolume}
	bind:duration={audioDuration}
	src={$selectedSong?.src}
></audio>

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

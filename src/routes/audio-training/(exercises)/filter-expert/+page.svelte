<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import PlayerBar from '$lib/components/audio-training/PlayerBar.svelte';
	import GameContainer from '$lib/components/audio-training/GameContainer.svelte';
	import ToastContainer from '$lib/components/audio-training/ToastContainer.svelte';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { createGameManager } from '$lib/utils/audio-training/game-manager-setup.svelte';
	import type { RoundResult } from '$lib/components/audio-training/types';

	type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

	let filterNode: BiquadFilterNode | null = null;
	let currentFilterType: FilterType = 'lowpass';
	let selectedFilter = $state<FilterType | null>(null); // FIX: Added $state()
	let toastContainer: ToastContainer;

	// Initialize managers
	const audioManager = new AudioManager();
	const game = createGameManager({
		exerciseId: 'filter-expert',
		difficulty: 'beginner'
	});

	// Bind toast container
	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});

	let isAudioPlaying = $derived(audioManager.isPlaying);

	const filterTypes: FilterType[] = ['lowpass', 'highpass', 'bandpass', 'notch'];
	const filterLabels: Record<FilterType, string> = {
		lowpass: '🔽 Low Pass',
		highpass: '🔼 High Pass',
		bandpass: '🎯 Band Pass',
		notch: '⛔ Notch'
	};
	const filterDescriptions: Record<FilterType, string> = {
		lowpass: 'Cuts high frequencies, keeps lows',
		highpass: 'Cuts low frequencies, keeps highs',
		bandpass: 'Keeps middle frequencies only',
		notch: 'Removes specific frequency band'
	};

	onMount(() => {
		(async () => {
			await audioManager.initialize();
		})();

		const handleVisibilityChange = () => {
			if (document.hidden) {
				stopExercise();
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	onDestroy(() => {
		stopExercise();
		audioManager.cleanup();
	});

	function startGame() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		// Setup first round but don't auto-play
		selectedFilter = null;
		currentFilterType = filterTypes[Math.floor(Math.random() * filterTypes.length)];
	}

	function startExercise() {
		if (!audioManager.audioContext) {
			console.error('AudioContext not initialized');
			return;
		}

		stopExercise();

		// Create audio source
		audioManager.createSource();

		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		// Resume audio context
		audioManager.resumeIfSuspended();

		// Create filter
		filterNode = audioManager.audioContext.createBiquadFilter();
		filterNode.type = currentFilterType;

		// Set filter parameters based on type
		switch (currentFilterType) {
			case 'lowpass':
				filterNode.frequency.value = 1000; // Cut above 1kHz
				filterNode.Q.value = 1;
				break;
			case 'highpass':
				filterNode.frequency.value = 1000; // Cut below 1kHz
				filterNode.Q.value = 1;
				break;
			case 'bandpass':
				filterNode.frequency.value = 1000; // Center at 1kHz
				filterNode.Q.value = 2; // Moderate bandwidth
				break;
			case 'notch':
				filterNode.frequency.value = 1000; // Notch at 1kHz
				filterNode.Q.value = 10; // Narrow notch
				break;
		}

		// Connect nodes
		audioManager.source.connect(filterNode);
		filterNode.connect(audioManager.audioContext.destination);

		// Start audio
		audioManager.startSource();
	}

	function stopExercise() {
		audioManager.stop();
		if (filterNode) {
			try {
				filterNode.disconnect();
			} catch (error) {
				console.warn('Error disconnecting filter node:', error);
			}
			filterNode = null;
		}
	}

	function resetResult() {
		selectedFilter = null;
	}

	function selectFilter(type: FilterType) {
		if (!isAudioPlaying) return;

		selectedFilter = type;

		// Check if correct
		const isCorrect = type === currentFilterType;
		const points = isCorrect ? 100 : 0;

		// Create result
		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: filterTypes.indexOf(currentFilterType),
			userGuess: filterTypes.indexOf(type)
		};

		// Generate result message
		if (isCorrect) {
			result.additionalData = {
				message: `Correct! It was a ${filterLabels[currentFilterType]} filter (+${points} points)`
			};
		} else {
			result.additionalData = {
				message: `Incorrect. It was ${filterLabels[currentFilterType]}, not ${filterLabels[type]}`
			};
		}

		// Stop audio
		stopExercise();

		// Submit result to game manager
		game.manager.submitRound(result);
	}

	function skipRound() {
		const result: RoundResult = {
			correct: false,
			points: 0,
			actualValue: filterTypes.indexOf(currentFilterType),
			userGuess: -1,
			additionalData: {
				message: `Skipped. It was ${filterLabels[currentFilterType]}`
			}
		};

		stopExercise();
		game.manager.submitRound(result);
		resetResult();
	}

	function continueToNext() {
		game.manager.startNextRound();
		resetResult();
	}

	function playAgain() {
		game.manager.startNewGame();
		game.resetRoundHistory();
	}

	// Auto-start next round - removed auto-play, user must click Play button
	$effect(() => {
		if (
			game.gameState.gameStarted &&
			!game.gameState.gameCompleted &&
			!game.gameState.showResult &&
			game.gameState.currentRound > 0 &&
			!filterNode
		) {
			// Setup for new round but don't auto-play
			// User will click Play button to start
			selectedFilter = null;
			currentFilterType = filterTypes[Math.floor(Math.random() * filterTypes.length)];
		}
	});
</script>

<svelte:head>
	<title>Filter Expert - Audio Training</title>
	<meta
		name="description"
		content="Train your ears to identify different types of audio filters"
	/>
</svelte:head>

<!-- Player Bar -->
<PlayerBar
	userProgress={game.userProgress}
	showXPNotification={game.showXPNotification}
	xpEarned={game.xpEarned}
	leveledUp={game.leveledUp}
	newLevel={game.newLevel}
/>

<!-- Toast Container -->
<ToastContainer bind:this={toastContainer} />

<!-- Game Container -->
<GameContainer
	title="🎛️ Filter Expert"
	description="Identify different types of audio filters"
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	{#if !game.gameState.gameStarted}
		<!-- Instructions -->
		<div class="text-center">
			<div class="mb-6 text-6xl">🎚️</div>
			<h2 class="mb-4 text-2xl font-bold">How to Play</h2>
			<div class="mx-auto max-w-2xl space-y-3 text-left text-lg text-indigo-100">
				<p>• Click Play to hear the filtered audio sample</p>
				<p>• Identify which type of filter is being applied</p>
				<p>
					• <strong>Low Pass:</strong> Removes high frequencies (sounds darker/muffled)
				</p>
				<p>
					• <strong>High Pass:</strong> Removes low frequencies (sounds thinner/brighter)
				</p>
				<p>
					• <strong>Band Pass:</strong> Keeps only middle frequencies (sounds hollow/telephonic)
				</p>
				<p>
					• <strong>Notch:</strong> Removes a specific frequency band (subtle scoop in sound)
				</p>
			</div>
			<p class="mt-6 text-sm text-indigo-300">💡 Tip: Use headphones for best results</p>
		</div>

		<!-- Start Button -->
		<div class="mt-8">
			<GameControls
				gameState={game.gameState}
				onStartGame={startGame}
				onSkipRound={skipRound}
			/>
		</div>
	{:else if game.gameState.gameCompleted}
		<!-- Score Screen -->
		<ScoreScreen
			gameState={game.gameState}
			roundHistory={game.roundHistory}
			onPlayAgain={playAgain}
		/>
	{:else}
		<!-- Game Controls -->
		<div class="mb-8">
			<GameControls
				gameState={game.gameState}
				onStartGame={startGame}
				onSkipRound={skipRound}
			/>
		</div>

		{#if game.gameState.showResult}
			<!-- Result Display -->
			<div class="text-center">
				<div class="mb-6 text-6xl">
					{#if game.roundHistory[game.roundHistory.length - 1]?.correct}
						✅
					{:else}
						❌
					{/if}
				</div>
				<h2 class="mb-4 text-3xl font-bold">
					{game.roundHistory[game.roundHistory.length - 1]?.additionalData?.message || ''}
				</h2>
				<button
					onclick={continueToNext}
					class="rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold transition-colors hover:bg-purple-500"
				>
					Continue
				</button>
			</div>
		{:else}
			<!-- Filter Selection -->
			<div class="text-center">
				<h2 class="mb-6 text-2xl font-bold">Which filter is being applied?</h2>

				<!-- Play/Stop Controls -->
				<div class="mb-6 flex justify-center gap-4">
					{#if !isAudioPlaying}
						<button
							onclick={startExercise}
							class="rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold transition-colors hover:bg-purple-500"
						>
							▶️ Play
						</button>
					{:else}
						<button
							onclick={stopExercise}
							class="rounded-lg bg-slate-700 px-8 py-3 text-lg font-semibold transition-colors hover:bg-slate-600"
						>
							⏹️ Stop
						</button>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#each filterTypes as type}
						<button
							onclick={() => selectFilter(type)}
							disabled={!isAudioPlaying || selectedFilter !== null}
							class="group relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-200 {selectedFilter ===
							type
								? 'scale-105 border-purple-400 bg-purple-600/50'
								: 'border-purple-500/30 bg-slate-800/50 hover:border-purple-400 hover:bg-purple-900/30'} disabled:cursor-not-allowed disabled:opacity-50"
						>
							<div class="relative z-10">
								<div class="mb-2 text-3xl">
									{filterLabels[type].split(' ')[0]}
								</div>
								<h3 class="mb-2 text-xl font-bold">
									{filterLabels[type].substring(3)}
								</h3>
								<p class="text-sm text-indigo-200">
									{filterDescriptions[type]}
								</p>
							</div>

							<!-- Hover effect -->
							<div
								class="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 transition-all group-hover:from-indigo-500/10 group-hover:to-purple-500/10"
							></div>
						</button>
					{/each}
				</div>

				{#if !isAudioPlaying}
					<p class="mt-6 text-slate-300">
						🎵 Click the Play button above to hear the filtered audio
					</p>
				{/if}
			</div>
		{/if}

		<!-- Progress Indicator -->
		<div class="mt-6 text-center text-sm text-indigo-300">
			Round {game.gameState.currentRound} of {game.gameState.totalRounds} • Score: {game
				.gameState.score}
		</div>
	{/if}
</GameContainer>

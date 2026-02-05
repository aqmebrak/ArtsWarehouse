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

	let eqNode: BiquadFilterNode | null = null;
	let currentFrequency: number = 0;
	let selectedFrequency = $state<number | null>(null);
	let toastContainer: ToastContainer;

	// Initialize managers
	const audioManager = new AudioManager();
	const game = createGameManager({
		exerciseId: 'bass-detective',
		difficulty: 'beginner'
	});

	// Bind toast container
	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});

	let isAudioPlaying = $derived(audioManager.isPlaying);

	// Bass frequency options (50-400 Hz)
	const frequencies = [50, 60, 80, 100, 125, 160, 200, 250, 315, 400];
	const frequencyLabels: Record<number, string> = {
		50: '50 Hz - Sub Bass',
		60: '60 Hz - Deep Bass',
		80: '80 Hz - Bass Kick',
		100: '100 Hz - Bass Body',
		125: '125 Hz - Bass Punch',
		160: '160 Hz - Bass Clarity',
		200: '200 Hz - Upper Bass',
		250: '250 Hz - Low Mids',
		315: '315 Hz - Mid Bass',
		400: '400 Hz - Bass/Mid Transition'
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
		startExercise();
	}

	function startExercise() {
		if (!audioManager.audioContext) {
			console.error('AudioContext not initialized');
			return;
		}

		stopExercise();
		selectedFrequency = null;

		// Random bass frequency
		currentFrequency = frequencies[Math.floor(Math.random() * frequencies.length)];

		// Create audio source
		audioManager.createSource();

		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		// Resume audio context
		audioManager.resumeIfSuspended();

		// Create peaking EQ filter with bass boost
		eqNode = audioManager.audioContext.createBiquadFilter();
		eqNode.type = 'peaking';
		eqNode.frequency.value = currentFrequency;
		eqNode.gain.value = 12; // +12dB boost
		eqNode.Q.value = 1.5; // Moderate Q

		// Connect nodes
		audioManager.source.connect(eqNode);
		eqNode.connect(audioManager.audioContext.destination);

		// Start audio
		audioManager.startSource();
	}

	function stopExercise() {
		audioManager.stop();
		if (eqNode) {
			try {
				eqNode.disconnect();
			} catch (error) {
				console.warn('Error disconnecting EQ node:', error);
			}
			eqNode = null;
		}
	}

	function resetResult() {
		selectedFrequency = null;
	}

	function selectFrequency(freq: number) {
		if (!isAudioPlaying) return;
		if (selectedFrequency !== null) return;

		selectedFrequency = freq;

		// Check if correct (allow some tolerance)
		const isCorrect = freq === currentFrequency;
		const points = isCorrect ? 100 : 0;

		// Create result
		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: currentFrequency,
			userGuess: freq
		};

		// Generate result message
		if (isCorrect) {
			result.additionalData = {
				message: `Correct! It was ${currentFrequency} Hz (+${points} points)`
			};
		} else {
			result.additionalData = {
				message: `Incorrect. It was ${currentFrequency} Hz, not ${freq} Hz`
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
			actualValue: currentFrequency,
			userGuess: -1,
			additionalData: {
				message: `Skipped. It was ${currentFrequency} Hz`
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

	// Auto-start next round
	$effect(() => {
		if (
			game.gameState.gameStarted &&
			!game.gameState.gameCompleted &&
			!game.gameState.showResult &&
			game.gameState.currentRound > 0 &&
			!eqNode // Only start if not already initialized
		) {
			startExercise();
		}
	});
</script>

<svelte:head>
	<title>Bass Detective - Audio Training</title>
	<meta name="description" content="Train your ears to identify boosted bass frequencies" />
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
	title="🔊 Bass Detective"
	description="Identify the boosted bass frequency"
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	{#if !game.gameState.gameStarted}
		<!-- Instructions -->
		<div class="text-center">
			<div class="mb-6 text-6xl">🎚️</div>
			<h2 class="mb-4 text-2xl font-bold">How to Play</h2>
			<div class="mx-auto max-w-2xl space-y-3 text-left text-lg text-slate-200">
				<p>• Listen to the audio sample with a bass frequency boost</p>
				<p>• Identify which frequency is being boosted (+12dB)</p>
				<p>• Choose from 10 bass frequency options (50-400 Hz)</p>
				<p>
					• <strong>Tip:</strong> Lower frequencies feel more in the chest, higher ones more
					in the ears
				</p>
			</div>
			<p class="mt-6 text-sm text-slate-300">
				💡 Use headphones or quality speakers with good bass response
			</p>
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
			<!-- Frequency Selection -->
			<div class="text-center">
				<h2 class="mb-6 text-2xl font-bold">Which frequency is boosted?</h2>

				<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
					{#each frequencies as freq}
						<button
							onclick={() => selectFrequency(freq)}
							disabled={!isAudioPlaying || selectedFrequency !== null}
							class="group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 {selectedFrequency ===
							freq
								? 'scale-105 border-purple-400 bg-purple-600/50'
								: 'border-purple-500/30 bg-slate-800/50 hover:border-purple-400 hover:bg-purple-900/30'} disabled:cursor-not-allowed disabled:opacity-50"
						>
							<div class="relative z-10">
								<h3 class="mb-1 text-xl font-bold">
									{freq} Hz
								</h3>
								<p class="text-sm text-slate-300">
									{frequencyLabels[freq].split(' - ')[1]}
								</p>
							</div>

							<!-- Hover effect -->
							<div
								class="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 transition-all group-hover:from-purple-500/10 group-hover:to-purple-500/10"
							></div>
						</button>
					{/each}
				</div>

				{#if !isAudioPlaying && !selectedFrequency}
					<p class="mt-6 text-slate-300">
						🎵 Audio will start automatically when the round begins
					</p>
				{/if}
			</div>
		{/if}

		<!-- Progress Indicator -->
		<div class="mt-6 text-center text-sm text-slate-300">
			Round {game.gameState.currentRound} of {game.gameState.totalRounds} • Score: {game
				.gameState.score}
		</div>
	{/if}
</GameContainer>

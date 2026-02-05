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

	let compressor: DynamicsCompressorNode | null = null;
	let correctAnswer: 'A' | 'B' = 'A';
	let selectedAnswer = $state<'A' | 'B' | null>(null);
	let currentlyPlaying = $state<'A' | 'B' | null>(null);
	let toastContainer: ToastContainer;

	// Initialize managers
	const audioManager = new AudioManager();
	const game = createGameManager({
		exerciseId: 'dr-compressor',
		difficulty: 'beginner'
	});

	// Bind toast container
	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});

	let isAudioPlaying = $derived(audioManager.isPlaying);

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

	function startExercise() {
		if (!audioManager.audioContext) {
			console.error('AudioContext not initialized');
			return;
		}

		stopExercise();
		selectedAnswer = null;
		currentlyPlaying = null;

		// Randomly decide which button gets compression
		correctAnswer = Math.random() < 0.5 ? 'A' : 'B';

		// Create audio source
		audioManager.createSource();

		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		// Resume audio context
		audioManager.resumeIfSuspended();

		// Create compressor with aggressive settings for easy detection
		compressor = audioManager.audioContext.createDynamicsCompressor();
		compressor.threshold.value = -30; // dB
		compressor.knee.value = 5;
		compressor.ratio.value = 12; // Heavy compression
		compressor.attack.value = 0.003; // 3ms - very fast
		compressor.release.value = 0.025; // 25ms - very fast
	}

	function playSound(choice: 'A' | 'B') {
		if (!audioManager.audioContext || !audioManager.source || !compressor) return;

		// Stop any currently playing audio
		audioManager.stop();

		// Resume audio context if suspended
		audioManager.resumeIfSuspended();

		// Create fresh source for each play
		audioManager.createSource();
		if (!audioManager.source) return;

		// Connect based on which button is pressed
		if (choice === correctAnswer) {
			// This one has compression
			audioManager.source.connect(compressor);
			compressor.connect(audioManager.audioContext.destination);
		} else {
			// This one is dry (no compression)
			audioManager.source.connect(audioManager.audioContext.destination);
		}

		// Start audio
		audioManager.startSource();
		currentlyPlaying = choice;
	}

	function stopSound() {
		audioManager.stop();
		currentlyPlaying = null;
	}

	function stopExercise() {
		audioManager.stop();
		currentlyPlaying = null;
		if (compressor) {
			try {
				compressor.disconnect();
			} catch (error) {
				console.warn('Error disconnecting compressor node:', error);
			}
			compressor = null;
		}
	}

	function resetResult() {
		selectedAnswer = null;
	}

	function submitGuess(guess: 'A' | 'B') {
		if (selectedAnswer !== null) return;

		selectedAnswer = guess;
		const isCorrect = guess === correctAnswer;
		const points = isCorrect ? 100 : 0;

		// Create result
		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: correctAnswer === 'A' ? 1 : 2,
			userGuess: guess === 'A' ? 1 : 2
		};

		// Generate result message
		if (isCorrect) {
			result.additionalData = {
				message: `Correct! Sound ${correctAnswer} had compression (+${points} points)`
			};
		} else {
			result.additionalData = {
				message: `Incorrect. Sound ${correctAnswer} was compressed, not ${guess}`
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
			actualValue: correctAnswer === 'A' ? 1 : 2,
			userGuess: -1,
			additionalData: {
				message: `Skipped. Sound ${correctAnswer} had compression`
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

	function startNewGame() {
		game.manager.startNewGame();
		game.resetRoundHistory();
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
			!compressor // Only start if not already initialized
		) {
			startExercise();
		}
	});
</script>

<svelte:head>
	<title>Dr. Compressor - Audio Training</title>
	<meta name="description" content="Identify which sound has more compression applied" />
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
	title="🎚️ Dr. Compressor"
	description="Identify which sound has more compression"
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	{#if !game.gameState.gameStarted}
		<!-- Instructions -->
		<div class="text-center">
			<div class="mb-6 text-6xl">🎛️</div>
			<h2 class="mb-4 text-2xl font-bold">How to Play</h2>
			<div class="mx-auto max-w-2xl space-y-3 text-left text-lg text-slate-200">
				<p>• Click buttons to listen to Sound A and Sound B</p>
				<p>• One sound has heavy compression applied</p>
				<p>• Compressed audio sounds more even and controlled</p>
				<p>• Choose which sound (A or B) has the compression</p>
				<p>
					• <strong>Tip:</strong> Listen for reduced dynamic range and pumping effect
				</p>
			</div>
			<p class="mt-6 text-sm text-slate-300">💡 Use headphones for best results</p>
		</div>

		<!-- Start Button -->
		<div class="mt-8">
			<GameControls
				gameState={game.gameState}
				onStartGame={startNewGame}
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
				onStartGame={startNewGame}
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
			<!-- A/B Comparison -->
			<div class="text-center">
				<h2 class="mb-6 text-2xl font-bold">Which sound has MORE compression?</h2>

				<div class="mb-6 flex justify-center gap-4">
					<button
						onclick={() => playSound('A')}
						disabled={selectedAnswer !== null}
						class="flex h-32 w-32 items-center justify-center rounded-xl border-2 text-3xl font-bold transition-all {currentlyPlaying ===
						'A'
							? 'scale-105 border-purple-400 bg-purple-600/50'
							: 'border-purple-500/30 bg-slate-800/50 hover:border-purple-400 hover:bg-purple-900/30'} disabled:cursor-not-allowed disabled:opacity-50"
					>
						A
					</button>

					<button
						onclick={() => playSound('B')}
						disabled={selectedAnswer !== null}
						class="flex h-32 w-32 items-center justify-center rounded-xl border-2 text-3xl font-bold transition-all {currentlyPlaying ===
						'B'
							? 'scale-105 border-purple-400 bg-purple-600/50'
							: 'border-purple-500/30 bg-slate-800/50 hover:border-purple-400 hover:bg-purple-900/30'} disabled:cursor-not-allowed disabled:opacity-50"
					>
						B
					</button>
				</div>

				{#if currentlyPlaying}
					<div class="mb-6 text-center">
						<button
							onclick={stopSound}
							class="rounded-lg bg-slate-700 px-6 py-2 font-semibold transition-colors hover:bg-slate-600"
						>
							⏹️ Stop
						</button>
					</div>
				{/if}

				<div class="flex justify-center gap-4">
					<button
						onclick={() => submitGuess('A')}
						disabled={selectedAnswer !== null}
						class="rounded-lg border-2 border-purple-500/50 bg-slate-800/50 px-8 py-3 font-semibold transition-all hover:scale-105 hover:border-purple-400 hover:bg-purple-900/30 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Choose A
					</button>

					<button
						onclick={() => submitGuess('B')}
						disabled={selectedAnswer !== null}
						class="rounded-lg border-2 border-purple-500/50 bg-slate-800/50 px-8 py-3 font-semibold transition-all hover:scale-105 hover:border-purple-400 hover:bg-purple-900/30 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Choose B
					</button>
				</div>
			</div>
		{/if}

		<!-- Progress Indicator -->
		<div class="mt-6 text-center text-sm text-slate-300">
			Round {game.gameState.currentRound} of {game.gameState.totalRounds} • Score: {game
				.gameState.score}
		</div>
	{/if}
</GameContainer>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import PlayerBar from '$lib/components/audio-training/PlayerBar.svelte';
	import GameContainer from '$lib/components/audio-training/GameContainer.svelte';
	import ToastContainer from '$lib/components/audio-training/ToastContainer.svelte';
	import XPBar from '$lib/components/audio-training/XPBar.svelte';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { createGameManager } from '$lib/utils/audio-training/game-manager-setup.svelte';
	import type { RoundResult } from '$lib/components/audio-training/types';

	// Audio state
	let gainNode = $state<GainNode | null>(null);
	let currentGainDB = $state(0); // Gain in dB (-12 to +12)
	let userGuess = $state<number | null>(null);
	let selectedButton = $state<number | null>(null);
	let showingModified = $state(true); // A/B toggle state (true = modified, false = original 0dB)
	let toastContainer: ToastContainer;

	// DB options for buttons (-12 to +12 in 2dB steps)
	const dbOptions = [-12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12];
	const MARGIN_ERROR = 2; // ±2dB tolerance for beginners

	// Initialize managers
	const audioManager = new AudioManager();
	const game = createGameManager({
		exerciseId: 'db-king',
		difficulty: 'beginner'
	});

	// Bind toast container
	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});

	let isAudioPlaying = $derived(audioManager.isPlaying);

	// Auto-start next round
	$effect(() => {
		if (
			game.gameState.gameStarted &&
			!game.gameState.gameCompleted &&
			!game.gameState.showResult &&
			game.gameState.currentRound > 0
		) {
			playNextRound();
		}
	});

	onMount(() => {
		(async () => {
			await audioManager.initialize();
		})();

		const handleVisibilityChange = () => {
			if (document.hidden) {
				stopExercise();
			}
		};

		const handleBeforeUnload = () => {
			stopExercise();
			audioManager.cleanup();
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	onDestroy(() => {
		stopExercise();
		audioManager.cleanup();
	});

	async function playNextRound() {
		userGuess = null;
		selectedButton = null;
		showingModified = true; // Start with modified version

		// Random gain between -12dB and +12dB
		currentGainDB = Math.floor(Math.random() * 25) - 12; // -12 to +12

		// Load audio and create source
		await audioManager.loadRandomSample();
		await audioManager.resumeIfSuspended();

		const source = audioManager.createSource();
		if (!source || !audioManager.audioContext) return;

		// Create gain node
		gainNode = audioManager.audioContext.createGain();

		// Convert dB to linear gain: gain = 10^(dB/20)
		const linearGain = Math.pow(10, currentGainDB / 20);
		gainNode.gain.setValueAtTime(linearGain, audioManager.audioContext.currentTime);

		// Connect: source -> gain -> destination
		source.connect(gainNode);
		gainNode.connect(audioManager.audioContext.destination);

		audioManager.startSource();
	}

	function toggleAB() {
		if (!gainNode || !audioManager.audioContext) return;

		showingModified = !showingModified;

		// Switch between modified gain and original (0dB = 1.0 linear gain)
		const targetGain = showingModified ? Math.pow(10, currentGainDB / 20) : 1.0;

		// Cancel any scheduled parameter changes
		gainNode.gain.cancelScheduledValues(audioManager.audioContext.currentTime);

		// Use linearRampToValueAtTime for precise, smooth transition
		const now = audioManager.audioContext.currentTime;
		const rampDuration = 0.05; // 50ms smooth transition

		// Set current value first (required before ramp)
		gainNode.gain.setValueAtTime(gainNode.gain.value, now);

		// Ramp to target value
		gainNode.gain.linearRampToValueAtTime(targetGain, now + rampDuration);
	}

	function selectDB(db: number) {
		if (!game.gameState.gameStarted || game.gameState.showResult) return;

		userGuess = db;
		selectedButton = db;
		submitGuess();
	}

	function submitGuess() {
		if (userGuess === null) return;

		const difference = Math.abs(userGuess - currentGainDB);
		const correct = difference <= MARGIN_ERROR;
		const points = correct ? Math.max(100 - difference * 10, 50) : 0;

		const result: RoundResult = {
			correct,
			points: Math.round(points),
			actualValue: currentGainDB,
			userGuess: userGuess
		};

		game.manager.submitRound(result);

		// Stop audio immediately for feedback
		stopExercise();
	}

	function skipRound() {
		game.manager.skipRound(
			currentGainDB,
			`The gain was ${currentGainDB > 0 ? '+' : ''}${currentGainDB}dB`
		);

		if (!game.gameState.gameCompleted) {
			setTimeout(() => {
				playNextRound();
			}, 2000);
		}
	}

	function stopExercise() {
		audioManager.stop();
		if (gainNode) {
			try {
				gainNode.disconnect();
			} catch (error) {
				console.warn('Error disconnecting gain node:', error);
			}
			gainNode = null;
		}
	}

	function startNewGame() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		playNextRound();
	}

	function playAgain() {
		game.manager.startNewGame();
		game.resetRoundHistory();
	}
</script>

<svelte:head>
	<title>DB King - Audio Training</title>
	<meta name="description" content="Train your ears to detect gain/level changes in dB" />
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
	title="📊 DB King"
	description="Identify the gain change applied to the audio. How many dB louder or quieter is it?"
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	{#if !game.gameState.gameStarted}
		<!-- Start Screen -->
		<div class="text-center">
			<div class="mb-6 text-6xl">🎚️</div>
			<h2 class="mb-4 text-2xl font-bold">Ready to Train Your Ears?</h2>
			<p class="mb-8 text-purple-200">
				Listen to the audio and identify how much gain (in dB) has been applied.
				<br />
				<span class="text-sm">Tolerance: ±{MARGIN_ERROR}dB</span>
			</p>
			<button
				onclick={startNewGame}
				class="rounded-lg bg-purple-600 px-8 py-3 font-semibold transition-all hover:scale-105 hover:bg-purple-700"
			>
				Start Exercise
			</button>
		</div>
	{:else if !game.gameState.gameCompleted}
		<!-- Active Game -->
		<GameControls
			gameState={game.gameState}
			onStartGame={startNewGame}
			onSkipRound={skipRound}
			showABToggle={true}
			abState={showingModified}
			onABToggle={toggleAB}
		/>

		<div class="my-8">
			<!-- A/B Status Indicator -->
			<div class="mb-6 flex justify-center">
				<div
					class="inline-flex items-center gap-3 rounded-lg px-4 py-2 {showingModified
						? 'bg-purple-600/30'
						: 'bg-slate-700/30'} border backdrop-blur-sm {showingModified
						? 'border-purple-500/50'
						: 'border-blue-500/50'}"
				>
					<span class="text-sm font-semibold">
						{showingModified ? '🎚️ Modified' : '🔊 Original (0dB)'}
					</span>
				</div>
			</div>

			<h3 class="mb-4 text-center text-xl font-semibold">
				How many dB has the gain changed?
			</h3>

			<!-- DB Selection Grid -->
			<div class="grid grid-cols-7 gap-3">
				{#each dbOptions as db}
					<button
						onclick={() => selectDB(db)}
						disabled={game.gameState.showResult}
						class="relative rounded-lg px-4 py-6 font-bold transition-all
							{selectedButton === db
							? 'scale-105 bg-purple-600 shadow-lg'
							: 'bg-slate-700 hover:scale-105 hover:bg-slate-600'}
							{game.gameState.showResult ? 'cursor-not-allowed opacity-50' : ''}
							{game.gameState.showResult && Math.abs(db - currentGainDB) <= MARGIN_ERROR
							? 'ring-4 ring-green-400'
							: ''}
						"
					>
						<div class="text-xl">
							{db > 0 ? '+' : ''}{db}
						</div>
						<div class="text-xs text-purple-200">dB</div>

						{#if game.gameState.showResult && db === currentGainDB}
							<div
								class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm"
							>
								✓
							</div>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Result Message -->
			{#if game.gameState.showResult}
				<div class="mt-6 text-center">
					<p
						class="text-xl font-semibold {userGuess !== null &&
						Math.abs(userGuess - currentGainDB) <= MARGIN_ERROR
							? 'text-green-400'
							: 'text-red-400'}"
					>
						{game.gameState.resultMessage}
					</p>
					<p class="mt-2 text-purple-200">
						Actual: {currentGainDB > 0 ? '+' : ''}{currentGainDB}dB
						{#if userGuess !== null}
							| Your guess: {userGuess > 0 ? '+' : ''}{userGuess}dB | Difference: {Math.abs(
								userGuess - currentGainDB
							).toFixed(1)}dB
						{/if}
					</p>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Score Screen -->
		<ScoreScreen
			gameState={game.gameState}
			roundHistory={game.roundHistory}
			onPlayAgain={playAgain}
			customStats={[
				{
					label: 'Within ±2dB',
					value: `${game.roundHistory.filter((r) => r.correct).length}/${game.gameState.totalRounds}`
				}
			]}
		/>

		<!-- XP Progress -->
		{#if game.userProgress}
			<div class="mt-6">
				<div class="rounded-lg bg-purple-800/30 p-6 backdrop-blur-sm">
					<h3 class="mb-4 text-center text-lg font-semibold">Your Progress</h3>
					<XPBar totalXP={game.userProgress.profile.totalXP} showDetails={true} />
				</div>
			</div>
		{/if}
	{/if}

	<!-- Debug Panel (Development only) -->
	{#if game.gameState.gameStarted && !game.gameState.gameCompleted && gainNode && import.meta.env.DEV}
		<div
			class="mt-6 rounded-lg border border-purple-500/50 bg-purple-900/20 p-4 backdrop-blur-sm"
		>
			<h4 class="mb-2 text-xs font-semibold text-yellow-300 uppercase">🔧 Debug Info</h4>
			<div class="grid grid-cols-2 gap-2 font-mono text-xs text-yellow-200">
				<div>Current State:</div>
				<div>{showingModified ? 'Modified' : 'Original'}</div>

				<div>Target Gain:</div>
				<div>{showingModified ? currentGainDB : 0}dB</div>

				<div>Linear Gain:</div>
				<div>{gainNode.gain.value.toFixed(4)}</div>

				<div>Actual dB:</div>
				<div>{(20 * Math.log10(gainNode.gain.value)).toFixed(2)}dB</div>

				<div>Expected dB:</div>
				<div>{showingModified ? currentGainDB : 0}dB</div>

				<div>Difference:</div>
				<div
					class={Math.abs(
						20 * Math.log10(gainNode.gain.value) - (showingModified ? currentGainDB : 0)
					) < 0.1
						? 'text-green-400'
						: 'text-red-400'}
				>
					{Math.abs(
						20 * Math.log10(gainNode.gain.value) - (showingModified ? currentGainDB : 0)
					).toFixed(3)}dB
				</div>
			</div>
			<p class="mt-2 text-xs text-yellow-300/80">
				If "Difference" is &lt; 0.1dB, A/B toggle is working correctly ✓
			</p>
		</div>
	{/if}

	<!-- Instructions -->
	<div class="mt-6 rounded-lg bg-slate-800/30 p-6 backdrop-blur-sm">
		<h3 class="mb-3 text-lg font-semibold">💡 How to Play</h3>
		<ul class="space-y-2 text-sm text-purple-200">
			<li>• Listen to the audio sample with the modified gain</li>
			<li>• Use the A/B toggle button to compare between modified and original (0dB)</li>
			<li>• Click the dB button that matches the gain change you hear</li>
			<li>
				• Positive values (+dB) = louder, Negative values (-dB) = quieter, 0dB = no change
			</li>
			<li>• You have ±{MARGIN_ERROR}dB tolerance to get points</li>
			<li>• The closer you are, the more points you earn!</li>
		</ul>
	</div>
</GameContainer>

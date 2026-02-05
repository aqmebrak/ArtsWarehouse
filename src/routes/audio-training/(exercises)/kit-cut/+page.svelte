<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import PlayerBar from '$lib/components/audio-training/PlayerBar.svelte';
	import GameContainer from '$lib/components/audio-training/GameContainer.svelte';
	import ToastContainer from '$lib/components/audio-training/ToastContainer.svelte';
	import sampleFiles from '$lib/audio-training/samples';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { createGameManager } from '$lib/utils/audio-training/game-manager-setup.svelte';
	import type { RoundResult } from '$lib/components/audio-training/types';
	import type { GameSession } from '$lib/types/audio-training';

	let toastContainer: ToastContainer;

	const game = createGameManager({
		exerciseId: 'kit-cut',
		difficulty: 'beginner',
		onGameComplete: (session: GameSession) => {
			console.log('Game completed!', session);
		}
	});

	// Bind toast container
	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});

	// Audio state
	let lowCutFilter: BiquadFilterNode | null = null;
	let highCutFilter: BiquadFilterNode | null = null;
	let currentCutRange = $state<string>('');
	let userGuess = $state<string | null>(null);
	let showingFiltered = $state(true); // A/B toggle state

	// Frequency ranges for kit cutting
	const frequencyRanges = [
		{ id: 'sub-bass', label: 'Sub Bass (20-60 Hz)', low: 20, high: 60, icon: '🔊' },
		{ id: 'bass', label: 'Bass (60-250 Hz)', low: 60, high: 250, icon: '🎸' },
		{ id: 'low-mid', label: 'Low Mid (250-500 Hz)', low: 250, high: 500, icon: '🎹' },
		{ id: 'mid', label: 'Mid (500-2k Hz)', low: 500, high: 2000, icon: '🎺' },
		{ id: 'high-mid', label: 'High Mid (2k-6k Hz)', low: 2000, high: 6000, icon: '🎤' },
		{ id: 'high', label: 'High (6k-20k Hz)', low: 6000, high: 20000, icon: '✨' }
	];

	// Initialize managers
	const audioManager = new AudioManager();

	let isAudioPlaying = $derived(audioManager.isPlaying);

	onMount(() => {
		(async () => {
			await audioManager.initialize();
			await loadRandomSample();
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

	async function loadRandomSample() {
		try {
			if (!audioManager.audioContext || sampleFiles.length === 0) return;

			// Prefer drum samples for this exercise
			const drumSamples = sampleFiles.filter(
				(path) => path.includes('drum') || path.includes('beat')
			);
			const samples = drumSamples.length > 0 ? drumSamples : sampleFiles;
			const samplePath = samples[Math.floor(Math.random() * samples.length)];

			const response = await fetch(samplePath);
			if (!response.ok) {
				throw new Error(`Failed to load sample: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			audioManager.audioBuffer = await audioManager.audioContext.decodeAudioData(arrayBuffer);
		} catch (error) {
			console.error('Failed to load sample:', error);
			await audioManager.generatePinkNoise();
		}
	}

	function generateRandomCut() {
		const range = frequencyRanges[Math.floor(Math.random() * frequencyRanges.length)];
		currentCutRange = range.id;
		return range;
	}

	async function startExercise() {
		if (!audioManager.audioContext || !audioManager.audioBuffer) {
			await audioManager.initialize();
			await loadRandomSample();
		} else {
			await audioManager.resumeIfSuspended();
		}

		const cutRange = generateRandomCut();
		userGuess = null;

		// Create audio source
		audioManager.source = audioManager.createSource();
		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		// Create bandstop filter (notch out the frequency range)
		lowCutFilter = audioManager.audioContext!.createBiquadFilter();
		highCutFilter = audioManager.audioContext!.createBiquadFilter();

		// Configure filters to create a notch
		lowCutFilter.type = 'highpass';
		lowCutFilter.frequency.setValueAtTime(
			cutRange.high,
			audioManager.audioContext!.currentTime
		);
		lowCutFilter.Q.setValueAtTime(0.7, audioManager.audioContext!.currentTime);

		highCutFilter.type = 'lowpass';
		highCutFilter.frequency.setValueAtTime(
			cutRange.low,
			audioManager.audioContext!.currentTime
		);
		highCutFilter.Q.setValueAtTime(0.7, audioManager.audioContext!.currentTime);

		// Connect: source -> lowCut -> highCut -> destination (creates notch)
		audioManager.source.connect(lowCutFilter);
		lowCutFilter.connect(highCutFilter);
		highCutFilter.connect(audioManager.audioContext!.destination);

		audioManager.startSource();
	}

	function stopExercise() {
		audioManager.stop();
		if (lowCutFilter) {
			try {
				lowCutFilter.disconnect();
			} catch (e) {
				console.warn('Error disconnecting low cut filter:', e);
			}
			lowCutFilter = null;
		}
		if (highCutFilter) {
			try {
				highCutFilter.disconnect();
			} catch (e) {
				console.warn('Error disconnecting high cut filter:', e);
			}
			highCutFilter = null;
		}
	}

	function toggleAB() {
		if (!audioManager.source || !audioManager.audioContext) return;

		showingFiltered = !showingFiltered;

		// Reconnect audio graph
		audioManager.source.disconnect();

		if (showingFiltered && lowCutFilter && highCutFilter) {
			// Filtered: apply notch
			audioManager.source.connect(lowCutFilter);
			lowCutFilter.connect(highCutFilter);
			highCutFilter.connect(audioManager.audioContext.destination);
		} else {
			// Original: bypass filters
			audioManager.source.connect(audioManager.audioContext.destination);
		}
	}

	function submitGuess(rangeId: string) {
		if (!isAudioPlaying) return;

		userGuess = rangeId;
		const isCorrect = rangeId === currentCutRange;
		const points = isCorrect ? 100 : 0;

		const correctRange = frequencyRanges.find((r) => r.id === currentCutRange);
		const guessedRange = frequencyRanges.find((r) => r.id === rangeId);

		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: 0,
			userGuess: 0,
			additionalData: {
				correctRange: correctRange?.label,
				guessedRange: guessedRange?.label,
				message: isCorrect
					? `Correct! The cut was in ${correctRange?.label} (+${points} points)`
					: `Incorrect. The cut was in ${correctRange?.label}, not ${guessedRange?.label} (+${points} points)`
			}
		};

		stopExercise();
		game.manager.submitRound(result);
	}

	function startNewGame() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		showingFiltered = true;
		startExercise();
	}

	function skipRound() {
		const correctRange = frequencyRanges.find((r) => r.id === currentCutRange);
		const message = `Skipped! The cut was in ${correctRange?.label}`;
		stopExercise();
		game.manager.skipRound(0, message);
	}

	function playAgain() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		showingFiltered = true;
		loadRandomSample();
	}

	// Auto-start next round
	$effect(() => {
		if (
			game.gameState.gameStarted &&
			!game.gameState.gameCompleted &&
			!game.gameState.showResult &&
			game.gameState.currentRound > 0
		) {
			loadRandomSample().then(() => startExercise());
		}
	});
</script>

<svelte:head>
	<title>Kit Cut - Audio Training</title>
	<meta name="description" content="Identify which frequency range is being cut from the audio" />
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
	title="🎛️ Kit Cut"
	description="Listen carefully and identify which frequency range has been removed"
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	<!-- Game Controls -->
	<GameControls
		gameState={game.gameState}
		showABToggle={true}
		abState={!showingFiltered}
		onStartGame={startNewGame}
		onSkipRound={skipRound}
		onABToggle={toggleAB}
	>
		{#snippet startButton()}Start 10-Round Challenge{/snippet}
	</GameControls>

	<!-- Frequency Range Buttons -->
	{#if isAudioPlaying && !game.gameState.showResult}
		<section class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold">Which frequency range is cut?</h3>

			<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
				{#each frequencyRanges as range}
					<button
						onclick={() => submitGuess(range.id)}
						class="rounded-lg border-2 border-purple-500/50 bg-slate-800/50 p-4 text-center transition-all hover:scale-105 hover:border-purple-400 hover:bg-purple-900/30 active:scale-95"
					>
						<div class="mb-2 text-3xl">{range.icon}</div>
						<div class="text-sm font-semibold text-slate-200">{range.label}</div>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Result Display -->
	{#if game.gameState.showResult && userGuess}
		<section class="mb-8 text-center">
			<div
				class="mx-auto max-w-md rounded-xl border p-6 {game.gameState.resultMessage.includes(
					'Correct'
				)
					? 'border-purple-500/50 bg-purple-900/30'
					: 'border-slate-500/50 bg-slate-800/30'}"
			>
				<p class="text-lg font-semibold">
					{game.gameState.resultMessage}
				</p>
			</div>
		</section>
	{/if}

	<!-- Score Screen -->
	{#if game.gameState.gameCompleted}
		<ScoreScreen
			gameState={game.gameState}
			roundHistory={game.roundHistory}
			onPlayAgain={playAgain}
			customStats={[
				{
					label: 'Perfect Identifications',
					value: `${game.roundHistory.filter((r) => r.points === 100).length}/${game.gameState.totalRounds}`
				},
				{
					label: 'Accuracy',
					value: `${Math.round((game.roundHistory.filter((r) => r.correct).length / game.gameState.totalRounds) * 100)}%`
				}
			]}
		/>
	{/if}

	<!-- Audio Status -->
	{#if isAudioPlaying}
		<section class="text-center">
			<div
				class="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-600/20 px-4 py-2 text-green-200"
			>
				<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
				<span>Audio Playing - {showingFiltered ? 'Filtered' : 'Original'}</span>
			</div>
		</section>
	{/if}

	<!-- Instructions -->
	<section class="mt-8 rounded-lg border border-purple-500/30 bg-purple-900/10 p-6">
		<h3 class="mb-3 text-lg font-semibold text-purple-200">How to Play</h3>
		<ul class="space-y-2 text-sm text-slate-300">
			<li>🎧 Listen to the audio with a frequency range cut out</li>
			<li>🔄 Use the A/B toggle to compare filtered vs. original</li>
			<li>🎯 Select which frequency range you think was removed</li>
			<li>💡 Pay attention to what's missing, not what's there</li>
		</ul>
	</section>
</GameContainer>

<style>
	:global(body) {
		font-family: 'Inter', sans-serif;
		color: white !important;
	}
</style>

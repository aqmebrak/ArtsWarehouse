<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { t } from '$lib/i18n';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import InteractiveCanvas from '$lib/components/audio-training/InteractiveCanvas.svelte';
	import EQBandControl from '$lib/components/audio-training/EQBandControl.svelte';
	import PlayerBar from '$lib/components/audio-training/PlayerBar.svelte';
	import GameContainer from '$lib/components/audio-training/GameContainer.svelte';
	import ToastContainer from '$lib/components/audio-training/ToastContainer.svelte';
	import sampleFiles from '$lib/audio-training/samples';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { createGameManager } from '$lib/utils/audio-training/game-manager-setup.svelte';
	import type { RoundResult } from '$lib/components/audio-training/types';
	import type { GameSession } from '$lib/types/audio-training';
	import { EQUtils } from '$lib/utils/audio-training/eq-utils';
	import { FrequencyUtils } from '$lib/utils/audio-training/frenquency-utils';

	let toastContainer: ToastContainer;

	const game = createGameManager({
		exerciseId: 'eq-mirror',
		difficulty: 'beginner',
		onGameComplete: (session: GameSession) => {
			console.log('Game completed!', session);
		}
	});

	// Override totalRounds to 5 for this exercise
	game.gameState.totalRounds = 5;

	// Bind toast container
	$effect(() => {
		if (toastContainer) {
			game.setToastContainer(toastContainer);
		}
	});

	let canvas = $state<InteractiveCanvas>();
	let gainNode: GainNode | null;
	let eqFilters: BiquadFilterNode[] = [];
	let targetFilters: BiquadFilterNode[] = [];
	let showTarget = $state(false); // A/B comparison with target

	// EQ Parameters for 4 bands
	interface EQBand {
		frequency: number;
		gain: number;
		q: number;
	}

	let userEQ: EQBand[] = $state([
		{ frequency: 200, gain: 0, q: 1 },
		{ frequency: 800, gain: 0, q: 1 },
		{ frequency: 3200, gain: 0, q: 1 },
		{ frequency: 8000, gain: 0, q: 1 }
	]);

	let targetEQ: EQBand[] = $state([
		{ frequency: 200, gain: 0, q: 1 },
		{ frequency: 800, gain: 0, q: 1 },
		{ frequency: 3200, gain: 0, q: 1 },
		{ frequency: 8000, gain: 0, q: 1 }
	]);

	// Canvas settings
	const CANVAS_WIDTH = 800;
	const CANVAS_HEIGHT = 300;
	const MIN_FREQUENCY = 20;
	const MAX_FREQUENCY = 20000;

	// Initialize managers
	const audioManager = new AudioManager();

	// Create reactive derived state for audio playing status
	let isAudioPlaying = $derived(audioManager.isPlaying);

	onMount(() => {
		(async () => {
			await audioManager.initialize();
			await loadRandomSample();

			// Ensure canvas is ready before drawing
			setTimeout(() => {
				drawEQCurve();
			}, 100);
		})();

		// Handle page visibility changes and navigation
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

	function drawEQCurve() {
		if (!canvas) {
			console.warn('Canvas not initialized yet');
			return;
		}

		const ctx = canvas.getContext();
		if (!ctx) {
			console.warn('Canvas context not available');
			return;
		}

		canvas.clear();
		canvas.drawBackground();

		// Grid lines
		ctx.strokeStyle = '#374151';
		ctx.lineWidth = 1;

		// Frequency grid (logarithmic)
		const majorFreqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
		majorFreqs.forEach((freq) => {
			if (freq >= MIN_FREQUENCY && freq <= MAX_FREQUENCY) {
				const x = FrequencyUtils.freqToX(freq, CANVAS_WIDTH, MIN_FREQUENCY, MAX_FREQUENCY);
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, CANVAS_HEIGHT);
				ctx.stroke();
			}
		});

		// Gain grid (linear)
		for (let gain = -12; gain <= 12; gain += 3) {
			const y = EQUtils.gainToY(gain, CANVAS_HEIGHT);
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(CANVAS_WIDTH, y);
			ctx.stroke();
		}

		// 0dB line
		ctx.strokeStyle = '#fbbf24';
		ctx.lineWidth = 2;
		const zeroY = EQUtils.gainToY(0, CANVAS_HEIGHT);
		ctx.beginPath();
		ctx.moveTo(0, zeroY);
		ctx.lineTo(CANVAS_WIDTH, zeroY);
		ctx.stroke();

		// Draw frequency response curves
		drawResponseCurve(showTarget ? targetEQ : userEQ, showTarget ? '#ef4444' : '#10b981', 3);

		// If showing target, also draw user curve with transparency
		if (showTarget) {
			ctx.globalAlpha = 0.5;
			drawResponseCurve(userEQ, '#10b981', 2);
			ctx.globalAlpha = 1.0;
		}

		// Draw frequency labels
		ctx.fillStyle = '#e5e7eb';
		ctx.font = '12px Inter, sans-serif';
		ctx.textAlign = 'center';

		majorFreqs.forEach((freq) => {
			if (freq >= MIN_FREQUENCY && freq <= MAX_FREQUENCY) {
				const x = FrequencyUtils.freqToX(freq, CANVAS_WIDTH, MIN_FREQUENCY, MAX_FREQUENCY);
				let label = freq < 1000 ? `${freq}` : `${freq / 1000}k`;
				ctx.fillText(label, x, CANVAS_HEIGHT - 5);
			}
		});

		// Draw gain labels
		ctx.textAlign = 'right';
		for (let gain = -12; gain <= 12; gain += 6) {
			const y = EQUtils.gainToY(gain, CANVAS_HEIGHT);
			ctx.fillText(`${gain > 0 ? '+' : ''}${gain}dB`, CANVAS_WIDTH - 5, y - 5);
		}
	}

	function drawResponseCurve(eqBands: EQBand[], color: string, lineWidth: number) {
		if (!canvas) return;
		const ctx = canvas.getContext();
		if (!ctx) return;

		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();

		for (let x = 0; x <= CANVAS_WIDTH; x += 2) {
			const freq = FrequencyUtils.xToFreq(x, CANVAS_WIDTH, MIN_FREQUENCY, MAX_FREQUENCY);
			const totalGain = EQUtils.calculateTotalGain(freq, eqBands);
			const y = EQUtils.gainToY(totalGain, CANVAS_HEIGHT);

			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}

		ctx.stroke();
	}

	async function loadRandomSample() {
		try {
			if (!audioManager.audioContext || sampleFiles.length === 0) return;

			const currentSampleIndex = Math.floor(Math.random() * sampleFiles.length);
			const samplePath = sampleFiles[currentSampleIndex];

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

	function generateRandomTargetEQ() {
		// Generate a random but musical EQ curve
		const eqPresets = [
			// V-shape
			[
				{ frequency: 200, gain: 3, q: 1 },
				{ frequency: 800, gain: -2, q: 1.4 },
				{ frequency: 3200, gain: -1, q: 1 },
				{ frequency: 8000, gain: 4, q: 1 }
			],
			// Warm sound
			[
				{ frequency: 200, gain: 2, q: 0.7 },
				{ frequency: 800, gain: 1, q: 1 },
				{ frequency: 3200, gain: -1, q: 1.4 },
				{ frequency: 8000, gain: -2, q: 1 }
			],
			// Bright sound
			[
				{ frequency: 200, gain: -1, q: 1 },
				{ frequency: 800, gain: 0, q: 1 },
				{ frequency: 3200, gain: 2, q: 1.4 },
				{ frequency: 8000, gain: 3, q: 1 }
			],
			// Mid scoop
			[
				{ frequency: 200, gain: 1, q: 1 },
				{ frequency: 800, gain: -3, q: 2 },
				{ frequency: 3200, gain: -2, q: 1.4 },
				{ frequency: 8000, gain: 2, q: 1 }
			]
		];

		targetEQ = eqPresets[Math.floor(Math.random() * eqPresets.length)];
	}

	async function startExercise() {
		if (!audioManager.audioContext || !audioManager.audioBuffer) {
			await audioManager.initialize();
			await loadRandomSample();
		} else {
			await audioManager.resumeIfSuspended();
		}

		generateRandomTargetEQ();
		resetUserEQ();

		// Create audio nodes
		audioManager.source = audioManager.createSource();
		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		gainNode = audioManager.audioContext!.createGain();

		// Create EQ filters
		eqFilters = [];
		targetFilters = [];

		for (let i = 0; i < 4; i++) {
			// User EQ filters
			const userFilter = audioManager.audioContext!.createBiquadFilter();
			userFilter.type = 'peaking';
			userFilter.frequency.setValueAtTime(
				userEQ[i].frequency,
				audioManager.audioContext!.currentTime
			);
			userFilter.gain.setValueAtTime(userEQ[i].gain, audioManager.audioContext!.currentTime);
			userFilter.Q.setValueAtTime(userEQ[i].q, audioManager.audioContext!.currentTime);
			eqFilters.push(userFilter);

			// Target EQ filters (for A/B comparison)
			const targetFilter = audioManager.audioContext!.createBiquadFilter();
			targetFilter.type = 'peaking';
			targetFilter.frequency.setValueAtTime(
				targetEQ[i].frequency,
				audioManager.audioContext!.currentTime
			);
			targetFilter.gain.setValueAtTime(
				targetEQ[i].gain,
				audioManager.audioContext!.currentTime
			);
			targetFilter.Q.setValueAtTime(targetEQ[i].q, audioManager.audioContext!.currentTime);
			targetFilters.push(targetFilter);
		}

		// Connect user EQ chain by default
		connectUserEQ();

		// Start audio using AudioManager method
		audioManager.startSource();
		drawEQCurve();
	}

	function connectUserEQ() {
		if (!audioManager.source || !audioManager.audioContext || !gainNode) return;

		// Disconnect everything first
		audioManager.source.disconnect();
		eqFilters.forEach((filter) => filter.disconnect());
		targetFilters.forEach((filter) => filter.disconnect());

		// Connect user EQ chain
		let currentNode: AudioNode = audioManager.source;
		for (const filter of eqFilters) {
			currentNode.connect(filter);
			currentNode = filter;
		}
		currentNode.connect(gainNode);
		gainNode.connect(audioManager.audioContext.destination);
	}

	function connectTargetEQ() {
		if (!audioManager.source || !audioManager.audioContext || !gainNode) return;

		// Disconnect everything first
		audioManager.source.disconnect();
		eqFilters.forEach((filter) => filter.disconnect());
		targetFilters.forEach((filter) => filter.disconnect());

		// Connect target EQ chain
		let currentNode: AudioNode = audioManager.source;
		for (const filter of targetFilters) {
			currentNode.connect(filter);
			currentNode = filter;
		}
		currentNode.connect(gainNode);
		gainNode.connect(audioManager.audioContext.destination);
	}

	function resetUserEQ() {
		userEQ = [
			{ frequency: 200, gain: 0, q: 1 },
			{ frequency: 800, gain: 0, q: 1 },
			{ frequency: 3200, gain: 0, q: 1 },
			{ frequency: 8000, gain: 0, q: 1 }
		];
	}

	function stopExercise() {
		audioManager.stop();
		// Disconnect all EQ filters
		eqFilters.forEach((filter) => {
			try {
				filter.disconnect();
			} catch (error) {
				console.warn('Error disconnecting EQ filter:', error);
			}
		});
		targetFilters.forEach((filter) => {
			try {
				filter.disconnect();
			} catch (error) {
				console.warn('Error disconnecting target filter:', error);
			}
		});
		if (gainNode) {
			try {
				gainNode.disconnect();
			} catch (error) {
				console.warn('Error disconnecting gain node:', error);
			}
			gainNode = null;
		}
		eqFilters = [];
		targetFilters = [];
	}

	function submitGuess() {
		if (!isAudioPlaying) return;

		// Calculate accuracy based on how close user EQ is to target EQ
		let totalError = 0;
		let maxPossibleError = 0;

		for (let i = 0; i < 4; i++) {
			const freqError =
				Math.abs(userEQ[i].frequency - targetEQ[i].frequency) / targetEQ[i].frequency;
			const gainError = Math.abs(userEQ[i].gain - targetEQ[i].gain) / 12; // Max gain range is 24dB
			const qError = Math.abs(userEQ[i].q - targetEQ[i].q) / 8; // Max Q is around 8

			totalError += freqError + gainError + qError;
			maxPossibleError += 1 + 1 + 1; // Maximum possible error for each parameter
		}

		const accuracy = Math.max(0, 1 - totalError / maxPossibleError);
		const points = Math.round(accuracy * 100);
		const isCorrect = accuracy >= 0.8; // 80% accuracy threshold

		// Create result
		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: 0, // Not applicable for this exercise
			userGuess: 0, // Not applicable for this exercise
			additionalData: {
				accuracy: Math.round(accuracy * 100),
				targetEQ: [...targetEQ],
				userEQ: [...userEQ]
			}
		};

		if (isCorrect) {
			result.additionalData!.message = `Excellent match! ${Math.round(accuracy * 100)}% accuracy (+${points} points)`;
		} else {
			result.additionalData!.message = `Good attempt! ${Math.round(accuracy * 100)}% accuracy (+${points} points)`;
		}

		showTarget = true; // Show target for comparison
		stopExercise();
		game.manager.submitRound(result);
		drawEQCurve();
	}

	function updateEQBand(bandIndex: number, parameter: 'frequency' | 'gain' | 'q', value: number) {
		userEQ[bandIndex][parameter] = value;

		// Update the corresponding filter if playing
		if (eqFilters[bandIndex] && audioManager.audioContext) {
			if (parameter === 'frequency') {
				eqFilters[bandIndex].frequency.setValueAtTime(
					value,
					audioManager.audioContext.currentTime
				);
			} else if (parameter === 'gain') {
				eqFilters[bandIndex].gain.setValueAtTime(
					value,
					audioManager.audioContext.currentTime
				);
			} else if (parameter === 'q') {
				eqFilters[bandIndex].Q.setValueAtTime(value, audioManager.audioContext.currentTime);
			}
		}

		drawEQCurve();
	}

	function toggleTarget() {
		showTarget = !showTarget;

		if (isAudioPlaying) {
			if (showTarget) {
				connectTargetEQ();
			} else {
				connectUserEQ();
			}
		}

		drawEQCurve();
	}

	function startNewGame() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		showTarget = false;
		startExercise();
	}

	function skipRound() {
		const message = 'Round skipped! Target EQ revealed.';
		showTarget = true;
		stopExercise();
		game.manager.skipRound(0, message);
		drawEQCurve();
	}

	function playAgain() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		showTarget = false;
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
	<title>EQ Mirror - {$t('audioTraining.title')}</title>
	<meta
		name="description"
		content="Match the target EQ curve by adjusting the 4-band equalizer"
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
	title="EQ Mirror"
	description="Match the target EQ curve using the 4-band equalizer"
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	<!-- Game Controls -->
	<GameControls
		gameState={game.gameState}
		showABToggle={true}
		abState={showTarget}
		onStartGame={startNewGame}
		onSkipRound={skipRound}
		onABToggle={toggleTarget}
		customActions={isAudioPlaying && !game.gameState.showResult
			? [
					{
						label: 'Submit Match',
						onClick: submitGuess,
						variant: 'primary'
					}
				]
			: []}
	>
		{#snippet startButton()}Start 5-Round Challenge{/snippet}
	</GameControls>

	<!-- EQ Visualization -->
	<section class="mb-8">
		<h3 class="mb-4 text-center text-xl font-semibold">EQ Response Curve</h3>

		<div class="flex justify-center">
			<div class="relative">
				<InteractiveCanvas
					bind:this={canvas}
					width={CANVAS_WIDTH}
					height={CANVAS_HEIGHT}
					disabled={!isAudioPlaying}
				>
					{#snippet disabledOverlay()}Start the exercise to begin{/snippet}
				</InteractiveCanvas>
			</div>
		</div>

		<!-- Legend -->
		<div class="mt-4 flex justify-center gap-6 text-sm text-gray-300">
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded bg-green-500"></div>
				<span>Your EQ</span>
			</div>
			{#if showTarget}
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded bg-slate-400"></div>
					<span>Target EQ</span>
				</div>
			{/if}
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded bg-white"></div>
				<span>0dB Reference</span>
			</div>
		</div>
	</section>

	<!-- EQ Controls -->
	{#if isAudioPlaying && !game.gameState.showResult}
		<section class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold">4-Band Equalizer</h3>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{#each userEQ as band, i}
					<EQBandControl {band} bandIndex={i} onUpdate={updateEQBand} />
				{/each}
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
					label: 'Perfect Matches',
					value: `${game.roundHistory.filter((r) => r.points === 100).length}/${game.gameState.totalRounds}`
				},
				{
					label: 'Average Accuracy',
					value: `${Math.round(game.roundHistory.reduce((sum, r) => sum + (r.additionalData?.accuracy || 0), 0) / game.roundHistory.length)}%`
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
				<span>Audio Playing - {showTarget ? 'Target EQ' : 'Your EQ'}</span>
			</div>
		</section>
	{/if}
</GameContainer>

<style>
	:global(body) {
		font-family: 'Inter', sans-serif;
		color: white !important;
	}
</style>

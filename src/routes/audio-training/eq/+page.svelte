<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { t } from '$lib/i18n';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import InteractiveCanvas from '$lib/components/audio-training/InteractiveCanvas.svelte';
	import sampleFiles from '$lib/audio-training/samples';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { GameManager } from '$lib/components/audio-training/GameManager.svelte';
	import type { GameState, RoundResult } from '$lib/components/audio-training/types';
	import { CanvasUtils } from '$lib/utils/audio-training/canvas-utils';
	import { FrequencyUtils } from '$lib/utils/audio-training/frenquency-utils';
	import { ScoringUtils } from '$lib/utils/audio-training/scoring-utils';

	let canvas: InteractiveCanvas;
	let eqFilter: BiquadFilterNode | null;
	let highShelf: BiquadFilterNode | null;
	let lowShelf: BiquadFilterNode | null;
	let gainNode: GainNode | null;
	let eqBypass = $state(false); // A/B toggle state
	let currentFrequency = 0; // The boosted frequency in Hz
	let userGuess: number | null = null;
	let hoveredFrequency: string | null = null;
	let mouseX = 0;
	let mouseY = 0;

	// Game management
	let gameState: GameState = $state({
		currentRound: 0,
		totalRounds: 10,
		score: 0,
		gameCompleted: false,
		gameStarted: false,
		showResult: false,
		resultMessage: ''
	});
	let roundHistory: RoundResult[] = $state([]);

	const CANVAS_WIDTH = 800;
	const CANVAS_HEIGHT = 120;
	const MIN_FREQUENCY = 100; // Hz
	const MAX_FREQUENCY = 8000; // Hz
	const BASE_MARGIN_PERCENT = 0.15; // 15% margin for logarithmic scaling

	// Common frequencies for realistic EQ training
	const EQ_FREQUENCIES = [
		100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
		5000, 6300, 8000
	];

	// Initialize managers
	const audioManager = new AudioManager();
	const gameManager = new GameManager(
		10,
		(state) => {
			gameState = state;
		},
		(result) => {
			roundHistory = [...roundHistory, result];
		}
	);

	// Create reactive derived state for audio playing status
	let isAudioPlaying = $derived(audioManager.isPlaying);

	onMount(() => {
		(async () => {
			await audioManager.initialize();
			await loadRandomSample();

			// Ensure canvas is ready before drawing
			setTimeout(() => {
				drawFrequencySpectrum();
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

	function drawFrequencySpectrum() {
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

		// Grid lines for major frequencies
		const majorFreqs = [100, 200, 500, 1000, 2000, 5000, 8000];
		ctx.strokeStyle = '#374151';
		ctx.lineWidth = 1;

		majorFreqs.forEach((freq) => {
			const x = FrequencyUtils.freqToX(freq, CANVAS_WIDTH, MIN_FREQUENCY, MAX_FREQUENCY);
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, CANVAS_HEIGHT);
			ctx.stroke();
		});

		// Frequency labels
		ctx.fillStyle = '#e5e7eb';
		ctx.font = '12px Inter, sans-serif';
		ctx.textAlign = 'center';

		majorFreqs.forEach((freq) => {
			const x = FrequencyUtils.freqToX(freq, CANVAS_WIDTH, MIN_FREQUENCY, MAX_FREQUENCY);
			let label = freq < 1000 ? `${freq}` : `${freq / 1000}k`;
			ctx.fillText(label, x, 20);
		});

		// Frequency range labels
		ctx.fillStyle = '#9ca3af';
		ctx.font = '10px Inter, sans-serif';
		ctx.fillText($t('audioTraining.eq.lowFreq'), 60, CANVAS_HEIGHT - 10);
		ctx.textAlign = 'center';
		ctx.fillText($t('audioTraining.eq.midFreq'), CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);
		ctx.textAlign = 'right';
		ctx.fillText($t('audioTraining.eq.highFreq'), CANVAS_WIDTH - 60, CANVAS_HEIGHT - 10);

		// Show hovered frequency
		if (hoveredFrequency !== null && mouseX > 0 && mouseY > 0) {
			CanvasUtils.drawTooltip(ctx, hoveredFrequency, mouseX, mouseY, CANVAS_WIDTH);

			// Draw vertical blue bar at mouse X position
			ctx.strokeStyle = '#60a5fa';
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
			ctx.globalAlpha = 0.7;
			ctx.beginPath();
			ctx.moveTo(mouseX, 25);
			ctx.lineTo(mouseX, CANVAS_HEIGHT - 25);
			ctx.stroke();
			ctx.globalAlpha = 1.0;
		}

		// Show result if available
		if (gameState.showResult && userGuess !== null) {
			// Show tolerance range around the actual frequency
			const toleranceHz = FrequencyUtils.getLogarithmicMargin(
				currentFrequency,
				BASE_MARGIN_PERCENT
			);
			const minToleranceFreq = Math.max(MIN_FREQUENCY, currentFrequency - toleranceHz);
			const maxToleranceFreq = Math.min(MAX_FREQUENCY, currentFrequency + toleranceHz);

			const minToleranceX = FrequencyUtils.freqToX(
				minToleranceFreq,
				CANVAS_WIDTH,
				MIN_FREQUENCY,
				MAX_FREQUENCY
			);
			const maxToleranceX = FrequencyUtils.freqToX(
				maxToleranceFreq,
				CANVAS_WIDTH,
				MIN_FREQUENCY,
				MAX_FREQUENCY
			);

			// Draw tolerance range as a semi-transparent rectangle
			ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
			ctx.fillRect(minToleranceX, 25, maxToleranceX - minToleranceX, CANVAS_HEIGHT - 50);

			// Draw tolerance range borders
			ctx.strokeStyle = '#8b5cf6';
			ctx.lineWidth = 1;
			ctx.setLineDash([3, 3]);
			ctx.beginPath();
			ctx.moveTo(minToleranceX, 25);
			ctx.lineTo(minToleranceX, CANVAS_HEIGHT - 25);
			ctx.moveTo(maxToleranceX, 25);
			ctx.lineTo(maxToleranceX, CANVAS_HEIGHT - 25);
			ctx.stroke();
			ctx.setLineDash([]);

			// User guess line
			const userX = FrequencyUtils.freqToX(
				userGuess,
				CANVAS_WIDTH,
				MIN_FREQUENCY,
				MAX_FREQUENCY
			);
			const isCorrect = Math.abs(userGuess - currentFrequency) <= toleranceHz;
			ctx.strokeStyle = isCorrect ? '#10b981' : '#ef4444';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(userX, 25);
			ctx.lineTo(userX, CANVAS_HEIGHT - 25);
			ctx.stroke();

			// Actual answer line
			const actualX = FrequencyUtils.freqToX(
				currentFrequency,
				CANVAS_WIDTH,
				MIN_FREQUENCY,
				MAX_FREQUENCY
			);
			ctx.strokeStyle = '#8b5cf6';
			ctx.lineWidth = 4;
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(actualX, 25);
			ctx.lineTo(actualX, CANVAS_HEIGHT - 25);
			ctx.stroke();
			ctx.setLineDash([]);
		}
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
			// Fallback to generated audio
			await audioManager.generatePinkNoise();
		}
	}

	function generateRandomFrequency() {
		currentFrequency = EQ_FREQUENCIES[Math.floor(Math.random() * EQ_FREQUENCIES.length)];
	}

	async function startExercise() {
		if (!audioManager.audioContext || !audioManager.audioBuffer) {
			await audioManager.initialize();
			await loadRandomSample();
		} else {
			await audioManager.resumeIfSuspended();
		}

		generateRandomFrequency();
		resetResult();

		// Create audio nodes
		audioManager.source = audioManager.createSource();
		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		eqFilter = audioManager.audioContext!.createBiquadFilter();
		highShelf = audioManager.audioContext!.createBiquadFilter();
		lowShelf = audioManager.audioContext!.createBiquadFilter();
		gainNode = audioManager.audioContext!.createGain();

		// Configure EQ filter (peaking)
		eqFilter.type = 'peaking';
		eqFilter.frequency.setValueAtTime(currentFrequency, audioManager.audioContext!.currentTime);
		eqFilter.gain.setValueAtTime(8, audioManager.audioContext!.currentTime); // +8dB boost
		eqFilter.Q.setValueAtTime(2, audioManager.audioContext!.currentTime);

		// Configure complementary filters to balance overall level
		if (currentFrequency < 800) {
			// For low frequencies, add a gentle high shelf cut
			highShelf.type = 'highshelf';
			highShelf.frequency.setValueAtTime(4000, audioManager.audioContext!.currentTime);
			highShelf.gain.setValueAtTime(-3, audioManager.audioContext!.currentTime);
		} else {
			// For high frequencies, add a gentle low shelf cut
			lowShelf.type = 'lowshelf';
			lowShelf.frequency.setValueAtTime(200, audioManager.audioContext!.currentTime);
			lowShelf.gain.setValueAtTime(-3, audioManager.audioContext!.currentTime);
		}

		// Set up routing
		audioManager.source.connect(eqFilter);
		eqFilter.connect(currentFrequency < 800 ? highShelf : lowShelf);
		(currentFrequency < 800 ? highShelf : lowShelf).connect(gainNode);
		gainNode.connect(audioManager.audioContext!.destination);

		// Start audio using AudioManager method
		audioManager.startSource();
	}

	function stopExercise() {
		audioManager.stop();
		// Properly disconnect all filter nodes
		if (eqFilter) {
			try {
				eqFilter.disconnect();
			} catch (error) {
				console.warn('Error disconnecting EQ filter:', error);
			}
			eqFilter = null;
		}
		if (highShelf) {
			try {
				highShelf.disconnect();
			} catch (error) {
				console.warn('Error disconnecting high shelf:', error);
			}
			highShelf = null;
		}
		if (lowShelf) {
			try {
				lowShelf.disconnect();
			} catch (error) {
				console.warn('Error disconnecting low shelf:', error);
			}
			lowShelf = null;
		}
		if (gainNode) {
			try {
				gainNode.disconnect();
			} catch (error) {
				console.warn('Error disconnecting gain node:', error);
			}
			gainNode = null;
		}
	}

	function resetResult() {
		userGuess = null;
		eqBypass = false;
		drawFrequencySpectrum();
	}

	function handleCanvasClick(event: MouseEvent) {
		if (!isAudioPlaying) return;

		const canvasElement = canvas.getCanvas();
		const rect = canvasElement.getBoundingClientRect();
		const x = event.clientX - rect.left;

		// Convert click position to frequency
		userGuess = FrequencyUtils.xToFreq(x, MIN_FREQUENCY, MAX_FREQUENCY, CANVAS_WIDTH);

		// Check if guess is correct
		const toleranceHz = FrequencyUtils.getLogarithmicMargin(
			currentFrequency,
			BASE_MARGIN_PERCENT
		);
		const difference = Math.abs(userGuess - currentFrequency);
		const isCorrect = difference <= toleranceHz;
		const points = ScoringUtils.calculatePoints(difference, toleranceHz);

		// Create result
		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: currentFrequency,
			userGuess
		};

		// Generate result message
		if (isCorrect) {
			result.additionalData = {
				message: `${$t('audioTraining.eq.correctGuess')} (+${points} points)`
			};
		} else {
			const actualLabel = FrequencyUtils.formatFrequency(currentFrequency);
			result.additionalData = {
				message: `${$t('audioTraining.eq.incorrectGuess')} ${actualLabel} (+${points} points)`
			};
		}

		stopExercise();
		gameManager.submitRound(result);
		drawFrequencySpectrum();
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		const canvasElement = canvas.getCanvas();
		const rect = canvasElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		mouseX = x;
		mouseY = y;

		// Convert mouse position to frequency
		const frequency = FrequencyUtils.xToFreq(x, MIN_FREQUENCY, MAX_FREQUENCY, CANVAS_WIDTH);
		hoveredFrequency = FrequencyUtils.formatFrequency(frequency);
		drawFrequencySpectrum();
	}

	function handleCanvasMouseLeave() {
		hoveredFrequency = null;
		mouseX = 0;
		mouseY = 0;
		drawFrequencySpectrum();
	}

	function toggleBypass() {
		if (!gainNode || !eqFilter || !audioManager.audioContext) return;

		eqBypass = !eqBypass;

		if (eqBypass) {
			// Bypass EQ: connect source directly to destination
			audioManager.source?.disconnect();
			audioManager.source?.connect(audioManager.audioContext.destination);
		} else {
			// Re-enable EQ chain
			audioManager.source?.disconnect();
			audioManager.source?.connect(eqFilter);
		}
	}

	function startNewGame() {
		gameManager.startNewGame();
		roundHistory = [];
		startExercise();
	}

	function skipRound() {
		const message = `Skipped! The boosted frequency was ${FrequencyUtils.formatFrequency(currentFrequency)}`;

		stopExercise();
		gameManager.skipRound(currentFrequency, message);
		drawFrequencySpectrum();
	}

	function playAgain() {
		gameManager.startNewGame();
		roundHistory = [];
		loadRandomSample(); // Load new sample for next game
	}

	// Auto-start next round
	$effect(() => {
		if (
			gameState.gameStarted &&
			!gameState.gameCompleted &&
			!gameState.showResult &&
			gameState.currentRound > 0
		) {
			loadRandomSample().then(() => startExercise());
		}
	});
</script>

<svelte:head>
	<title>{$t('audioTraining.eq.title')} - {$t('audioTraining.title')}</title>
	<meta name="description" content={$t('audioTraining.eq.description')} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<header class="mb-8 text-center">
			<nav class="mb-4">
				<a
					href="/audio-training"
					class="inline-flex items-center text-purple-300 hover:text-purple-200"
				>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						></path>
					</svg>
					Back to Exercises
				</a>
			</nav>
			<h1 class="mb-4 text-4xl font-bold text-white">{$t('audioTraining.eq.title')}</h1>
			<p class="text-xl text-purple-200">{$t('audioTraining.eq.description')}</p>
		</header>

		<!-- Game Controls -->
		<GameControls
			{gameState}
			showABToggle={true}
			abState={eqBypass}
			onStartGame={startNewGame}
			onSkipRound={skipRound}
			onABToggle={toggleBypass}
		>
			<span slot="start-button">Start 10-Round Challenge</span>
		</GameControls>

		<!-- Canvas Section -->
		<section class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold text-white">
				{$t('audioTraining.eq.clickToGuess')}
			</h3>

			<div class="flex justify-center">
				<div class="relative">
					<InteractiveCanvas
						bind:this={canvas}
						width={CANVAS_WIDTH}
						height={CANVAS_HEIGHT}
						disabled={!isAudioPlaying}
						onCanvasClick={handleCanvasClick}
						onCanvasMouseMove={handleCanvasMouseMove}
						onCanvasMouseLeave={handleCanvasMouseLeave}
					>
						<span slot="disabled-overlay">Start the exercise to begin</span>
					</InteractiveCanvas>
				</div>
			</div>

			<!-- Legend -->
			<div class="mt-4 flex justify-center gap-6 text-sm text-gray-300">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded bg-blue-400"></div>
					<span>Frequency Grid</span>
				</div>
				{#if gameState.showResult}
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded bg-green-500"></div>
						<span>Your Guess</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="h-3 w-3 rounded border-2 border-dashed border-white bg-purple-500"
						></div>
						<span>Boosted Frequency</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="h-3 w-3 rounded bg-purple-300 opacity-50"></div>
						<span>Tolerance Range</span>
					</div>
				{/if}
			</div>
		</section>

		<!-- Score Screen -->
		{#if gameState.gameCompleted}
			<ScoreScreen
				{gameState}
				{roundHistory}
				onPlayAgain={playAgain}
				customStats={[
					{
						label: 'Perfect Identifications',
						value: `${roundHistory.filter((r) => r.points === 100).length}/${gameState.totalRounds}`
					},
					{
						label: 'Average Frequency Error',
						value: `${Math.round(roundHistory.reduce((sum, r) => sum + Math.abs((r.userGuess || 0) - r.actualValue), 0) / roundHistory.length)}Hz`
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
					<span>Audio Playing - {eqBypass ? 'Bypass' : 'EQ Active'}</span>
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		font-family: 'Inter', sans-serif;
		color: white !important;
	}
	#main {
		font-family: 'Inter', monospace;
		color: white !important;
		background-image: url('$lib/images/sbt/sbt-background.png');
	}
	body,
	div,
	p,
	span {
		color: white;
	}

	a {
		text-decoration: none;
	}
</style>

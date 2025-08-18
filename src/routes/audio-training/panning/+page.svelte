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
	import { ScoringUtils } from '$lib/utils/audio-training/scoring-utils';

	let canvas: InteractiveCanvas;
	let pannerNode: StereoPannerNode | null;
	let currentPanning = 0; // -1 to 1 (left to right)
	let userGuess: number | null = null;
	let hoveredPercentage: string | null = null;
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

	const CANVAS_WIDTH = 600;
	const CANVAS_HEIGHT = 100;
	const MARGIN_ERROR = 0.1; // 10% margin of error

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

	$effect(() => {
		console.log(isAudioPlaying);
	});

	onMount(() => {
		(async () => {
			await audioManager.initialize();

			// Ensure canvas is ready before drawing
			setTimeout(() => {
				drawGrid();
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

	function drawGrid() {
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

		// Grid lines (every 10%)
		ctx.strokeStyle = '#374151';
		ctx.lineWidth = 1;

		for (let i = 0; i <= 10; i++) {
			const x = (i / 10) * CANVAS_WIDTH;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, CANVAS_HEIGHT);
			ctx.stroke();
		}

		// Center line (0%)
		ctx.strokeStyle = '#fbbf24';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(CANVAS_WIDTH / 2, 0);
		ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
		ctx.stroke();

		// Labels
		ctx.fillStyle = '#e5e7eb';
		ctx.font = '12px Inter, sans-serif';
		ctx.textAlign = 'center';

		// Left labels
		for (let i = 1; i <= 5; i++) {
			const x = ((5 - i) / 10) * CANVAS_WIDTH;
			const percentage = i * 20;
			ctx.fillText(`${percentage}%L`, x, 15);
		}

		// Center label
		ctx.fillText('0%', CANVAS_WIDTH / 2, 15);

		// Right labels
		for (let i = 1; i <= 5; i++) {
			const x = ((5 + i) / 10) * CANVAS_WIDTH;
			const percentage = i * 20;
			ctx.fillText(`${percentage}%R`, x, 15);
		}

		// Show hovered percentage following mouse cursor
		if (hoveredPercentage !== null && mouseX > 0 && mouseY > 0) {
			CanvasUtils.drawTooltip(ctx, hoveredPercentage, mouseX, mouseY, CANVAS_WIDTH);

			// Draw vertical blue bar at mouse X position
			ctx.strokeStyle = '#60a5fa';
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
			ctx.globalAlpha = 0.7;
			ctx.beginPath();
			ctx.moveTo(mouseX, 20);
			ctx.lineTo(mouseX, CANVAS_HEIGHT - 20);
			ctx.stroke();
			ctx.globalAlpha = 1.0;
		}

		// Show result if available
		if (gameState.showResult && userGuess !== null) {
			// User guess line
			const userX = ((userGuess + 1) / 2) * CANVAS_WIDTH;
			const isCorrect = Math.abs(userGuess - currentPanning) <= MARGIN_ERROR;
			ctx.strokeStyle = isCorrect ? '#10b981' : '#ef4444';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(userX, 20);
			ctx.lineTo(userX, CANVAS_HEIGHT - 20);
			ctx.stroke();

			// Actual answer line
			const actualX = ((currentPanning + 1) / 2) * CANVAS_WIDTH;
			ctx.strokeStyle = '#8b5cf6';
			ctx.lineWidth = 4;
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(actualX, 20);
			ctx.lineTo(actualX, CANVAS_HEIGHT - 20);
			ctx.stroke();
			ctx.setLineDash([]);
		}
	}

	function generateRandomPanning() {
		// Generate panning between -0.9 and 0.9 (avoid extreme edges)
		currentPanning = (Math.random() - 0.5) * 1.8;
		// Round to nearest 0.1 for easier guessing
		currentPanning = Math.round(currentPanning * 10) / 10;
	}

	async function startExercise() {
		if (!audioManager.audioContext || !audioManager.audioBuffer) {
			await audioManager.initialize();
		} else {
			await audioManager.resumeIfSuspended();
		}

		generateRandomPanning();
		resetResult();

		// Create source and panner
		audioManager.source = audioManager.createSource();
		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		pannerNode = audioManager.audioContext!.createStereoPanner();

		// Set panning
		pannerNode.pan.setValueAtTime(currentPanning, audioManager.audioContext!.currentTime);

		// Connect nodes
		audioManager.source.connect(pannerNode);
		pannerNode.connect(audioManager.audioContext!.destination);

		// Start audio using AudioManager method
		audioManager.startSource();

		console.log(audioManager.isPlaying);
	}

	function stopExercise() {
		audioManager.stop();
		if (pannerNode) {
			try {
				pannerNode.disconnect();
			} catch (error) {
				console.warn('Error disconnecting panner node:', error);
			}
			pannerNode = null;
		}
	}

	function resetResult() {
		userGuess = null;
		drawGrid();
	}

	function handleCanvasClick(event: MouseEvent) {
		if (!isAudioPlaying) return;

		const canvasElement = canvas.getCanvas();
		const rect = canvasElement.getBoundingClientRect();
		const x = event.clientX - rect.left;

		// Convert click position to panning value (-1 to 1)
		userGuess = (x / CANVAS_WIDTH) * 2 - 1;

		// Check if guess is correct
		const difference = Math.abs(userGuess - currentPanning);
		const isCorrect = difference <= MARGIN_ERROR;
		const points = ScoringUtils.calculatePoints(difference, MARGIN_ERROR);

		// Create result
		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: currentPanning,
			userGuess
		};

		// Generate result message
		if (isCorrect) {
			result.additionalData = {
				message: `${$t('audioTraining.panning.correctGuess')} (+${points} points)`
			};
		} else {
			const correctPercentage = Math.round(currentPanning * 100);
			const side =
				currentPanning < -0.02 ? 'Left' : currentPanning > 0.02 ? 'Right' : 'Center';
			result.additionalData = {
				message: `${$t('audioTraining.panning.incorrectGuess')} ${Math.abs(correctPercentage)}% ${side} (+${points} points)`
			};
		}

		stopExercise();
		gameManager.submitRound(result);
		drawGrid();
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		const canvasElement = canvas.getCanvas();
		const rect = canvasElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		mouseX = x;
		mouseY = y;

		// Convert mouse position to percentage
		const panValue = (x / CANVAS_WIDTH) * 2 - 1;
		const percentage = Math.round(panValue * 100);
		const side = panValue < -0.02 ? 'L' : panValue > 0.02 ? 'R' : '';

		hoveredPercentage = `${Math.abs(percentage)}%${side}`;
		drawGrid();
	}

	function handleCanvasMouseLeave() {
		hoveredPercentage = null;
		mouseX = 0;
		mouseY = 0;
		drawGrid();
	}

	function startNewGame() {
		gameManager.startNewGame();
		roundHistory = [];
		startExercise();
	}

	function skipRound() {
		const message = `Skipped! The panning was ${Math.round(currentPanning * 100)}% ${
			currentPanning < -0.02 ? 'Left' : currentPanning > 0.02 ? 'Right' : 'Center'
		}`;

		stopExercise();
		gameManager.skipRound(currentPanning, message);
		drawGrid();
	}

	function playAgain() {
		gameManager.startNewGame();
		roundHistory = [];
	}

	// Auto-start next round
	$effect(() => {
		if (
			gameState.gameStarted &&
			!gameState.gameCompleted &&
			!gameState.showResult &&
			gameState.currentRound > 0
		) {
			startExercise();
		}
	});
</script>

<svelte:head>
	<title>{$t('audioTraining.panning.title')} - {$t('audioTraining.title')}</title>
	<meta name="description" content={$t('audioTraining.panning.description')} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<header class="mb-8 text-center">
			<nav class="mb-4">
				<a
					href="/audio-training"
					class="inline-flex items-center text-blue-300 hover:text-blue-200"
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
			<h1 class="mb-4 text-4xl font-bold text-white">{$t('audioTraining.panning.title')}</h1>
			<p class="text-xl text-blue-200">{$t('audioTraining.panning.description')}</p>
		</header>

		<!-- Game Controls -->
		<GameControls {gameState} onStartGame={startNewGame} onSkipRound={skipRound} />

		<!-- Canvas Section -->
		<section class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold text-white">
				{$t('audioTraining.panning.clickToGuess')}
			</h3>

			<div class="flex justify-center">
				{isAudioPlaying}
				<div class="relative">
					<InteractiveCanvas
						bind:this={canvas}
						width={CANVAS_WIDTH}
						height={CANVAS_HEIGHT}
						disabled={!isAudioPlaying}
						onCanvasClick={handleCanvasClick}
						onCanvasMouseMove={handleCanvasMouseMove}
						onCanvasMouseLeave={handleCanvasMouseLeave}
					></InteractiveCanvas>
				</div>
			</div>

			<!-- Legend -->
			<div class="mt-4 flex justify-center gap-6 text-sm text-gray-300">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded bg-yellow-400"></div>
					<span>Center (0%)</span>
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
						<span>Correct Answer</span>
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
						label: 'Perfect Guesses',
						value: `${roundHistory.filter((r) => r.points === 100).length}/${gameState.totalRounds}`
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
					<span>Audio Playing</span>
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

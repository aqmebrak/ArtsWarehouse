<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { t } from '$lib/i18n';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import InteractiveCanvas from '$lib/components/audio-training/InteractiveCanvas.svelte';
	import PlayerBar from '$lib/components/audio-training/PlayerBar.svelte';
	import GameContainer from '$lib/components/audio-training/GameContainer.svelte';
	import ToastContainer from '$lib/components/audio-training/ToastContainer.svelte';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { createGameManager } from '$lib/utils/audio-training/game-manager-setup.svelte';
	import type { RoundResult } from '$lib/components/audio-training/types';
	import { CanvasUtils } from '$lib/utils/audio-training/canvas-utils';
	import { ScoringUtils } from '$lib/utils/audio-training/scoring-utils';

	let canvas = $state<InteractiveCanvas>();
	let pannerNode = $state<StereoPannerNode | null>(null);
	let currentPanning = 0; // -1 to 1 (left to right)
	let userGuess: number | null = null;
	let hoveredPercentage: string | null = null;
	let mouseX = 0;
	let mouseY = 0;
	let toastContainer: ToastContainer;

	const CANVAS_WIDTH = 600;
	const CANVAS_HEIGHT = 100;
	const MARGIN_ERROR = 0.1; // 10% margin of error

	// Initialize managers
	const audioManager = new AudioManager();
	const game = createGameManager({
		exerciseId: 'panning',
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

			// Ensure canvas is ready before drawing
			setTimeout(() => {
				drawGrid();
			}, 100);
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
		if (game.gameState.showResult && userGuess !== null) {
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
		if (!isAudioPlaying || !canvas) return;

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
		game.manager.submitRound(result);
		drawGrid();
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		if (!canvas) return;
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
		game.manager.startNewGame();
		game.resetRoundHistory();
		startExercise();
	}

	function skipRound() {
		const message = `Skipped! The panning was ${Math.round(currentPanning * 100)}% ${
			currentPanning < -0.02 ? 'Left' : currentPanning > 0.02 ? 'Right' : 'Center'
		}`;

		stopExercise();
		game.manager.skipRound(currentPanning, message);
		drawGrid();
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
			game.gameState.currentRound > 0
		) {
			startExercise();
		}
	});
</script>

<svelte:head>
	<title>{$t('audioTraining.panning.title')} - {$t('audioTraining.title')}</title>
	<meta name="description" content={$t('audioTraining.panning.description')} />
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
	title={$t('audioTraining.panning.title')}
	description={$t('audioTraining.panning.description')}
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	{#if !game.gameState.gameCompleted}
		<!-- Game Controls -->
		<GameControls
			gameState={game.gameState}
			onStartGame={startNewGame}
			onSkipRound={skipRound}
		/>

		<!-- Canvas Section -->
		<div class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold">
				{$t('audioTraining.panning.clickToGuess')}
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
					></InteractiveCanvas>
				</div>
			</div>

			<!-- Legend -->
			<div class="mt-4 flex justify-center gap-6 text-sm text-gray-300">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded bg-white"></div>
					<span>Center (0%)</span>
				</div>
				{#if game.gameState.showResult}
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
		</div>

		<!-- Audio Status -->
		{#if isAudioPlaying}
			<div class="text-center">
				<div
					class="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-600/20 px-4 py-2 text-green-200"
				>
					<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
					<span>Audio Playing</span>
				</div>
			</div>
		{/if}
	{:else}
		<!-- Score Screen -->
		<ScoreScreen
			gameState={game.gameState}
			roundHistory={game.roundHistory}
			onPlayAgain={playAgain}
			customStats={[
				{
					label: 'Perfect Guesses',
					value: `${game.roundHistory.filter((r) => r.points === 100).length}/${game.gameState.totalRounds}`
				}
			]}
		/>
	{/if}
</GameContainer>

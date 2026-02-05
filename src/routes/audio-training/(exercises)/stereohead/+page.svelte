<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import GameControls from '$lib/components/audio-training/GameControls.svelte';
	import ScoreScreen from '$lib/components/audio-training/ScoreScreen.svelte';
	import InteractiveCanvas from '$lib/components/audio-training/InteractiveCanvas.svelte';
	import PlayerBar from '$lib/components/audio-training/PlayerBar.svelte';
	import GameContainer from '$lib/components/audio-training/GameContainer.svelte';
	import ToastContainer from '$lib/components/audio-training/ToastContainer.svelte';
	import sampleFiles from '$lib/audio-training/samples';
	import { AudioManager } from '$lib/components/audio-training/AudioManager.svelte';
	import { createGameManager } from '$lib/utils/audio-training/game-manager-setup.svelte';
	import type { RoundResult } from '$lib/components/audio-training/types';
	import type { GameSession } from '$lib/types/audio-training';
	import { ScoringUtils } from '$lib/utils/audio-training/scoring-utils';

	let toastContainer: ToastContainer;

	const game = createGameManager({
		exerciseId: 'stereohead',
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
	let splitterNode: ChannelSplitterNode | null = null;
	let mergerNode: ChannelMergerNode | null = null;
	let leftGain: GainNode | null = null;
	let rightGain: GainNode | null = null;
	let currentWidth = $state(0); // 0 = mono, 100 = full stereo, 200 = ultra-wide
	let userGuess: number | null = null;
	let hoveredWidth: string | null = null;
	let mouseX = 0;

	// Canvas
	let canvas = $state<InteractiveCanvas>();
	const CANVAS_WIDTH = 600;
	const CANVAS_HEIGHT = 100;
	const MARGIN_ERROR = 15; // ±15% tolerance

	// Initialize managers
	const audioManager = new AudioManager();

	let isAudioPlaying = $derived(audioManager.isPlaying);

	onMount(() => {
		(async () => {
			await audioManager.initialize();
			await loadRandomSample();

			setTimeout(() => {
				drawStereoMeter();
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

	function drawStereoMeter() {
		if (!canvas) return;
		const ctx = canvas.getContext();
		if (!ctx) return;

		canvas.clear();
		canvas.drawBackground();

		// Draw stereo width zones
		const zones = [
			{ start: 0, end: 0.33, color: '#ef4444', label: 'Mono' },
			{ start: 0.33, end: 0.67, color: '#10b981', label: 'Normal' },
			{ start: 0.67, end: 1, color: '#8b5cf6', label: 'Wide' }
		];

		zones.forEach((zone) => {
			const startX = zone.start * CANVAS_WIDTH;
			const width = (zone.end - zone.start) * CANVAS_WIDTH;

			ctx.fillStyle = zone.color + '20';
			ctx.fillRect(startX, 0, width, CANVAS_HEIGHT);

			ctx.strokeStyle = zone.color + '40';
			ctx.lineWidth = 1;
			ctx.strokeRect(startX, 0, width, CANVAS_HEIGHT);

			// Zone label
			ctx.fillStyle = zone.color;
			ctx.font = '12px Inter, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(zone.label, startX + width / 2, 20);
		});

		// Draw percentage labels
		ctx.fillStyle = '#e5e7eb';
		ctx.font = '12px Inter, sans-serif';
		ctx.textAlign = 'center';

		for (let i = 0; i <= 10; i++) {
			const x = (i / 10) * CANVAS_WIDTH;
			const percentage = i * 20;
			ctx.fillText(`${percentage}%`, x, CANVAS_HEIGHT - 10);
		}

		// Show hovered width
		if (hoveredWidth !== null && mouseX > 0) {
			ctx.fillStyle = '#60a5fa';
			ctx.font = 'bold 14px Inter, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(hoveredWidth, mouseX, 50);

			// Draw indicator line
			ctx.strokeStyle = '#60a5fa';
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(mouseX, 30);
			ctx.lineTo(mouseX, CANVAS_HEIGHT - 30);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		// Show result
		if (game.gameState.showResult && userGuess !== null) {
			const userX = (userGuess / 200) * CANVAS_WIDTH;
			const actualX = (currentWidth / 200) * CANVAS_WIDTH;
			const isCorrect = Math.abs(userGuess - currentWidth) <= MARGIN_ERROR;

			// User guess
			ctx.strokeStyle = isCorrect ? '#10b981' : '#ef4444';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(userX, 25);
			ctx.lineTo(userX, CANVAS_HEIGHT - 25);
			ctx.stroke();

			// Actual answer
			ctx.strokeStyle = '#fbbf24';
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

			const samplePath = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
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

	function generateRandomWidth() {
		// 0 = mono, 100 = normal stereo, 200 = ultra-wide
		currentWidth = Math.floor(Math.random() * 201);
		// Round to nearest 10 for easier guessing
		currentWidth = Math.round(currentWidth / 10) * 10;
	}

	async function startExercise() {
		if (!audioManager.audioContext || !audioManager.audioBuffer) {
			await audioManager.initialize();
			await loadRandomSample();
		} else {
			await audioManager.resumeIfSuspended();
		}

		generateRandomWidth();
		userGuess = null;

		audioManager.source = audioManager.createSource();
		if (!audioManager.source) {
			console.error('Failed to create audio source');
			return;
		}

		// Create stereo processing chain
		splitterNode = audioManager.audioContext!.createChannelSplitter(2);
		mergerNode = audioManager.audioContext!.createChannelMerger(2);
		leftGain = audioManager.audioContext!.createGain();
		rightGain = audioManager.audioContext!.createGain();

		// Calculate stereo width (M/S technique simulation)
		// width 0 = mono (mid only), 100 = normal, 200 = ultra-wide (side only)
		const midGain = 1 - currentWidth / 200;
		const sideGain = currentWidth / 200;

		leftGain.gain.setValueAtTime(midGain + sideGain, audioManager.audioContext!.currentTime);
		rightGain.gain.setValueAtTime(midGain + sideGain, audioManager.audioContext!.currentTime);

		// Connect: source -> splitter -> gains -> merger -> destination
		audioManager.source.connect(splitterNode);
		splitterNode.connect(leftGain, 0);
		splitterNode.connect(rightGain, 1);
		leftGain.connect(mergerNode, 0, 0);
		rightGain.connect(mergerNode, 0, 1);
		mergerNode.connect(audioManager.audioContext!.destination);

		audioManager.startSource();
		drawStereoMeter();
	}

	function stopExercise() {
		audioManager.stop();
		[splitterNode, mergerNode, leftGain, rightGain].forEach((node) => {
			if (node) {
				try {
					node.disconnect();
				} catch (e) {
					console.warn('Error disconnecting node:', e);
				}
			}
		});
		splitterNode = null;
		mergerNode = null;
		leftGain = null;
		rightGain = null;
	}

	function handleCanvasClick(event: MouseEvent) {
		if (!isAudioPlaying || !canvas) return;

		const canvasElement = canvas.getCanvas();
		const rect = canvasElement.getBoundingClientRect();
		const x = event.clientX - rect.left;

		userGuess = Math.round((x / CANVAS_WIDTH) * 200);

		const difference = Math.abs(userGuess - currentWidth);
		const isCorrect = difference <= MARGIN_ERROR;
		const points = ScoringUtils.calculatePoints(difference, MARGIN_ERROR);

		const result: RoundResult = {
			correct: isCorrect,
			points,
			actualValue: currentWidth,
			userGuess
		};

		if (isCorrect) {
			result.additionalData = {
				message: `Correct! The stereo width was ${currentWidth}% (+${points} points)`
			};
		} else {
			result.additionalData = {
				message: `Close! The stereo width was ${currentWidth}%, you guessed ${userGuess}% (+${points} points)`
			};
		}

		stopExercise();
		game.manager.submitRound(result);
		drawStereoMeter();
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		if (!canvas) return;
		const canvasElement = canvas.getCanvas();
		const rect = canvasElement.getBoundingClientRect();
		const x = event.clientX - rect.left;

		mouseX = x;
		const width = Math.round((x / CANVAS_WIDTH) * 200);
		hoveredWidth = `${width}%`;
		drawStereoMeter();
	}

	function handleCanvasMouseLeave() {
		hoveredWidth = null;
		mouseX = 0;
		drawStereoMeter();
	}

	function startNewGame() {
		game.manager.startNewGame();
		game.resetRoundHistory();
		startExercise();
	}

	function skipRound() {
		const message = `Skipped! The stereo width was ${currentWidth}%`;
		stopExercise();
		game.manager.skipRound(currentWidth, message);
		drawStereoMeter();
	}

	function playAgain() {
		game.manager.startNewGame();
		game.resetRoundHistory();
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
	<title>Stereohead - Audio Training</title>
	<meta name="description" content="Identify the stereo width of audio signals" />
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
	title="🎧 Stereohead"
	description="Identify the stereo width of the audio"
	gradient="from-slate-900/50 via-slate-800/50 to-slate-900/50"
>
	<!-- Game Controls -->
	<GameControls gameState={game.gameState} onStartGame={startNewGame} onSkipRound={skipRound}>
		{#snippet startButton()}Start 10-Round Challenge{/snippet}
	</GameControls>

	<!-- Canvas Section -->
	<section class="mb-8">
		<h3 class="mb-4 text-center text-xl font-semibold">Click to guess the stereo width</h3>

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
				<div class="h-3 w-3 rounded bg-slate-500"></div>
				<span>0% = Mono</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded bg-green-500"></div>
				<span>100% = Normal Stereo</span>
			</div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-3 rounded bg-purple-500"></div>
				<span>200% = Ultra-Wide</span>
			</div>
		</div>
	</section>

	<!-- Score Screen -->
	{#if game.gameState.gameCompleted}
		<ScoreScreen
			gameState={game.gameState}
			roundHistory={game.roundHistory}
			onPlayAgain={playAgain}
			customStats={[
				{
					label: 'Perfect Guesses',
					value: `${game.roundHistory.filter((r) => r.points === 100).length}/${game.gameState.totalRounds}`
				},
				{
					label: 'Average Error',
					value: `${Math.round(game.roundHistory.reduce((sum, r) => sum + Math.abs((r.userGuess || 0) - r.actualValue), 0) / game.roundHistory.length)}%`
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

	<!-- Instructions -->
	<section class="mt-8 rounded-lg border border-purple-500/30 bg-purple-900/10 p-6">
		<h3 class="mb-3 text-lg font-semibold text-purple-200">How to Play</h3>
		<ul class="space-y-2 text-sm text-slate-300">
			<li>🎧 Use headphones for the best experience</li>
			<li>👂 Listen to the stereo width of the audio</li>
			<li>🎯 Click on the meter to guess the width percentage</li>
			<li>💡 0% = mono (centered), 100% = normal stereo, 200% = ultra-wide</li>
		</ul>
	</section>
</GameContainer>

<style>
	:global(body) {
		font-family: 'Inter', sans-serif;
		color: white !important;
	}
</style>

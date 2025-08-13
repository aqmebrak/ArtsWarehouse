<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let audioContext: AudioContext | null;
	let audioBuffer: AudioBuffer | null;
	let source: AudioBufferSourceNode | null;
	let pannerNode: PannerNode | null;
	let isPlaying = false;
	let currentPanning = 0; // -1 to 1 (left to right)
	let userGuess: number | null = null;
	let showResult = false;
	let resultMessage = '';
	let isCorrect = false;
	let hoveredPercentage: string | null = null;
	let mouseX = 0;
	let mouseY = 0;

	// Gamification system
	let currentRound = 0;
	let totalRounds = 10;
	let score = 0;
	let roundHistory: Array<{
		correct: boolean;
		points: number;
		actualPan: number;
		userGuess: number;
	}> = [];
	let gameCompleted = false;
	let gameStarted = false;

	const CANVAS_WIDTH = 600;
	const CANVAS_HEIGHT = 100;
	const MARGIN_ERROR = 0.1; // 10% margin of error

	onMount(() => {
		initCanvas();
		initAudio();
	});

	function initCanvas() {
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;
		ctx = canvas.getContext('2d');
		drawGrid();
	}

	function drawGrid() {
		if (!ctx) return;

		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Background
		ctx.fillStyle = '#1f2937';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Grid lines (every 10%)
		ctx.strokeStyle = '#374151';
		ctx.lineWidth = 1;

		// Vertical lines for percentage markers
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
			// Create background for better readability
			ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			ctx.font = 'bold 14px Inter, sans-serif';
			const textWidth = ctx.measureText(hoveredPercentage).width;
			const padding = 8;
			const textHeight = 16;

			// Adjust position to keep text within canvas bounds
			let textX = mouseX + 10;
			let textY = mouseY - 10;

			if (textX + textWidth + padding * 2 > CANVAS_WIDTH) {
				textX = mouseX - textWidth - padding * 2 - 10;
			}
			if (textY - textHeight - padding < 0) {
				textY = mouseY + textHeight + padding + 10;
			}

			// Draw background
			ctx.fillRect(
				textX - padding,
				textY - textHeight - padding / 2,
				textWidth + padding * 2,
				textHeight + padding
			);

			// Draw text
			ctx.fillStyle = '#60a5fa';
			ctx.textAlign = 'left';
			ctx.fillText(hoveredPercentage, textX, textY - padding / 2);

			// Draw vertical blue bar at mouse X position
			ctx.strokeStyle = '#60a5fa';
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
			ctx.globalAlpha = 0.7;
			ctx.beginPath();
			ctx.moveTo(mouseX, 20);
			ctx.lineTo(mouseX, CANVAS_HEIGHT - 20);
			ctx.stroke();
			ctx.globalAlpha = 1.0; // Reset alpha
		}

		// Show result if available
		if (showResult && userGuess !== null) {
			// User guess line
			const userX = ((userGuess + 1) / 2) * CANVAS_WIDTH;
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

	async function initAudio() {
		try {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();

			// Generate a test tone (440Hz sine wave)
			const sampleRate = audioContext.sampleRate;
			const duration = 2; // 2 seconds
			const frameCount = sampleRate * duration;

			audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
			const channelData = audioBuffer.getChannelData(0);

			for (let i = 0; i < frameCount; i++) {
				channelData[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3;
			}
		} catch (error) {
			console.error('Failed to initialize audio:', error);
		}
	}

	function generateRandomPanning() {
		// Generate panning between -0.9 and 0.9 (avoid extreme edges)
		currentPanning = (Math.random() - 0.5) * 1.8;
		// Round to nearest 0.1 for easier guessing
		currentPanning = Math.round(currentPanning * 10) / 10;
	}

	function calculatePoints(difference: number): number {
		// Perfect accuracy (0% difference): 100 points
		// 5% difference: 50 points
		// 10% difference: 0 points
		// Beyond 10%: 0 points
		const maxDifference = MARGIN_ERROR;
		if (difference > maxDifference) return 0;

		const accuracy = 1 - difference / maxDifference;
		return Math.round(accuracy * 100);
	}

	function startNewGame() {
		currentRound = 0;
		score = 0;
		roundHistory = [];
		gameCompleted = false;
		gameStarted = true;
		startNextRound();
	}

	function startNextRound() {
		if (currentRound >= totalRounds) {
			gameCompleted = true;
			return;
		}

		currentRound++;
		resetResult();
		startExercise();
	}

	async function startExercise() {
		if (!audioContext || !audioBuffer) {
			await initAudio();
		} else if (audioContext.state === 'suspended') {
			await audioContext.resume();
		}

		if (!gameStarted) {
			startNewGame();
			return;
		}

		generateRandomPanning();
		resetResult();

		// Create source and panner
		source = audioContext.createBufferSource();
		pannerNode = audioContext.createStereoPanner();

		source.buffer = audioBuffer;
		source.loop = true;

		// Set panning
		pannerNode.pan.setValueAtTime(currentPanning, audioContext.currentTime);

		// Connect nodes
		source.connect(pannerNode);
		pannerNode.connect(audioContext.destination);

		source.start();
		isPlaying = true;
	}

	function stopExercise() {
		if (source) {
			source.stop();
			source = null;
		}
		if (pannerNode) {
			pannerNode.disconnect();
			pannerNode = null;
		}
		isPlaying = false;
	}

	function resetResult() {
		showResult = false;
		userGuess = null;
		resultMessage = '';
		isCorrect = false;
		drawGrid();
	}

	function handleCanvasClick(event: MouseEvent) {
		if (!isPlaying) return;

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;

		// Convert click position to panning value (-1 to 1)
		userGuess = (x / CANVAS_WIDTH) * 2 - 1;

		// Check if guess is correct (within margin of error)
		const difference = Math.abs(userGuess - currentPanning);
		isCorrect = difference <= MARGIN_ERROR;

		// Calculate points based on accuracy
		const points = calculatePoints(difference);
		score += points;

		// Add to round history
		roundHistory.push({
			correct: isCorrect,
			points: points,
			actualPan: currentPanning,
			userGuess: userGuess
		});

		if (isCorrect) {
			resultMessage = `${$t('audioTraining.panning.correctGuess')} (+${points} points)`;
		} else {
			const correctPercentage = Math.round(currentPanning * 100);
			const side =
				currentPanning < 0
					? $t('audioTraining.panning.left')
					: currentPanning > 0
						? $t('audioTraining.panning.right')
						: $t('audioTraining.panning.center');
			resultMessage = `${$t('audioTraining.panning.incorrectGuess')} ${Math.abs(correctPercentage)}% ${side} (+${points} points)`;
		}

		showResult = true;
		stopExercise();
		drawGrid();

		// Auto-advance to next round after a delay
		setTimeout(() => {
			if (currentRound < totalRounds) {
				startNextRound();
			} else {
				gameCompleted = true;
			}
		}, 3000);
	}

	function handleCanvasMouseMove(event: MouseEvent) {
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Update mouse position for tooltip
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

		<!-- Game Status -->
		{#if gameStarted && !gameCompleted}
			<section class="mb-6">
				<div class="flex justify-center gap-8 text-center">
					<div class="rounded-lg border border-blue-500 bg-blue-600/20 px-4 py-2">
						<div class="text-sm text-blue-200">Round</div>
						<div class="text-2xl font-bold text-white">
							{currentRound}/{totalRounds}
						</div>
					</div>
					<div class="rounded-lg border border-purple-500 bg-purple-600/20 px-4 py-2">
						<div class="text-sm text-purple-200">Score</div>
						<div class="text-2xl font-bold text-white">{score}</div>
					</div>
					<div class="rounded-lg border border-yellow-500 bg-yellow-600/20 px-4 py-2">
						<div class="text-sm text-yellow-200">Accuracy</div>
						<div class="text-2xl font-bold text-white">
							{currentRound > 0
								? Math.round(
										(roundHistory.filter((r) => r.correct).length /
											currentRound) *
											100
									)
								: 0}%
						</div>
					</div>
				</div>
			</section>
		{/if}

		<!-- Controls -->
		<section class="mb-8 text-center">
			{#if !gameStarted}
				<div class="space-y-4">
					<p class="text-gray-200">
						Ready to test your panning skills? Complete 10 rounds and get your score!
					</p>
					<button
						on:click={startExercise}
						class="rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700"
					>
						Start 10-Round Challenge
					</button>
				</div>
			{:else if gameCompleted}
				<div class="space-y-4">
					<button
						on:click={() => {
							gameStarted = false;
							gameCompleted = false;
						}}
						class="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
					>
						Start New Challenge
					</button>
				</div>
			{:else}
				<div class="inline-flex gap-4">
					<button
						on:click={stopExercise}
						disabled={!isPlaying}
						class="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Skip Round
					</button>
				</div>
			{/if}
		</section>

		<!-- Panning Grid -->
		<section class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold text-white">
				{$t('audioTraining.panning.clickToGuess')}
			</h3>

			<div class="flex justify-center">
				<div class="relative">
					<canvas
						bind:this={canvas}
						on:click={handleCanvasClick}
						on:mousemove={handleCanvasMouseMove}
						on:mouseleave={handleCanvasMouseLeave}
						class="cursor-pointer rounded-lg border-2 border-gray-600 bg-gray-800 transition-colors hover:border-blue-400"
						style="max-width: 100%; height: auto;"
					></canvas>

					{#if !isPlaying}
						<div
							class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50"
						>
							<p class="font-semibold text-white">Start the exercise to begin</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Legend -->
			<div class="mt-4 flex justify-center gap-6 text-sm text-gray-300">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded bg-yellow-400"></div>
					<span>Center (0%)</span>
				</div>
				{#if showResult}
					<div class="flex items-center gap-2">
						<div
							class="h-3 w-3 {isCorrect ? 'bg-green-500' : 'bg-red-500'} rounded"
						></div>
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

		<!-- Final Score Screen -->
		{#if gameCompleted}
			<section class="mb-8">
				<div class="rounded-xl border border-yellow-500 bg-yellow-600/20 p-8 text-center">
					<h2 class="mb-4 text-3xl font-bold text-yellow-200">Challenge Complete! 🎉</h2>
					<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-2xl font-bold text-white">
								{score}/{totalRounds * 100}
							</div>
							<div class="text-sm text-gray-300">Total Score</div>
						</div>
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-2xl font-bold text-white">
								{roundHistory.filter((r) => r.correct).length}/{totalRounds}
							</div>
							<div class="text-sm text-gray-300">Correct Answers</div>
						</div>
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-2xl font-bold text-white">
								{Math.round(
									(roundHistory.filter((r) => r.correct).length / totalRounds) *
										100
								)}%
							</div>
							<div class="text-sm text-gray-300">Accuracy</div>
						</div>
					</div>
					<div class="mb-4">
						<div class="text-lg font-semibold text-yellow-200">
							{#if score >= 800}
								🏆 Outstanding! Master level panning skills!
							{:else if score >= 600}
								🥇 Excellent work! Great ear for panning!
							{:else if score >= 400}
								🥈 Good job! Keep practicing!
							{:else if score >= 200}
								🥉 Nice effort! Room for improvement!
							{:else}
								💪 Keep practicing! You'll get there!
							{/if}
						</div>
					</div>
					<details class="mt-4 text-left">
						<summary
							class="cursor-pointer text-center text-blue-200 hover:text-blue-100"
							>View Round Details</summary
						>
						<div class="mt-4 max-h-64 overflow-y-auto">
							{#each roundHistory as round, i}
								<div class="mb-2 rounded bg-white/5 p-3 text-sm">
									<div class="flex items-center justify-between">
										<span>Round {i + 1}:</span>
										<span
											class={round.correct
												? 'text-green-400'
												: 'text-red-400'}
										>
											{round.points} pts
										</span>
									</div>
									<div class="text-xs text-gray-400">
										Target: {Math.round(round.actualPan * 100)}% • Your guess: {Math.round(
											round.userGuess * 100
										)}% • Accuracy: {Math.round(
											(1 - Math.abs(round.actualPan - round.userGuess)) * 100
										)}%
									</div>
								</div>
							{/each}
						</div>
					</details>
				</div>
			</section>
		{/if}

		<!-- Round Result -->
		{#if showResult && !gameCompleted}
			<section class="mb-8">
				<div
					class="rounded-xl p-6 text-center {isCorrect
						? 'border border-green-500 bg-green-600/20'
						: 'border border-red-500 bg-red-600/20'}"
				>
					<p
						class="text-xl font-semibold {isCorrect
							? 'text-green-200'
							: 'text-red-200'}"
					>
						{resultMessage}
					</p>
					<p class="mt-2 text-sm text-gray-300">
						{#if currentRound < totalRounds}
							Next round starting automatically...
						{:else}
							Calculating final score...
						{/if}
					</p>
				</div>
			</section>
		{/if}

		<!-- Audio Status -->
		{#if isPlaying}
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

	canvas {
		display: block;
	}
</style>

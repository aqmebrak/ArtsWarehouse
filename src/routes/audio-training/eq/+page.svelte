<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let audioContext: AudioContext | null;
	let audioBuffer: AudioBuffer | null;
	let sampleFiles: string[] = [];
	let currentSampleIndex = 0;
	let source: AudioBufferSourceNode | null;
	let eqFilter: BiquadFilterNode | null;
	let highShelf: BiquadFilterNode | null; // For cutting high frequencies when boosting low
	let lowShelf: BiquadFilterNode | null; // For cutting low frequencies when boosting high
	let gainNode: GainNode | null; // For bypass routing
	let eqBypass = false; // A/B toggle state
	let isPlaying = false;
	let currentFrequency = 0; // The boosted frequency in Hz
	let userGuess: number | null = null;
	let showResult = false;
	let resultMessage = '';
	let isCorrect = false;
	let hoveredFrequency: string | null = null;
	let mouseX = 0;
	let mouseY = 0;

	// Gamification system
	let currentRound = 0;
	let totalRounds = 10;
	let score = 0;
	let roundHistory: Array<{
		correct: boolean;
		points: number;
		actualFreq: number;
		userGuess: number;
	}> = [];
	let gameCompleted = false;
	let gameStarted = false;

	const CANVAS_WIDTH = 800;
	const CANVAS_HEIGHT = 120;
	const MIN_FREQUENCY = 100; // Hz
	const MAX_FREQUENCY = 8000; // Hz
	const BASE_MARGIN_PERCENT = 0.15; // 15% margin for logarithmic scaling

	// Common frequencies to choose from for more realistic EQ training
	const EQ_FREQUENCIES = [
		100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
		5000, 6300, 8000
	];

	onMount(() => {
		initCanvas();
		initAudio();
	});

	function initCanvas() {
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;
		ctx = canvas.getContext('2d');
		drawFrequencySpectrum();
	}

	function drawFrequencySpectrum() {
		if (!ctx) return;

		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Background
		ctx.fillStyle = '#1f2937';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw frequency spectrum curve (logarithmic scale)
		ctx.strokeStyle = '#374151';
		ctx.lineWidth = 1;

		// Grid lines for major frequencies
		const majorFreqs = [100, 200, 500, 1000, 2000, 5000, 8000];
		majorFreqs.forEach((freq) => {
			const x = freqToX(freq);
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
			const x = freqToX(freq);
			let label = freq < 1000 ? `${freq}` : `${freq / 1000}k`;
			ctx.fillText(label, x, 20);
		});

		// Frequency range labels
		ctx.fillStyle = '#9ca3af';
		ctx.font = '10px Inter, sans-serif';
		ctx.fillText($t('audioTraining.eq.lowFreq'), 60, CANVAS_HEIGHT - 10);
		ctx.fillText($t('audioTraining.eq.midFreq'), CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);
		ctx.fillText($t('audioTraining.eq.highFreq'), CANVAS_WIDTH - 60, CANVAS_HEIGHT - 10);

		// Show hovered frequency following mouse cursor
		if (hoveredFrequency !== null && mouseX > 0 && mouseY > 0) {
			// Create background for better readability
			ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			ctx.font = 'bold 14px Inter, sans-serif';
			const textWidth = ctx.measureText(hoveredFrequency).width;
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
			ctx.fillStyle = '#10b981';
			ctx.textAlign = 'left';
			ctx.fillText(hoveredFrequency, textX, textY - padding / 2);

			// Draw vertical green bar at mouse X position
			ctx.strokeStyle = '#10b981';
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
			ctx.globalAlpha = 0.7;
			ctx.beginPath();
			ctx.moveTo(mouseX, 25);
			ctx.lineTo(mouseX, CANVAS_HEIGHT - 25);
			ctx.stroke();
			ctx.globalAlpha = 1.0; // Reset alpha
		}

		// Show result if available
		if (showResult && userGuess !== null) {
			// Show tolerance range around the actual frequency
			const toleranceHz = getLogarithmicMargin(currentFrequency);
			const minToleranceFreq = Math.max(MIN_FREQUENCY, currentFrequency - toleranceHz);
			const maxToleranceFreq = Math.min(MAX_FREQUENCY, currentFrequency + toleranceHz);

			const minToleranceX = freqToX(minToleranceFreq);
			const maxToleranceX = freqToX(maxToleranceFreq);

			// Draw tolerance range as a semi-transparent rectangle
			ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'; // Purple with low opacity
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
			const userX = freqToX(userGuess);
			ctx.strokeStyle = isCorrect ? '#10b981' : '#ef4444';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(userX, 25);
			ctx.lineTo(userX, CANVAS_HEIGHT - 25);
			ctx.stroke();

			// Actual answer line
			const actualX = freqToX(currentFrequency);
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

	// Convert frequency to X coordinate (logarithmic scale)
	function freqToX(frequency: number): number {
		const logMin = Math.log(MIN_FREQUENCY);
		const logMax = Math.log(MAX_FREQUENCY);
		const logFreq = Math.log(frequency);
		return ((logFreq - logMin) / (logMax - logMin)) * CANVAS_WIDTH;
	}

	// Convert X coordinate to frequency (logarithmic scale)
	function xToFreq(x: number): number {
		const logMin = Math.log(MIN_FREQUENCY);
		const logMax = Math.log(MAX_FREQUENCY);
		const logFreq = logMin + (x / CANVAS_WIDTH) * (logMax - logMin);
		return Math.exp(logFreq);
	}

	async function initAudio() {
		try {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();

			// Define available sample files
			sampleFiles = [
				'819268__fax_drummer__amen-break-174-bpm-detruit.wav',
				'819417__fax_drummer__drum-and-bass-break-179-bpm.wav',
				'819463__fax_drummer__drum-and-bass-178-bpm-2.wav',
				'75313__oymaldonado__bluesy-rock-guitar1.wav',
				'325611__shadydave__my-love-piano-loop.mp3'
			];

			// Load a random sample for this round
			await loadRandomSample();
		} catch (error) {
			console.error('Failed to initialize audio:', error);
		}
	}

	async function loadRandomSample() {
		try {
			if (!audioContext || sampleFiles.length === 0) return;

			// Pick a random sample
			currentSampleIndex = Math.floor(Math.random() * sampleFiles.length);
			const samplePath = `/audio-training/samples/${sampleFiles[currentSampleIndex]}`;

			// Fetch and decode the audio file
			const response = await fetch(samplePath);
			if (!response.ok) {
				throw new Error(`Failed to load sample: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			console.log(`Loaded sample: ${sampleFiles[currentSampleIndex]}`);
		} catch (error) {
			console.error('Failed to load audio sample:', error);
			// Fallback: generate a simple tone if sample loading fails
			generateFallbackAudio();
		}
	}

	function generateFallbackAudio() {
		if (!audioContext) return;

		// Fallback: simple drum-like sound
		const sampleRate = audioContext.sampleRate;
		const duration = 2;
		const frameCount = sampleRate * duration;

		audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
		const channelData = audioBuffer.getChannelData(0);

		for (let i = 0; i < frameCount; i++) {
			const t = i / sampleRate;
			// Simple kick + snare pattern
			let sample = 0;

			// Kick drum at beat 1 and 3
			const kickTime = t % 1;
			if (kickTime < 0.1) {
				sample += Math.sin(2 * Math.PI * 60 * t) * Math.exp(-kickTime * 30) * 0.8;
			}

			// Snare at beat 2 and 4
			const snareTime = (t + 0.5) % 1;
			if (snareTime < 0.05) {
				sample += (Math.random() - 0.5) * Math.exp(-snareTime * 50) * 0.4;
			}

			channelData[i] = sample;
		}
	}

	function generateRandomFrequency() {
		// Choose a random frequency from the EQ_FREQUENCIES array
		const randomIndex = Math.floor(Math.random() * EQ_FREQUENCIES.length);
		currentFrequency = EQ_FREQUENCIES[randomIndex];
	}

	function getLogarithmicMargin(frequency: number): number {
		// Calculate margin as a percentage of the frequency for logarithmic scaling
		// This ensures consistent perceptual accuracy across the frequency spectrum
		return frequency * BASE_MARGIN_PERCENT;
	}

	function calculatePoints(difference: number, targetFrequency: number): number {
		// Use logarithmic margin based on the target frequency
		const maxDifference = getLogarithmicMargin(targetFrequency);
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
		if (!audioContext) {
			await initAudio();
		} else if (audioContext.state === 'suspended') {
			await audioContext.resume();
		}

		if (!gameStarted) {
			startNewGame();
			return;
		}

		// Load a new random sample for each round
		await loadRandomSample();

		generateRandomFrequency();
		resetResult();

		// Create source, EQ filter, and gain node for bypass routing
		source = audioContext.createBufferSource();
		eqFilter = audioContext.createBiquadFilter();
		highShelf = audioContext.createBiquadFilter();
		lowShelf = audioContext.createBiquadFilter();
		gainNode = audioContext.createGain();

		source.buffer = audioBuffer;
		source.loop = true;

		// Set up main EQ filter (peaking filter with significant boost)
		eqFilter.type = 'peaking';
		eqFilter.frequency.setValueAtTime(currentFrequency, audioContext.currentTime);
		eqFilter.gain.setValueAtTime(15, audioContext.currentTime); // More aggressive 15dB boost
		eqFilter.Q.setValueAtTime(3, audioContext.currentTime); // Higher Q for more focus

		// Set up complementary filters to make the boost more obvious
		if (currentFrequency < 1000) {
			// For low frequency boosts, cut some highs to make the boost more apparent
			highShelf.type = 'highshelf';
			highShelf.frequency.setValueAtTime(2000, audioContext.currentTime);
			highShelf.gain.setValueAtTime(-6, audioContext.currentTime); // 6dB cut
		} else {
			// For high frequency boosts, cut some lows to make the boost more apparent
			lowShelf.type = 'lowshelf';
			lowShelf.frequency.setValueAtTime(500, audioContext.currentTime);
			lowShelf.gain.setValueAtTime(-6, audioContext.currentTime); // 6dB cut
		}

		// Connect nodes - always route through both paths
		source.connect(gainNode); // Direct path (bypass)

		// EQ chain: source -> main EQ -> complementary filter -> destination
		source.connect(eqFilter);
		if (currentFrequency < 1000) {
			eqFilter.connect(highShelf);
		} else {
			eqFilter.connect(lowShelf);
		}

		// Control which path is active
		updateEQBypass();

		source.start();
		isPlaying = true;
	}

	function updateEQBypass() {
		if (!gainNode || !eqFilter || !audioContext) return;

		if (eqBypass) {
			// Bypass mode: route direct signal, disconnect EQ chain
			gainNode.connect(audioContext.destination);
			if (highShelf) highShelf.disconnect();
			if (lowShelf) lowShelf.disconnect();
		} else {
			// EQ mode: route through EQ chain, mute direct signal
			gainNode.disconnect();
			if (currentFrequency < 1000 && highShelf) {
				highShelf.connect(audioContext.destination);
			} else if (currentFrequency >= 1000 && lowShelf) {
				lowShelf.connect(audioContext.destination);
			}
		}
	}

	function toggleEQBypass() {
		if (!isPlaying) return;
		eqBypass = !eqBypass;
		updateEQBypass();
	}

	function stopExercise() {
		if (source) {
			source.stop();
			source = null;
		}
		if (eqFilter) {
			eqFilter.disconnect();
			eqFilter = null;
		}
		if (highShelf) {
			highShelf.disconnect();
			highShelf = null;
		}
		if (lowShelf) {
			lowShelf.disconnect();
			lowShelf = null;
		}
		if (gainNode) {
			gainNode.disconnect();
			gainNode = null;
		}
		eqBypass = false; // Reset bypass state
		isPlaying = false;
	}

	function skipRound() {
		// Add a skipped round to history with 0 points
		roundHistory = [
			...roundHistory,
			{
				correct: false,
				points: 0,
				actualFreq: currentFrequency,
				userGuess: 0 // 0 indicates skipped
			}
		];

		stopExercise();

		// Show brief feedback for skipped round
		showResult = true;
		isCorrect = false;
		resultMessage = `Skipped! The boosted frequency was ${
			currentFrequency < 1000
				? `${currentFrequency}Hz`
				: `${(currentFrequency / 1000).toFixed(1)}kHz`
		}`;

		drawFrequencySpectrum();

		// Auto-advance to next round after a shorter delay
		setTimeout(() => {
			if (currentRound < totalRounds) {
				startNextRound();
			} else {
				gameCompleted = true;
			}
		}, 2000);
	}

	function resetResult() {
		showResult = false;
		userGuess = null;
		resultMessage = '';
		isCorrect = false;
		drawFrequencySpectrum();
	}

	function handleCanvasClick(event: MouseEvent) {
		if (!isPlaying) return;

		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;

		// Convert click position to frequency
		userGuess = xToFreq(x);

		// Check if guess is correct (within logarithmic margin of error)
		const difference = Math.abs(userGuess - currentFrequency);
		const allowedMargin = getLogarithmicMargin(currentFrequency);
		isCorrect = difference <= allowedMargin;

		// Calculate points based on accuracy with logarithmic scaling
		const points = calculatePoints(difference, currentFrequency);
		score += points;

		// Add to round history
		roundHistory.push({
			correct: isCorrect,
			points: points,
			actualFreq: currentFrequency,
			userGuess: userGuess
		});

		if (isCorrect) {
			const marginHz = Math.round(allowedMargin);
			resultMessage = `${$t('audioTraining.eq.correctGuess')} (+${points} points) [±${marginHz}Hz tolerance]`;
		} else {
			const freqLabel =
				currentFrequency < 1000
					? `${currentFrequency}Hz`
					: `${(currentFrequency / 1000).toFixed(1)}kHz`;
			const marginHz = Math.round(allowedMargin);
			const diffHz = Math.round(difference);
			resultMessage = `${$t('audioTraining.eq.incorrectGuess')} ${freqLabel} (+${points} points) [±${marginHz}Hz tolerance, you were ${diffHz}Hz off]`;
		}

		showResult = true;
		stopExercise();
		drawFrequencySpectrum();

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

		// Convert mouse position to frequency
		const frequency = Math.round(xToFreq(x));
		const freqLabel =
			frequency < 1000 ? `${frequency}Hz` : `${(frequency / 1000).toFixed(1)}kHz`;

		hoveredFrequency = freqLabel;
		drawFrequencySpectrum();
	}

	function handleCanvasMouseLeave() {
		hoveredFrequency = null;
		mouseX = 0;
		mouseY = 0;
		drawFrequencySpectrum();
	}
</script>

<svelte:head>
	<title>{$t('audioTraining.eq.title')} - {$t('audioTraining.title')}</title>
	<meta name="description" content={$t('audioTraining.eq.description')} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 px-4 py-12">
	<div class="mx-auto max-w-5xl">
		<!-- Header -->
		<header class="mb-8 text-center">
			<nav class="mb-4">
				<a
					href="/audio-training"
					class="inline-flex items-center text-green-300 hover:text-green-200"
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
			<p class="text-xl text-green-200">{$t('audioTraining.eq.description')}</p>
		</header>

		<!-- Instructions -->
		<section class="mb-8 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
			<h2 class="mb-4 text-2xl font-semibold text-white">Instructions</h2>
			<div class="space-y-3 text-gray-200">
				<p>{$t('audioTraining.eq.instructions')}</p>
				<p class="text-sm text-green-200">• {$t('audioTraining.eq.marginError')}</p>
				<p class="text-sm text-green-200">
					• Listen to musical triads (major/minor chords) with one frequency boosted
				</p>
				<p class="text-sm text-green-200">
					• Use the A/B toggle to compare original vs EQ-boosted audio
				</p>
				<p class="text-sm text-green-200">
					• Hover over the spectrum to see frequency values
				</p>
				<p class="text-sm text-green-200">
					• Identify the boosted frequency and click to guess
				</p>
			</div>
		</section>

		<!-- Game Status -->
		{#if gameStarted && !gameCompleted}
			<section class="mb-6">
				<div class="flex justify-center gap-8 text-center">
					<div class="rounded-lg border border-green-500 bg-green-600/20 px-4 py-2">
						<div class="text-sm text-green-200">Round</div>
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
						Ready to test your EQ skills? Complete 10 rounds and get your score!
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
						class="rounded-lg bg-green-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700"
					>
						Start New Challenge
					</button>
				</div>
			{:else}
				<div class="flex flex-col items-center gap-4">
					<!-- A/B Toggle Button (only shown when audio is playing) -->
					{#if isPlaying}
						<div class="rounded-lg border border-blue-500 bg-blue-600/20 p-4">
							<div class="mb-2 text-center text-sm text-blue-200">A/B Compare</div>
							<button
								on:click={toggleEQBypass}
								class="rounded-lg px-6 py-2 font-semibold text-white transition-all duration-200 {eqBypass
									? 'bg-gray-600 hover:bg-gray-700'
									: 'bg-blue-600 hover:bg-blue-700'}"
							>
								{eqBypass ? 'A (Original)' : 'B (EQ Boosted)'}
							</button>
							<div class="mt-2 text-center text-xs text-gray-300">
								Toggle to compare original vs boosted audio
							</div>
						</div>
					{/if}

					<div class="inline-flex gap-4">
						<button
							on:click={skipRound}
							disabled={!isPlaying}
							class="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Skip Round
						</button>
					</div>
				</div>
			{/if}
		</section>

		<!-- Frequency Spectrum -->
		<section class="mb-8">
			<h3 class="mb-4 text-center text-xl font-semibold text-white">
				{$t('audioTraining.eq.clickToGuess')}
			</h3>

			<div class="flex justify-center">
				<div class="relative">
					<canvas
						bind:this={canvas}
						on:click={handleCanvasClick}
						on:mousemove={handleCanvasMouseMove}
						on:mouseleave={handleCanvasMouseLeave}
						class="cursor-pointer rounded-lg border-2 border-gray-600 bg-gray-800 transition-colors hover:border-green-400"
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
					<div class="h-3 w-3 rounded bg-green-500"></div>
					<span>Frequency Marker</span>
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
						<span>Boosted Frequency</span>
					</div>
					<div class="flex items-center gap-2">
						<div
							class="h-3 w-3 rounded border border-dashed border-purple-400 bg-purple-500/20"
						></div>
						<span
							>Tolerance Range (±{Math.round(
								getLogarithmicMargin(currentFrequency)
							)}Hz)</span
						>
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
								🏆 Outstanding! Master level EQ skills!
							{:else if score >= 600}
								🥇 Excellent work! Great ear for frequencies!
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
							class="cursor-pointer text-center text-green-200 hover:text-green-100"
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
										Target: {round.actualFreq < 1000
											? `${round.actualFreq}Hz`
											: `${(round.actualFreq / 1000).toFixed(1)}kHz`} • Your guess:
										{Math.round(round.userGuess) < 1000
											? `${Math.round(round.userGuess)}Hz`
											: `${(Math.round(round.userGuess) / 1000).toFixed(1)}kHz`}
										• Diff: {Math.round(
											Math.abs(round.actualFreq - round.userGuess)
										)}Hz
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
					<span>
						{eqBypass ? 'Playing Original Audio (A)' : 'Playing EQ Boosted Audio (B)'} -
						Listen for differences
					</span>
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

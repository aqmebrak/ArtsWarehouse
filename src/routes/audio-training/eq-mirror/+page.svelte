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
	let gainNode: GainNode | null;

	// EQ Filters for the 4 bands
	let eqFilters: BiquadFilterNode[] = [];
	let targetFilters: BiquadFilterNode[] = []; // Target EQ to match

	let isPlaying = false;
	let showTarget = false; // A/B comparison with target
	let currentRound = 0;
	let totalRounds = 5;
	let score = 0;
	let gameCompleted = false;
	let gameStarted = false;
	let showResult = false;
	let resultMessage = '';

	// EQ Parameters for 4 bands
	interface EQBand {
		frequency: number;
		gain: number;
		q: number;
	}

	let userEQ: EQBand[] = [
		{ frequency: 200, gain: 0, q: 1 },
		{ frequency: 800, gain: 0, q: 1 },
		{ frequency: 3200, gain: 0, q: 1 },
		{ frequency: 8000, gain: 0, q: 1 }
	];

	let targetEQ: EQBand[] = [
		{ frequency: 200, gain: 0, q: 1 },
		{ frequency: 800, gain: 0, q: 1 },
		{ frequency: 3200, gain: 0, q: 1 },
		{ frequency: 8000, gain: 0, q: 1 }
	];

	// Available frequencies and Q values
	const FREQUENCIES = [
		100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
		5000, 6300, 8000
	];
	const Q_VALUES = [0.5, 0.7, 1.0, 1.4, 2.0, 2.8, 4.0, 5.6, 8.0];
	const GAIN_RANGE = { min: -12, max: 12, step: 1 };

	// Canvas settings
	const CANVAS_WIDTH = 800;
	const CANVAS_HEIGHT = 300;
	const MIN_FREQUENCY = 20;
	const MAX_FREQUENCY = 20000;

	onMount(() => {
		initCanvas();
		initAudio();
	});

	function initCanvas() {
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;
		ctx = canvas.getContext('2d');
		drawEQCurve();
	}

	function drawEQCurve() {
		if (!ctx) return;

		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Background
		ctx.fillStyle = '#1f2937';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Grid lines
		ctx.strokeStyle = '#374151';
		ctx.lineWidth = 1;

		// Frequency grid (logarithmic)
		const majorFreqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
		majorFreqs.forEach((freq) => {
			if (freq >= MIN_FREQUENCY && freq <= MAX_FREQUENCY) {
				const x = freqToX(freq);
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, CANVAS_HEIGHT);
				ctx.stroke();
			}
		});

		// Gain grid (linear)
		for (let gain = -12; gain <= 12; gain += 3) {
			const y = gainToY(gain);
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(CANVAS_WIDTH, y);
			ctx.stroke();
		}

		// Zero dB line (more prominent)
		ctx.strokeStyle = '#6b7280';
		ctx.lineWidth = 2;
		const zeroY = gainToY(0);
		ctx.beginPath();
		ctx.moveTo(0, zeroY);
		ctx.lineTo(CANVAS_WIDTH, zeroY);
		ctx.stroke();

		// Frequency labels
		ctx.fillStyle = '#e5e7eb';
		ctx.font = '12px Inter, sans-serif';
		ctx.textAlign = 'center';
		majorFreqs.forEach((freq) => {
			if (freq >= MIN_FREQUENCY && freq <= MAX_FREQUENCY) {
				const x = freqToX(freq);
				let label = freq < 1000 ? `${freq}` : `${freq / 1000}k`;
				ctx.fillText(label, x, CANVAS_HEIGHT - 10);
			}
		});

		// Gain labels
		ctx.textAlign = 'right';
		for (let gain = -12; gain <= 12; gain += 6) {
			const y = gainToY(gain);
			ctx.fillText(`${gain > 0 ? '+' : ''}${gain}dB`, CANVAS_WIDTH - 10, y - 5);
		}

		// Draw EQ response curve
		if (showTarget) {
			drawResponseCurve(targetEQ, '#ef4444', 'Target EQ');
		} else {
			drawResponseCurve(userEQ, '#10b981', 'Your EQ');
		}

		// Draw band markers
		userEQ.forEach((band, index) => {
			const x = freqToX(band.frequency);
			const y = gainToY(band.gain);

			// Band circle
			ctx.fillStyle = showTarget ? '#ef4444' : '#10b981';
			ctx.beginPath();
			ctx.arc(x, y, 6, 0, 2 * Math.PI);
			ctx.fill();

			// Band number
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 12px Inter, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`${index + 1}`, x, y + 4);
		});
	}

	function drawResponseCurve(eq: EQBand[], color: string, label: string) {
		if (!ctx) return;

		ctx.strokeStyle = color;
		ctx.lineWidth = 3;
		ctx.beginPath();

		for (let x = 0; x <= CANVAS_WIDTH; x += 2) {
			const freq = xToFreq(x);
			let totalGain = 0;

			// Calculate combined response from all bands
			eq.forEach((band) => {
				if (band.gain !== 0) {
					const response = calculatePeakingResponse(
						freq,
						band.frequency,
						band.gain,
						band.q
					);
					totalGain += response;
				}
			});

			// Clamp gain to display range
			totalGain = Math.max(-15, Math.min(15, totalGain));
			const y = gainToY(totalGain);

			if (x === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}

		ctx.stroke();
	}

	function calculatePeakingResponse(
		freq: number,
		centerFreq: number,
		gain: number,
		q: number
	): number {
		if (gain === 0) return 0; // No processing if gain is 0

		// Normalized frequency (0 to π)
		const w = (2 * Math.PI * freq) / 44100;
		const w0 = (2 * Math.PI * centerFreq) / 44100;

		// Convert gain from dB to linear
		const A = Math.pow(10, gain / 20);
		const alpha = Math.sin(w0) / (2 * q);

		// Peaking filter coefficients
		const b0 = 1 + alpha * A;
		const b1 = -2 * Math.cos(w0);
		const b2 = 1 - alpha * A;
		const a0 = 1 + alpha / A;
		const a1 = -2 * Math.cos(w0);
		const a2 = 1 - alpha / A;

		// Frequency response magnitude
		const cos_w = Math.cos(w);
		const sin_w = Math.sin(w);

		const num_real = b0 + b1 * cos_w + b2 * Math.cos(2 * w);
		const num_imag = b1 * sin_w + b2 * Math.sin(2 * w);
		const den_real = a0 + a1 * cos_w + a2 * Math.cos(2 * w);
		const den_imag = a1 * sin_w + a2 * Math.sin(2 * w);

		const num_mag = Math.sqrt(num_real * num_real + num_imag * num_imag);
		const den_mag = Math.sqrt(den_real * den_real + den_imag * den_imag);

		const magnitude = num_mag / den_mag;

		// Convert to dB
		return 20 * Math.log10(magnitude);
	}

	function freqToX(frequency: number): number {
		const logMin = Math.log(MIN_FREQUENCY);
		const logMax = Math.log(MAX_FREQUENCY);
		const logFreq = Math.log(frequency);
		return ((logFreq - logMin) / (logMax - logMin)) * CANVAS_WIDTH;
	}

	function xToFreq(x: number): number {
		const logMin = Math.log(MIN_FREQUENCY);
		const logMax = Math.log(MAX_FREQUENCY);
		const logFreq = logMin + (x / CANVAS_WIDTH) * (logMax - logMin);
		return Math.exp(logFreq);
	}

	function gainToY(gain: number): number {
		// Map gain (-15 to +15 dB) to canvas height
		return CANVAS_HEIGHT - ((gain + 15) / 30) * CANVAS_HEIGHT;
	}

	function yToGain(y: number): number {
		return ((CANVAS_HEIGHT - y) / CANVAS_HEIGHT) * 30 - 15;
	}

	async function initAudio() {
		try {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();

			sampleFiles = [
				'819268__fax_drummer__amen-break-174-bpm-detruit.wav',
				'819417__fax_drummer__drum-and-bass-break-179-bpm.wav',
				'819463__fax_drummer__drum-and-bass-178-bpm-2.wav'
			];

			await loadRandomSample();
		} catch (error) {
			console.error('Failed to initialize audio:', error);
		}
	}

	async function loadRandomSample() {
		try {
			if (!audioContext || sampleFiles.length === 0) return;

			currentSampleIndex = Math.floor(Math.random() * sampleFiles.length);
			const samplePath = `/audio-training/samples/${sampleFiles[currentSampleIndex]}`;

			const response = await fetch(samplePath);
			if (!response.ok) {
				throw new Error(`Failed to load sample: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
		} catch (error) {
			console.error('Failed to load audio sample:', error);
			generateFallbackAudio();
		}
	}

	function generateFallbackAudio() {
		if (!audioContext) return;

		const sampleRate = audioContext.sampleRate;
		const duration = 4;
		const frameCount = sampleRate * duration;

		audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
		const channelData = audioBuffer.getChannelData(0);

		// Generate pink noise for better EQ demonstration
		let b0 = 0,
			b1 = 0,
			b2 = 0,
			b3 = 0,
			b4 = 0,
			b5 = 0,
			b6 = 0;
		for (let i = 0; i < frameCount; i++) {
			const white = Math.random() * 2 - 1;
			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.969 * b2 + white * 0.153852;
			b3 = 0.8665 * b3 + white * 0.3104856;
			b4 = 0.55 * b4 + white * 0.5329522;
			b5 = -0.7616 * b5 - white * 0.016898;
			const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			b6 = white * 0.115926;
			channelData[i] = pink * 0.11;
		}
	}

	function generateRandomTarget() {
		// Generate a random but musical EQ curve
		const patterns = [
			// V-shape (smile EQ)
			[
				{ gain: 6, q: 1.0 },
				{ gain: -3, q: 0.7 },
				{ gain: -2, q: 0.7 },
				{ gain: 4, q: 1.4 }
			],
			// High cut
			[
				{ gain: 0, q: 1.0 },
				{ gain: 0, q: 1.0 },
				{ gain: -4, q: 1.0 },
				{ gain: -8, q: 0.7 }
			],
			// Presence boost
			[
				{ gain: 0, q: 1.0 },
				{ gain: 0, q: 1.0 },
				{ gain: 5, q: 2.0 },
				{ gain: 0, q: 1.0 }
			],
			// Low cut with mid boost
			[
				{ gain: -6, q: 0.7 },
				{ gain: 3, q: 1.4 },
				{ gain: 0, q: 1.0 },
				{ gain: 0, q: 1.0 }
			],
			// Telephone effect
			[
				{ gain: -10, q: 0.5 },
				{ gain: 6, q: 2.0 },
				{ gain: 4, q: 2.0 },
				{ gain: -8, q: 0.7 }
			]
		];

		const pattern = patterns[Math.floor(Math.random() * patterns.length)];

		targetEQ.forEach((band, index) => {
			// Randomize frequency within reasonable range for each band
			const freqRanges = [
				[100, 315], // Low
				[400, 1250], // Low-mid
				[1600, 5000], // High-mid
				[6300, 8000] // High
			];

			const [minFreq, maxFreq] = freqRanges[index];
			const availableFreqs = FREQUENCIES.filter((f) => f >= minFreq && f <= maxFreq);

			band.frequency = availableFreqs[Math.floor(Math.random() * availableFreqs.length)];
			band.gain = pattern[index].gain;
			band.q = pattern[index].q;
		});
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

		await loadRandomSample();
		generateRandomTarget();
		resetUserEQ();

		// Create audio chain
		source = audioContext.createBufferSource();
		gainNode = audioContext.createGain();

		// Create user EQ filters
		eqFilters = [];
		targetFilters = [];

		for (let i = 0; i < 4; i++) {
			// User EQ chain
			const userFilter = audioContext.createBiquadFilter();
			userFilter.type = 'peaking';
			updateFilterFromBand(userFilter, userEQ[i]);
			eqFilters.push(userFilter);

			// Target EQ chain
			const targetFilter = audioContext.createBiquadFilter();
			targetFilter.type = 'peaking';
			updateFilterFromBand(targetFilter, targetEQ[i]);
			targetFilters.push(targetFilter);
		}

		source.buffer = audioBuffer;
		source.loop = true;

		// Connect user EQ chain
		connectEQChain();

		source.start();
		isPlaying = true;
		showResult = false;
		drawEQCurve();
	}

	function connectEQChain() {
		if (!source || !gainNode || !audioContext) return;

		// Disconnect everything first
		try {
			source.disconnect();
			gainNode.disconnect();
			eqFilters.forEach((filter) => filter.disconnect());
			targetFilters.forEach((filter) => filter.disconnect());
		} catch (e) {
			// Ignore disconnect errors
		}

		if (showTarget) {
			// Route through target EQ
			let currentNode: AudioNode = source;
			targetFilters.forEach((filter) => {
				currentNode.connect(filter);
				currentNode = filter;
			});
			currentNode.connect(gainNode);
		} else {
			// Route through user EQ
			let currentNode: AudioNode = source;
			eqFilters.forEach((filter) => {
				currentNode.connect(filter);
				currentNode = filter;
			});
			currentNode.connect(gainNode);
		}

		gainNode.connect(audioContext.destination);
	}

	function updateFilterFromBand(filter: BiquadFilterNode, band: EQBand) {
		if (!audioContext) return;

		filter.frequency.setValueAtTime(band.frequency, audioContext.currentTime);
		filter.gain.setValueAtTime(band.gain, audioContext.currentTime);
		filter.Q.setValueAtTime(band.q, audioContext.currentTime);
	}

	function updateBand(bandIndex: number, property: keyof EQBand, value: number) {
		userEQ[bandIndex][property] = value as any;

		if (eqFilters[bandIndex]) {
			updateFilterFromBand(eqFilters[bandIndex], userEQ[bandIndex]);
		}

		drawEQCurve();
	}

	function toggleTarget() {
		if (!isPlaying) return;
		showTarget = !showTarget;
		connectEQChain();
		drawEQCurve();
	}

	function stopExercise() {
		if (source) {
			source.stop();
			source = null;
		}
		eqFilters.forEach((filter) => filter.disconnect());
		targetFilters.forEach((filter) => filter.disconnect());
		if (gainNode) {
			gainNode.disconnect();
			gainNode = null;
		}
		eqFilters = [];
		targetFilters = [];
		isPlaying = false;
		showTarget = false;
	}

	function resetUserEQ() {
		userEQ.forEach((band) => {
			band.gain = 0;
			band.q = 1.0;
			// Keep frequencies as they are
		});
	}

	function submitGuess() {
		if (!isPlaying) return;

		// Calculate accuracy based on how close the user EQ matches target EQ
		let totalError = 0;
		let maxPossibleError = 0;

		userEQ.forEach((userBand, index) => {
			const targetBand = targetEQ[index];

			// Frequency error (logarithmic scale)
			const freqError = Math.abs(
				Math.log(userBand.frequency) - Math.log(targetBand.frequency)
			);
			const maxFreqError = Math.log(MAX_FREQUENCY) - Math.log(MIN_FREQUENCY);

			// Gain error
			const gainError = Math.abs(userBand.gain - targetBand.gain);
			const maxGainError = GAIN_RANGE.max - GAIN_RANGE.min;

			// Q error (logarithmic scale)
			const qError = Math.abs(Math.log(userBand.q) - Math.log(targetBand.q));
			const maxQError = Math.log(Math.max(...Q_VALUES)) - Math.log(Math.min(...Q_VALUES));

			// Weighted combination (gain is most important)
			const bandError =
				(gainError / maxGainError) * 0.6 +
				(freqError / maxFreqError) * 0.3 +
				(qError / maxQError) * 0.1;

			totalError += bandError;
			maxPossibleError += 1; // Each band contributes max 1.0 to error
		});

		const accuracy = Math.max(0, 1 - totalError / maxPossibleError);
		const points = Math.round(accuracy * 100);
		score += points;

		showResult = true;
		resultMessage = `Round ${currentRound}: ${Math.round(accuracy * 100)}% accuracy (+${points} points)`;

		stopExercise();

		// Auto-advance after delay
		setTimeout(() => {
			if (currentRound < totalRounds) {
				startNextRound();
			} else {
				gameCompleted = true;
			}
		}, 3000);
	}

	function startNewGame() {
		currentRound = 0;
		score = 0;
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
		showResult = false;
		startExercise();
	}

	function skipRound() {
		showResult = true;
		resultMessage = `Skipped round ${currentRound}`;
		stopExercise();

		setTimeout(() => {
			if (currentRound < totalRounds) {
				startNextRound();
			} else {
				gameCompleted = true;
			}
		}, 2000);
	}
</script>

<svelte:head>
	<title>EQ Mirror Exercise - Audio Training</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<header class="mb-8 text-center">
			<h1 class="mb-4 text-4xl font-bold text-white">EQ Mirror Exercise</h1>
			<p class="text-xl text-purple-200">
				Match the target EQ settings by adjusting the 4-band equalizer
			</p>
		</header>

		<!-- Game Status -->
		{#if gameStarted && !gameCompleted}
			<section class="mb-6">
				<div class="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
					<div class="flex items-center justify-between">
						<div class="text-white">
							<span class="text-lg font-semibold"
								>Round {currentRound}/{totalRounds}</span
							>
							<span class="ml-4 text-purple-200"
								>Score: {score}/{totalRounds * 100}</span
							>
						</div>

						<div class="flex gap-4">
							{#if isPlaying}
								<button
									on:click={toggleTarget}
									class="rounded-lg {showTarget
										? 'bg-red-600 hover:bg-red-700'
										: 'bg-blue-600 hover:bg-blue-700'} px-4 py-2 font-semibold text-white transition-colors"
								>
									{showTarget ? 'Your EQ' : 'Target EQ'}
								</button>

								<button
									on:click={submitGuess}
									class="rounded-lg bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"
								>
									Submit Match
								</button>

								<button
									on:click={skipRound}
									class="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
								>
									Skip Round
								</button>
							{/if}
						</div>
					</div>

					{#if showResult}
						<div class="mt-4 rounded-lg bg-purple-600/30 p-4">
							<p class="text-center text-lg font-semibold text-white">
								{resultMessage}
							</p>
						</div>
					{/if}
				</div>
			</section>
		{/if}

		<!-- Start Game -->
		{#if !gameStarted}
			<section class="mb-8 text-center">
				<button
					on:click={startNewGame}
					class="rounded-xl bg-gradient-to-r from-green-500 to-teal-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105"
				>
					Start EQ Mirror Challenge
				</button>
			</section>
		{/if}

		<!-- EQ Interface -->
		{#if isPlaying || showResult}
			<section class="mb-8">
				<!-- EQ Curve Display -->
				<div class="mb-6 rounded-xl bg-gray-800/50 p-6">
					<h3 class="mb-4 text-center text-xl font-semibold text-white">
						{showTarget ? 'Target EQ Response' : 'Your EQ Response'}
					</h3>
					<div class="flex justify-center">
						<canvas
							bind:this={canvas}
							class="rounded-lg border-2 border-gray-600 bg-gray-900"
						></canvas>
					</div>
				</div>

				<!-- EQ Controls -->
				<div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
					{#each userEQ as band, index}
						<div class="rounded-xl bg-gray-800/70 p-4">
							<h4 class="mb-4 text-center text-lg font-bold text-white">
								Band {index + 1}
							</h4>

							<!-- Frequency -->
							<div class="mb-4">
								<label class="mb-2 block text-sm font-semibold text-gray-300">
									Frequency
								</label>
								<select
									bind:value={band.frequency}
									on:change={() => updateBand(index, 'frequency', band.frequency)}
									class="w-full rounded-lg bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
								>
									{#each FREQUENCIES as freq}
										<option value={freq}>
											{freq < 1000 ? `${freq} Hz` : `${freq / 1000} kHz`}
										</option>
									{/each}
								</select>
							</div>

							<!-- Gain -->
							<div class="mb-4">
								<label class="mb-2 block text-sm font-semibold text-gray-300">
									Gain: {band.gain > 0 ? '+' : ''}{band.gain} dB
								</label>
								<input
									type="range"
									min={GAIN_RANGE.min}
									max={GAIN_RANGE.max}
									step={GAIN_RANGE.step}
									bind:value={band.gain}
									on:input={() => updateBand(index, 'gain', band.gain)}
									class="w-full accent-purple-500"
								/>
							</div>

							<!-- Q -->
							<div>
								<label class="mb-2 block text-sm font-semibold text-gray-300">
									Q Factor
								</label>
								<select
									bind:value={band.q}
									on:change={() => updateBand(index, 'q', band.q)}
									class="w-full rounded-lg bg-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
								>
									{#each Q_VALUES as q}
										<option value={q}>{q}</option>
									{/each}
								</select>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Final Score -->
		{#if gameCompleted}
			<section class="mb-8">
				<div class="rounded-xl border border-yellow-500 bg-yellow-600/20 p-8 text-center">
					<h2 class="mb-4 text-3xl font-bold text-yellow-200">Challenge Complete! 🎉</h2>
					<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-2xl font-bold text-white">
								{score}/{totalRounds * 100}
							</div>
							<div class="text-sm text-gray-300">Total Score</div>
						</div>
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-2xl font-bold text-white">
								{Math.round((score / (totalRounds * 100)) * 100)}%
							</div>
							<div class="text-sm text-gray-300">Average Accuracy</div>
						</div>
					</div>
					<button
						on:click={() => {
							gameStarted = false;
							gameCompleted = false;
							currentRound = 0;
							score = 0;
						}}
						class="rounded-xl bg-gradient-to-r from-green-500 to-teal-500 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105"
					>
						Play Again
					</button>
				</div>
			</section>
		{/if}

		<!-- Instructions -->
		<section class="mb-8">
			<div class="rounded-xl bg-white/5 p-6 backdrop-blur-sm">
				<h2 class="mb-4 text-2xl font-semibold text-white">Instructions</h2>
				<div class="text-gray-300">
					<p class="mb-2">
						Listen to the target EQ by clicking "Target EQ", then adjust your 4-band
						equalizer to match it.
					</p>
					<p class="mb-2">Use the A/B toggle to compare your settings with the target.</p>
					<p>
						Each band controls Frequency, Gain (-12 to +12 dB), and Q factor
						(resonance).
					</p>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		height: 6px;
		border-radius: 3px;
		background: #374151;
		outline: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #8b5cf6;
		cursor: pointer;
		border: 2px solid #ffffff;
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #8b5cf6;
		cursor: pointer;
		border: 2px solid #ffffff;
	}
</style>

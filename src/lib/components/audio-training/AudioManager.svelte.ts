import sampleFiles from '$lib/audio-training/samples';

export class AudioManager {
	audioContext = $state<AudioContext | null>(null);
	audioBuffer = $state<AudioBuffer | null>(null);
	source = $state<AudioBufferSourceNode | null>(null);
	isPlaying = $state<boolean>(false);

	initialize = async (): Promise<void> => {
		try {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			await this.loadRandomSample();
		} catch (error) {
			console.error('Failed to initialize audio:', error);
		}
	};

	loadRandomSample = async (): Promise<void> => {
		try {
			if (!this.audioContext || sampleFiles.length === 0) return;

			const randomIndex = Math.floor(Math.random() * sampleFiles.length);
			const samplePath = sampleFiles[randomIndex];

			const response = await fetch(samplePath);
			if (!response.ok) {
				throw new Error(`Failed to load sample: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

			console.log(`Loaded sample: ${samplePath}`);
		} catch (error) {
			console.error('Failed to load audio sample:', error);
			this.generateFallbackAudio();
		}
	};

	private generateFallbackAudio = (): void => {
		if (!this.audioContext) return;

		const sampleRate = this.audioContext.sampleRate;
		const duration = 4;
		const frameCount = sampleRate * duration;

		this.audioBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
		const channelData = this.audioBuffer.getChannelData(0);

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
	};

	generatePinkNoise = async (): Promise<void> => {
		this.generateFallbackAudio();
	};

	resumeIfSuspended = async (): Promise<void> => {
		if (this.audioContext?.state === 'suspended') {
			await this.audioContext.resume();
		}
	};

	createSource = (): AudioBufferSourceNode | null => {
		if (!this.audioContext || !this.audioBuffer) {
			console.warn('AudioContext or AudioBuffer not available');
			return null;
		}

		this.stop();

		this.source = this.audioContext.createBufferSource();
		this.source.buffer = this.audioBuffer;
		this.source.loop = true;

		return this.source;
	};

	startSource = (): boolean => {
		if (!this.source || this.isPlaying) {
			console.warn('No source available or already playing');
			return false;
		}

		try {
			this.source.start();
			this.isPlaying = true;
			return true;
		} catch (error) {
			console.error('Error starting audio source:', error);
			this.isPlaying = false;
			return false;
		}
	};

	stop = (): void => {
		if (this.source) {
			console.log('stop');
			try {
				if (this.isPlaying) {
					this.source.stop();
				}
			} catch (error) {
				console.warn('Error stopping audio source:', error);
			}
			try {
				this.source.disconnect();
			} catch (error) {
				console.warn('Error disconnecting audio source:', error);
			}
			this.source = null;
			this.isPlaying = false;
		}
	};

	disconnect = (): void => {
		this.stop();
	};

	cleanup = (): void => {
		this.stop();
		if (this.audioContext?.state !== 'closed') {
			this.audioContext?.close();
		}
	};
}

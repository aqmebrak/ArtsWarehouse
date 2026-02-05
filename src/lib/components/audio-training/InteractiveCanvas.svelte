<script lang="ts">
	import { CanvasUtils } from '$lib/utils/audio-training/canvas-utils';
	import type { Snippet } from 'svelte';

	interface Props {
		width: number;
		height: number;
		onCanvasClick?: (event: MouseEvent) => void;
		onCanvasMouseMove?: (event: MouseEvent) => void;
		onCanvasMouseLeave?: () => void;
		disabled?: boolean;
		className?: string;
		disabledOverlay?: Snippet;
		overlay?: Snippet;
	}

	let {
		width,
		height,
		onCanvasClick,
		onCanvasMouseMove,
		onCanvasMouseLeave,
		disabled = false,
		className = '',
		disabledOverlay,
		overlay
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;

	$effect(() => {
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext('2d');
			// Call custom draw function if provided through slot props
		}
	});

	function handleClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (onCanvasClick) {
			onCanvasClick(event);
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (disabled) {
			return;
		}
		if (onCanvasMouseMove) {
			onCanvasMouseMove(event);
		}
	}

	function handleMouseLeave() {
		if (disabled) {
			return;
		}
		if (onCanvasMouseLeave) {
			onCanvasMouseLeave();
		}
	}

	// Expose canvas and context for parent components
	export function getCanvas(): HTMLCanvasElement {
		return canvas;
	}

	export function getContext(): CanvasRenderingContext2D | null {
		return ctx;
	}

	export function drawBackground(bgColor: string = '#1f2937'): void {
		if (ctx) {
			CanvasUtils.drawBackground(ctx, width, height, bgColor);
		}
	}

	export function drawGrid(gridColor: string = '#374151'): void {
		if (ctx) {
			CanvasUtils.drawGrid(ctx, width, height, gridColor);
		}
	}

	export function clear(): void {
		if (ctx) {
			ctx.clearRect(0, 0, width, height);
		}
	}
</script>

<div class="flex justify-center">
	<div class="relative">
		<canvas
			bind:this={canvas}
			class="cursor-pointer rounded-lg border-2 border-gray-600 bg-gray-800 transition-colors hover:border-green-400 {className} {disabled
				? 'cursor-not-allowed opacity-50'
				: ''}"
			style="max-width: 100%; height: auto;"
			onclick={handleClick}
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
		></canvas>

		{#if disabled}
			<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
				{#if disabledOverlay}
					{@render disabledOverlay()}
				{:else}
					<p class="font-semibold text-white">Start the exercise to begin</p>
				{/if}
			</div>
		{/if}

		<!-- Custom overlay content -->
		{#if overlay}
			{@render overlay()}
		{/if}
	</div>
</div>

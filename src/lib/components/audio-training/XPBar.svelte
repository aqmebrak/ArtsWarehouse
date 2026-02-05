<script lang="ts">
	import { getLevelProgress, formatXP, getLevelColor } from '$lib/utils/audio-training/xp-system';

	let {
		totalXP = 0,
		showDetails = true,
		class: className = ''
	}: {
		totalXP?: number;
		showDetails?: boolean;
		class?: string;
	} = $props();

	let progress = $derived(getLevelProgress(totalXP));
	let colors = $derived(getLevelColor(progress.currentLevel));
</script>

<div class={`xp-bar ${className}`}>
	{#if showDetails}
		<div class="xp-header">
			<span
				class="level-badge"
				style="background: linear-gradient(135deg, {colors.gradient});"
			>
				Level {progress.currentLevel}
			</span>
			<span class="xp-text">
				{formatXP(progress.xpIntoCurrentLevel)} / {formatXP(progress.xpForNextLevel)} XP
			</span>
		</div>
	{/if}

	<div class="progress-container">
		<div
			class="progress-bar"
			style="width: {progress.progressPercentage}%; background: linear-gradient(90deg, {colors.gradient});"
		></div>
	</div>

	{#if showDetails && !progress.isMaxLevel}
		<div class="progress-text">
			{progress.progressPercentage.toFixed(1)}% to Level {progress.currentLevel + 1}
		</div>
	{:else if progress.isMaxLevel}
		<div class="progress-text max-level">🏆 Max Level Reached!</div>
	{/if}
</div>

<style>
	.xp-bar {
		width: 100%;
	}

	.xp-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.level-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		color: white;
		font-weight: 600;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.xp-text {
		color: rgb(203 213 225);
		font-weight: 500;
	}

	.progress-container {
		width: 100%;
		height: 1.5rem;
		background-color: rgb(30 41 59);
		border-radius: 9999px;
		overflow: hidden;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 9999px;
		position: relative;
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
	}

	.progress-bar::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0) 50%,
			rgba(0, 0, 0, 0.1) 100%
		);
	}

	.progress-text {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: rgb(148 163 184);
		text-align: center;
	}

	.progress-text.max-level {
		color: rgb(168 85 247);
		font-weight: 600;
	}

	@media (prefers-color-scheme: dark) {
		/* Already using dark theme, no changes needed */
	}
</style>

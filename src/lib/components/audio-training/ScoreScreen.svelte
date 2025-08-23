<script lang="ts">
	import type { GameState, RoundResult } from './types';

	interface Props {
		gameState: GameState;
		roundHistory: RoundResult[];
		onPlayAgain: () => void;
		customStats?: Array<{
			label: string;
			value: string | number;
		}>;
	}

	let { gameState, roundHistory, onPlayAgain, customStats = [] }: Props = $props();

	const correctAnswers = $derived(roundHistory.filter((r) => r.correct).length);
	const accuracy = $derived(
		roundHistory.length > 0 ? Math.round((correctAnswers / roundHistory.length) * 100) : 0
	);
	const averagePoints = $derived(
		roundHistory.length > 0 ? Math.round(gameState.score / roundHistory.length) : 0
	);

	function getPerformanceRating(
		score: number,
		maxScore: number
	): { message: string; emoji: string } {
		const percentage = (score / maxScore) * 100;

		if (percentage >= 90)
			return { message: 'Outstanding! Master level performance!', emoji: '🏆' };
		if (percentage >= 80) return { message: 'Excellent work! Great skills!', emoji: '🥇' };
		if (percentage >= 70) return { message: 'Good job! Keep practicing!', emoji: '🥈' };
		if (percentage >= 60) return { message: 'Not bad! Room for improvement!', emoji: '🥉' };
		return { message: "Keep practicing! You'll get better!", emoji: '💪' };
	}

	const performanceRating = $derived(
		getPerformanceRating(gameState.score, gameState.totalRounds * 100)
	);
</script>

{#if gameState.gameCompleted}
	<section class="mb-8">
		<div class="rounded-xl border border-yellow-500 bg-yellow-600/20 p-8 text-center">
			<h2 class="mb-4 text-3xl font-bold text-yellow-200">Challenge Complete! 🎉</h2>

			<!-- Performance Rating -->
			<div class="mb-6">
				<div class="text-2xl">{performanceRating.emoji}</div>
				<p class="text-lg font-semibold text-yellow-200">{performanceRating.message}</p>
			</div>

			<!-- Main Stats Grid -->
			<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				<div class="rounded-lg bg-white/10 p-4">
					<div class="text-2xl font-bold text-white">
						{gameState.score}/{gameState.totalRounds * 100}
					</div>
					<div class="text-sm text-gray-300">Total Score</div>
				</div>

				<div class="rounded-lg bg-white/10 p-4">
					<div class="text-2xl font-bold text-white">
						{correctAnswers}/{gameState.totalRounds}
					</div>
					<div class="text-sm text-gray-300">Correct Answers</div>
				</div>

				<div class="rounded-lg bg-white/10 p-4">
					<div class="text-2xl font-bold text-white">{accuracy}%</div>
					<div class="text-sm text-gray-300">Accuracy</div>
				</div>

				<div class="rounded-lg bg-white/10 p-4">
					<div class="text-2xl font-bold text-white">{averagePoints}</div>
					<div class="text-sm text-gray-300">Avg Points</div>
				</div>
			</div>

			<!-- Custom Stats -->
			{#if customStats.length > 0}
				<div
					class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-{Math.min(
						customStats.length,
						3
					)}"
				>
					{#each customStats as stat}
						<div class="rounded-lg bg-white/10 p-4">
							<div class="text-xl font-bold text-white">{stat.value}</div>
							<div class="text-sm text-gray-300">{stat.label}</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Round-by-Round Breakdown -->
			<details class="mb-6 text-left">
				<summary
					class="cursor-pointer text-lg font-semibold text-yellow-200 hover:text-yellow-100"
				>
					View Round-by-Round Results
				</summary>
				<div class="mt-4 space-y-2">
					{#each roundHistory as result, index}
						<div class="flex items-center justify-between rounded-lg bg-white/5 p-3">
							<span class="text-white">Round {index + 1}</span>
							<span class="text-sm text-gray-300">
								{#if result.userGuess === 0}
									Skipped
								{:else}
									{result.correct ? '✓' : '✗'} {result.points} pts
								{/if}
							</span>
						</div>
					{/each}
				</div>
			</details>

			<!-- Play Again Button -->
			<button
				onclick={onPlayAgain}
				class="rounded-xl bg-gradient-to-r from-green-500 to-teal-500 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105"
			>
				Play Again
			</button>
		</div>
	</section>
{/if}

<script lang="ts">
	import type { GameState } from './types';

	interface Props {
		gameState: GameState;
		onStartGame: () => void;
		onSkipRound: () => void;
		showABToggle?: boolean;
		abState?: boolean;
		onABToggle?: () => void;
		customActions?: Array<{
			label: string;
			onClick: () => void;
			variant?: 'primary' | 'secondary' | 'danger';
			disabled?: boolean;
		}>;
	}

	let {
		gameState,
		onStartGame,
		onSkipRound,
		showABToggle = false,
		abState = false,
		onABToggle,
		customActions = []
	}: Props = $props();
</script>

<!-- Game Status Bar -->
{#if gameState.gameStarted && !gameState.gameCompleted}
	<section class="mb-6">
		<div class="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<div class="text-white">
					<span class="text-lg font-semibold"
						>Round {gameState.currentRound}/{gameState.totalRounds}</span
					>
					<span class="ml-4 text-purple-200"
						>Score: {gameState.score}/{gameState.totalRounds * 100}</span
					>
				</div>

				<div class="flex gap-4">
					<!-- A/B Toggle -->
					{#if showABToggle && onABToggle}
						<button
							onclick={onABToggle}
							class="rounded-lg {abState
								? 'bg-red-600 hover:bg-red-700'
								: 'bg-blue-600 hover:bg-blue-700'} px-4 py-2 font-semibold text-white transition-colors"
						>
							{abState ? 'Original' : 'Modified'}
						</button>
					{/if}

					<!-- Custom Actions -->
					{#each customActions as action}
						<button
							onclick={action.onClick}
							disabled={action.disabled}
							class="rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50
								{action.variant === 'danger'
								? 'bg-red-600 hover:bg-red-700'
								: action.variant === 'secondary'
									? 'bg-gray-600 hover:bg-gray-700'
									: 'bg-green-600 hover:bg-green-700'}"
						>
							{action.label}
						</button>
					{/each}

					<!-- Skip Round -->
					<button
						onclick={onSkipRound}
						class="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700"
					>
						Skip Round
					</button>
				</div>
			</div>

			<!-- Result Message -->
			{#if gameState.showResult && gameState.resultMessage}
				<div class="mt-4 rounded-lg bg-purple-600/30 p-4">
					<p class="text-center text-lg font-semibold text-white">
						{gameState.resultMessage}
					</p>
				</div>
			{/if}
		</div>
	</section>
{/if}

<!-- Start Game Button -->
{#if !gameState.gameStarted}
	<section class="mb-8 text-center">
		<button
			onclick={onStartGame}
			class="rounded-xl bg-gradient-to-r from-green-500 to-teal-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105"
		>
			<slot name="start-button">Start Challenge</slot>
		</button>
	</section>
{/if}

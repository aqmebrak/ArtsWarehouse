<script lang="ts">
	import AchievementToast from './AchievementToast.svelte';

	type ToastData = {
		id: string;
		achievementId: string;
		xpReward: number;
	};

	let toasts = $state<ToastData[]>([]);

	export function showAchievementToast(achievementId: string, xpReward: number = 100) {
		const id = `${achievementId}-${Date.now()}`;
		toasts = [...toasts, { id, achievementId, xpReward }];
	}

	function removeToast(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}
</script>

<!-- Toast Container -->
<div class="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-3 p-4">
	{#each toasts as toast (toast.id)}
		<AchievementToast
			achievementId={toast.achievementId}
			xpReward={toast.xpReward}
			onClose={() => removeToast(toast.id)}
		/>
	{/each}
</div>

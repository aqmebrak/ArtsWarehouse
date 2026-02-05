<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
	<div class="mx-auto max-w-5xl p-4 sm:p-6">
		<!-- Back to Menu Button -->
		<div class="mb-6">
			<a
				href={resolve('/audio-training')}
				class="group inline-flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700/50 hover:text-white"
			>
				<svg
					class="h-4 w-4 transition-transform group-hover:-translate-x-1"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Back to Menu
			</a>
		</div>

		<!-- Exercise Content -->
		{@render children?.()}
	</div>
</div>

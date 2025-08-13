<script lang="ts">
	import { fade } from 'svelte/transition';
	import { modals } from '$lib/store/modals';

	interface Props {
		id?: string;
		children?: import('svelte').Snippet;
	}

	let { id = '', children }: Props = $props();

	let modalsState = $state();
	let outerClickTarget = $state();
	let background = $state();
	let wrap = $state();
	//transition
	let transitionBg = fade;
	let transitionBgProps = { duration: 250 };

	modals.subscribe((m) => {
		modalsState = m[id];
	});

	const close = () => modals.update((modalsPrev) => ({ ...modalsPrev, [id]: false }));

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	};

	const handleOuterMousedown = (event: Event) => {
		if (event.target === background || event.target === wrap) outerClickTarget = event.target;
	};

	const handleOuterMouseup = (event: Event) => {
		if (event.target === outerClickTarget) {
			event.preventDefault();
			close();
		}
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if modalsState}
	<div
		role="button"
		tabindex="0"
		class="fixed top-0 left-0 z-50 flex h-screen w-screen flex-col justify-center bg-black/85"
		onmousedown={handleOuterMousedown}
		onmouseup={handleOuterMouseup}
		bind:this={background}
		transition:transitionBg={transitionBgProps}
	>
		<div class="relative m-auto max-h-screen" bind:this={wrap}>
			<div
				class="relative mx-auto my-8 max-h-full max-w-full bg-white text-black"
				role="dialog"
				aria-modal="true"
				transition:transitionBg={transitionBgProps}
			>
				<div class="relative overflow-auto p-4">
					{@render children?.()}
				</div>
				<button aria-label="close" onclick={close}>X</button>
			</div>
		</div>
	</div>
{/if}

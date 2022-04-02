<script>
	import '../app.css';
</script>

<div class="mt-2 flex flex-col items-center">
	<div class="flex flex-col items-center">
		<a class="title" href="/">No1yz Warehouse</a>
		<div class="line flex-1" />
	</div>
	<nav class="mt-4">
		<a href="/gallery">Gallery</a>
		<a href="/music">Music</a>
		<a href="/socials">Socials</a>
	</nav>
</div>

<slot />
<!-- svelte-ignore a11y-missing-attribute -->
<img src="https://app.piratepx.com/ship?p=f174aa78-4b94-4857-a367-cc1a1c89a61f" />

<style>
	.title {
		font-size: 3rem;
	}

	.line {
		height: 1px;
		width: 100%;
		border-top: 1px;
		border-color: var(--font-color-secondary);
		border-style: solid;
		margin-top: -4px;
	}

	nav > a {
		font-size: 1.4rem;
		letter-spacing: 4px;
		padding: 0 10px 0 10px;
	}
</style>

<script>
	import 'src/app.css';
</script>

<div class="mt-2 flex flex-col items-center">
	<div class="flex flex-col items-center">
		<a class="title" href="/">No1yz.art</a>
		<div class="line flex-1" />
	</div>
	<nav class="mt-4">
		<a href="/gallery">Paintings</a>
		<a href="/music">Music</a>
	</nav>
</div>

<slot />

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

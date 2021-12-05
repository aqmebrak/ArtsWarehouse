<script>
	import '../app.css';
</script>


<div class="mt-2 flex flex-col items-center">
	<div class="flex flex-col items-center">
		<a class="title" href="/">No1yz Warehouse</a>
		<div class="line flex-1"></div>
	</div>
	<nav class="mt-4">
		<a href="/gallery">Gallery</a>
		<a href="/music">Music</a>
		<a href="/socials">Socials</a>
	</nav>
</div>

<slot />


<style>
	.title {
		font-size: 48px;
	}

	.line{
		height: 1px;
		width: 100%;
		border-top: 1px;
		border-color: var(--font-color-secondary);
		border-style: solid;
		margin-top: -4px;
	}

	nav > a {
		font-size: 20px;
		letter-spacing: 4px;
		padding: 0 10px 0 10px;
	}
</style>
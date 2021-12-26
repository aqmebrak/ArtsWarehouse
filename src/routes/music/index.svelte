<script>
    import Player from '$src/components/Player.svelte';
    import musics from '$src/musics';

</script>


<div class="grid gap-4 grid-cols-3 grid-rows-3">
    {#each musics as music}
        {music}
    {/each} 
</div>


<Player/>
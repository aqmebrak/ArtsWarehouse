<script lang="ts">
   import images from '$src/images';

    
</script>


<div class="m-4 grid gap-4 grid-cols-7">
    {#each images as image}
        <img src={image} alt="img1"/>
    {/each}
</div>
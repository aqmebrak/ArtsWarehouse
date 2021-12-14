<script lang="ts">
   import Gallery from 'svelte-image-gallery';

   import images from '$src/images';
    
</script>


<div class="lg:m-20 sm:m-4 m-1">
  <Gallery gap={40} maxColumnWidth={450}>
    {#each images as image}
        <img src={image} alt="img1" class=""/>        
    {/each}

  </Gallery>
    
</div>


<style>
  :global(img) { opacity: .9; transition: all .2s }
	:global(img):hover { opacity: 1; transform: scale(1.04) }

</style>
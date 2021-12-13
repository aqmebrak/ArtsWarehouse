<script lang="ts">
   import images from '$src/images';

    
</script>


<div class="container">
    {#each images as image}
    <figure>
        <img src={image} alt="img1"/>        
    </figure>
    {/each}
</div>


<style>
img {
  max-width: 100%;
  display: block;
}

figure {
  margin: 0;
  margin-top: 2rem;
  display: grid;
  grid-template-rows: 1fr auto;
  break-inside: avoid;
}

figure > img {
  grid-row: 1 / -1;
  grid-column: 1;
}

.container {
    margin: auto;
  column-count: 3;
  column-gap: 2rem;
  margin-top: 4rem;
}
    
</style>
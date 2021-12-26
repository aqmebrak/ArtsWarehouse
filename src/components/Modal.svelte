<script lang="ts">
    import { modals } from '$src/store/modals';

    export let id = '';

    let modalsState;

    const unsubscribe = modals.subscribe(m => {
        console.log('modal events', m);
        modalsState = m[id];
    });


    const close = () => modals.update(modalsPrev => ({...modalsPrev, [id]: false,}))

    const handleKeydown = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        }
    }
    
</script>

<svelte:window on:keydown="{handleKeydown}" />
{#if modalsState}
<div class="bg">
    <div class="window-wrap">
        <div
          class="window"
          role="dialog"
          aria-modal="true"
        >
            <div class="content">
                <slot></slot>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    .bg {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.66);
  }

  .window-wrap {
    position: relative;
    margin: 2rem;
    max-height: 100%;
  }

  .window {
    position: relative;
    width: 40rem;
    max-width: 100%;
    max-height: 100%;
    margin: 2rem auto;
    color: black;
    border-radius: 0.5rem;
    background: white;
  }

  .content {
    position: relative;
    padding: 1rem;
    max-height: calc(100vh - 4rem);
    overflow: auto;
  }

</style>